const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, spawn } = require('child_process');
const sudo = require('@vscode/sudo-prompt');

const TWEAKS = {
  windows: require('./tweaks/windows'),
  mac: require('./tweaks/mac'),
  linux: require('./tweaks/linux'),
  chromeos: require('./tweaks/chromeos')
};

function detectDevice() {
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'mac';
  // Chromebook Linux (Crostini) containers expose this marker file.
  if (fs.existsSync('/dev/.cros_milestone') || fs.existsSync('/opt/google/cros-containers')) return 'chromeos';
  return 'linux';
}
const DEVICE = detectDevice();
const HOME = os.homedir();

// ---------- running scripts ----------
function writeScript(device, body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gamebooster-'));
  const isWin = device === 'windows';
  const file = path.join(dir, isWin ? 'tweak.ps1' : 'tweak.sh');
  const content = (TWEAKS[device].prelude || '') + '\n' + body + '\n';
  fs.writeFileSync(file, isWin ? '﻿' + content.replace(/\n/g, '\r\n') : content, { mode: 0o700 });
  const cmd = isWin
    ? `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${file}"`
    : `/bin/bash "${file}"`;
  return { cmd, cleanup: () => fs.rm(dir, { recursive: true, force: true }, () => {}) };
}

function run(cmd, admin) {
  return new Promise((resolve) => {
    const done = (err, stdout, stderr) =>
      resolve({ ok: !err, output: String(stdout || '').trim(), error: err ? String(stderr || err.message).trim() : '' });
    if (!admin) return exec(cmd, { windowsHide: true, timeout: 180000 }, done);
    if (DEVICE === 'linux' || DEVICE === 'chromeos') {
      // Chromebook Linux has password-less sudo; try that first, then a GUI prompt.
      return exec(`sudo -n ${cmd}`, { timeout: 180000 }, (err, out, se) => {
        if (!err) return done(null, out, se);
        sudo.exec(cmd, { name: 'Game Booster' }, done);
      });
    }
    sudo.exec(cmd, { name: 'Game Booster' }, done);
  });
}

function findTweak(id) {
  return TWEAKS[DEVICE].find((t) => t.id === id);
}

ipcMain.handle('run-tweaks', async (_e, { ids, action }) => {
  const list = ids.map(findTweak).filter(Boolean).filter((t) => t[action]);
  if (!list.length) return { ok: false, error: 'These tweaks are for a different device than the one this app is running on.' };
  const isWin = DEVICE === 'windows';
  const wrap = (t) => isWin
    ? `try {\n${t[action]}\n} catch { Write-Output "FAILED [${t.name}]: $_" }`
    : `(\n${t[action]}\n) || echo "FAILED [${t.name}]"`;
  // One script for normal tweaks, one for admin tweaks => at most one password/UAC prompt.
  const results = [];
  for (const admin of [false, true]) {
    const group = list.filter((t) => !!t.admin === admin);
    if (!group.length) continue;
    const s = writeScript(DEVICE, group.map(wrap).join('\n'));
    const r = await run(s.cmd, admin);
    s.cleanup();
    results.push(r);
  }
  const output = results.map((r) => r.output).filter(Boolean).join('\n');
  const error = results.map((r) => r.error).filter(Boolean).join('\n');
  const failed = /FAILED \[/.test(output) || results.some((r) => !r.ok);
  return { ok: !failed, output, error, reboot: list.some((t) => t.reboot) };
});

ipcMain.handle('get-info', () => {
  const t = TWEAKS;
  const strip = (arr) => arr.map(({ apply, revert, ...rest }) => ({ ...rest, canRevert: !!revert }));
  return {
    detected: DEVICE,
    cpu: os.cpus()[0] ? os.cpus()[0].model : 'Unknown CPU',
    cores: os.cpus().length,
    ramGB: +(os.totalmem() / 1073741824).toFixed(1),
    freeGB: +(os.freemem() / 1073741824).toFixed(1),
    osName: `${os.type()} ${os.release()}`,
    tweaks: Object.fromEntries(Object.keys(t).map((k) => [k, strip(t[k])])),
    links: Object.fromEntries(Object.keys(t).map((k) => [k, t[k].links || []])),
    manual: Object.fromEntries(Object.keys(t).map((k) => [k, t[k].manual || []]))
  };
});

// ---------- cleaner ----------
function cleanTargets() {
  const L = process.env.LOCALAPPDATA || path.join(HOME, 'AppData', 'Local');
  if (DEVICE === 'windows') return [
    { id: 'tmp', name: 'Your temp files', path: os.tmpdir(), on: true },
    { id: 'crash', name: 'Crash dumps', path: path.join(L, 'CrashDumps'), on: true },
    { id: 'fnlogs', name: 'Fortnite logs & crash reports', path: path.join(L, 'FortniteGame', 'Saved', 'Logs'), on: true },
    { id: 'rblogs', name: 'Roblox logs', path: path.join(L, 'Roblox', 'logs'), on: true },
    { id: 'wer', name: 'Windows error reports', path: path.join(L, 'Microsoft', 'Windows', 'WER'), on: true },
    { id: 'thumbs', name: 'Thumbnail cache', path: path.join(L, 'Microsoft', 'Windows', 'Explorer'), on: false, filter: /^thumbcache_/ },
    { id: 'dx', name: 'DirectX shader cache (fix for stutter after driver update; games rebuild it)', path: path.join(L, 'D3DSCache'), on: false },
    { id: 'nv', name: 'NVIDIA shader cache (same as above)', path: path.join(L, 'NVIDIA', 'DXCache'), on: false },
    { id: 'amd', name: 'AMD shader cache (same as above)', path: path.join(L, 'AMD', 'DxCache'), on: false }
  ];
  if (DEVICE === 'mac') return [
    { id: 'caches', name: 'App caches (~/Library/Caches)', path: path.join(HOME, 'Library', 'Caches'), on: true },
    { id: 'logs', name: 'App logs (incl. Roblox)', path: path.join(HOME, 'Library', 'Logs'), on: true },
    { id: 'trash', name: 'Trash', path: path.join(HOME, '.Trash'), on: true },
    { id: 'tmp', name: 'Your temp files', path: os.tmpdir(), on: true }
  ];
  return [
    { id: 'thumbs', name: 'Thumbnail cache', path: path.join(HOME, '.cache', 'thumbnails'), on: true },
    { id: 'trash', name: 'Trash', path: path.join(HOME, '.local', 'share', 'Trash'), on: true },
    { id: 'steamshader', name: 'Steam shader cache (fix for stutter; rebuilt by games)', path: path.join(HOME, '.local', 'share', 'Steam', 'steamapps', 'shadercache'), on: false },
    { id: 'cache', name: 'All app caches (~/.cache)', path: path.join(HOME, '.cache'), on: false }
  ];
}

async function dirSize(p, filter, depth = 0) {
  let total = 0;
  let entries;
  try { entries = await fs.promises.readdir(p, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    if (depth === 0 && filter && !filter.test(e.name)) continue;
    const full = path.join(p, e.name);
    try {
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) total += await dirSize(full, null, depth + 1);
      else total += (await fs.promises.stat(full)).size;
    } catch { /* locked or gone */ }
  }
  return total;
}

ipcMain.handle('scan-clean', async () => {
  const targets = cleanTargets();
  for (const t of targets) { t.size = await dirSize(t.path, t.filter); delete t.filter; }
  return targets;
});

ipcMain.handle('run-clean', async (_e, ids) => {
  const targets = cleanTargets().filter((t) => ids.includes(t.id));
  let freed = 0, skipped = 0;
  for (const t of targets) {
    let entries = [];
    try { entries = await fs.promises.readdir(t.path, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (t.filter && !t.filter.test(e.name)) continue;
      if (e.name.startsWith('gamebooster-')) continue;
      const full = path.join(t.path, e.name);
      const size = e.isDirectory() && !e.isSymbolicLink() ? await dirSize(full) : await fs.promises.lstat(full).then((s) => s.size).catch(() => 0);
      try { await fs.promises.rm(full, { recursive: true, force: true, maxRetries: 1 }); freed += size; }
      catch { skipped++; } // file in use: leave it
    }
  }
  return { freed, skipped };
});

// ---------- ping test ----------
ipcMain.handle('ping', (_e, host) => new Promise((resolve) => {
  if (!/^[a-z0-9.\-]+$/i.test(host)) return resolve({ ok: false });
  const args = process.platform === 'win32' ? ['-n', '10', host] : ['-c', '10', host];
  const p = spawn('ping', args, { windowsHide: true });
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.on('error', () => resolve({ ok: false }));
  p.on('close', () => {
    const times = [...out.matchAll(/time[=<]\s*([\d.]+)\s*ms/gi)].map((m) => parseFloat(m[1]));
    if (!times.length) return resolve({ ok: false, loss: 100 });
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    let jitter = 0;
    for (let i = 1; i < times.length; i++) jitter += Math.abs(times[i] - times[i - 1]);
    jitter = times.length > 1 ? jitter / (times.length - 1) : 0;
    resolve({ ok: true, avg: Math.round(avg), min: Math.round(Math.min(...times)), max: Math.round(Math.max(...times)), jitter: Math.round(jitter), loss: Math.round(100 - (times.length / 10) * 100) });
  });
}));

ipcMain.handle('open-link', (_e, url) => {
  if (/^(https:|ms-settings:|x-apple\.systempreferences:)/.test(url)) shell.openExternal(url);
});

// ---------- window ----------
function createWindow() {
  const win = new BrowserWindow({
    width: 1180, height: 780, minWidth: 900, minHeight: 600,
    backgroundColor: '#0b0e14',
    title: 'Game Booster',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
