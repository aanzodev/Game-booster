const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const DEVICE_NAMES = { windows: 'Windows PC', mac: 'Mac', linux: 'Linux', chromeos: 'Chromebook' };
let INFO = null;
let device = null;
let applied = store.get('applied', {});
let cleanScan = [];

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  const u = ['KB', 'MB', 'GB']; let i = -1;
  do { b /= 1024; i++; } while (b >= 1024 && i < 2);
  return b.toFixed(b < 10 ? 1 : 0) + ' ' + u[i];
}
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

let toastTimer;
function toast(msg, kind = 'ok', details) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast ' + kind;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 6000);
  if (details) { $('#logText').textContent = details; $('#log').classList.remove('hidden'); }
}
$('#logClose').onclick = () => $('#log').classList.add('hidden');

// ---------- navigation ----------
function go(page) {
  $$('.nav').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
  $$('.page').forEach((p) => p.classList.toggle('active', p.id === 'page-' + page));
}
$$('.nav').forEach((b) => (b.onclick = () => go(b.dataset.page)));
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-goto]');
  if (g) { e.preventDefault(); go(g.dataset.goto); }
});

// ---------- device ----------
function openDeviceModal() {
  $('#detectedText').textContent = `We detected: ${DEVICE_NAMES[INFO.detected]}. Pick it below (or change it).`;
  $$('.device').forEach((b) => b.classList.toggle('detected', b.dataset.device === INFO.detected));
  $('#deviceModal').classList.remove('hidden');
}
$$('.device').forEach((b) => (b.onclick = () => {
  device = b.dataset.device; store.set('device', device);
  $('#deviceModal').classList.add('hidden');
  renderAll();
}));
$('#deviceBtn').onclick = openDeviceModal;

function canRun() { return device === INFO.detected; }

// ---------- tweaks ----------
function tweaksFor(cat) { return (INFO.tweaks[device] || []).filter((t) => t.category === cat); }

function tweakHTML(t) {
  const isOn = !!applied[t.id];
  return `<div class="tweak ${isOn && !t.oneShot ? 'applied' : ''}" data-id="${t.id}">
    <div class="info">
      <div class="name">${esc(t.name)}
        ${t.recommended ? '<span class="pill rec">Recommended</span>' : ''}
        ${t.admin ? '<span class="pill admin">Needs admin</span>' : ''}
        ${t.reboot ? '<span class="pill">Restart needed</span>' : ''}
        <span class="pill impact">${esc(t.impact)}</span>
        ${isOn && !t.oneShot ? '<span class="pill ok">✓ Applied</span>' : ''}
      </div>
      <div class="desc">${esc(t.desc)}</div>
    </div>
    <div class="actions">
      ${isOn && t.canRevert ? '<button class="btn undo" data-act="revert">Undo</button>' : ''}
      <button class="btn" data-act="apply" ${canRun() ? '' : 'disabled title="Install the app on this device to run it"'}>${t.oneShot ? 'Run' : isOn ? 'Re-apply' : 'Apply'}</button>
    </div>
  </div>`;
}

function renderList(sel, cat) {
  const list = tweaksFor(cat);
  $(sel).innerHTML = list.length ? list.map(tweakHTML).join('') : '';
}

async function runTweaks(ids, action, btn) {
  if (!canRun()) return toast('Install Game Booster on this device to run its tweaks.', 'err');
  if (btn) btn.disabled = true;
  try {
    const r = await window.booster.runTweaks(ids, action);
    const all = INFO.tweaks[device];
    if (r.ok) {
      ids.forEach((id) => {
        const t = all.find((x) => x.id === id);
        if (action === 'apply' && t && !t.oneShot) applied[id] = true;
        if (action === 'revert') delete applied[id];
      });
    } else {
      // mark the ones that didn't fail
      ids.forEach((id) => {
        const t = all.find((x) => x.id === id);
        if (t && !t.oneShot && action === 'apply' && r.output && !r.output.includes(`FAILED [${t.name}]`) && !r.error) applied[id] = true;
      });
    }
    store.set('applied', applied);
    const msg = r.ok ? (action === 'revert' ? 'Restored to default.' : 'Done!') + (r.reboot ? ' Restart your computer to finish.' : '') : 'Some steps did not work. See details.';
    toast(msg, r.ok ? 'ok' : 'err', [r.output, r.error].filter(Boolean).join('\n') || null);
  } catch (e) {
    toast('Error: ' + e.message, 'err');
  }
  renderAll();
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('.tweak [data-act]');
  if (!b) return;
  runTweaks([b.closest('.tweak').dataset.id], b.dataset.act, b);
});

// ---------- home ----------
function renderHome() {
  $('#stats').innerHTML = [
    ['Device', DEVICE_NAMES[device]],
    ['Processor', `${INFO.cpu}`],
    ['Cores', INFO.cores],
    ['Memory', `${INFO.ramGB} GB (${INFO.freeGB} free)`]
  ].map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v" title="${esc(v)}">${esc(v)}</div></div>`).join('');
  const manual = INFO.manual[device] || [];
  $('#manualBox').classList.toggle('hidden', !manual.length);
  $('#manualBox').innerHTML = manual.length ? `<h3>Do these on your ${DEVICE_NAMES[device]}</h3><ul>${manual.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : '';
}

$('#boostAll').onclick = async (e) => {
  const btn = e.currentTarget;
  if (!canRun()) return toast('Install Game Booster on this device to run its tweaks.', 'err');
  btn.disabled = true; btn.textContent = 'Boosting…';
  const ids = INFO.tweaks[device].filter((t) => t.recommended).map((t) => t.id);
  await runTweaks(ids, 'apply');
  if (!cleanScan.length) cleanScan = await window.booster.scanClean();
  const r = await window.booster.runClean(cleanScan.filter((c) => c.on).map((c) => c.id));
  toast(`Boost complete. Freed ${fmtBytes(r.freed)} of junk.`, 'ok');
  btn.disabled = false; btn.textContent = '⚡ Boost now';
  scan();
};

// ---------- links ----------
function renderLinks() {
  $('#links').innerHTML = (INFO.links[device] || []).map((l) => `<button data-url="${esc(l.url)}">↗ ${esc(l.label)}</button>`).join('');
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-url]');
  if (b) window.booster.openLink(b.dataset.url);
});

// ---------- network ----------
function rate(v, good, ok) { return v <= good ? 'good' : v <= ok ? 'warn' : 'bad'; }
$('#pingBtn').onclick = async (e) => {
  const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'Testing…';
  const hosts = [['Cloudflare', '1.1.1.1'], ['Google', '8.8.8.8']];
  $('#pingResults').innerHTML = hosts.map(([n]) => `<div class="ping-card"><div class="hint">${n}</div><div class="big">…</div></div>`).join('');
  const res = await Promise.all(hosts.map(([, h]) => window.booster.ping(h)));
  $('#pingResults').innerHTML = res.map((r, i) => r.ok
    ? `<div class="ping-card"><div class="hint">${hosts[i][0]}</div>
        <div class="big ${rate(r.avg, 30, 70)}">${r.avg} ms</div>
        <div class="hint">Jitter <span class="${rate(r.jitter, 5, 15)}">${r.jitter} ms</span> · Loss <span class="${rate(r.loss, 0, 2)}">${r.loss}%</span> · ${r.min}–${r.max} ms</div></div>`
    : `<div class="ping-card"><div class="hint">${hosts[i][0]}</div><div class="big bad">Failed</div><div class="hint">No reply (blocked or offline)</div></div>`).join('');
  const ok = res.filter((r) => r.ok);
  let advice = 'Could not reach the test servers. Check your connection.';
  if (ok.length) {
    const j = Math.max(...ok.map((r) => r.jitter)), l = Math.max(...ok.map((r) => r.loss)), a = Math.min(...ok.map((r) => r.avg));
    if (l > 0) advice = 'Packet loss detected: this causes rubber-banding. Try Ethernet, restart your router, and check cables.';
    else if (j > 15) advice = 'High jitter (unstable ping). Usually Wi-Fi interference or someone else downloading. Ethernet fixes this best.';
    else if (a > 70) advice = 'Your base ping is high. That is mostly distance to servers and your provider; pick the closest game region.';
    else advice = 'Your connection looks good for gaming.';
  }
  $('#pingAdvice').textContent = advice;
  btn.disabled = false; btn.textContent = 'Run again';
};

// ---------- cleaner ----------
async function scan() {
  $('#scanBtn').disabled = true;
  $('#cleanList').innerHTML = '<p class="hint">Scanning…</p>';
  cleanScan = await window.booster.scanClean();
  const saved = store.get('cleanSel', null);
  if (saved) cleanScan.forEach((c) => (c.on = saved.includes(c.id)));
  renderClean();
  $('#scanBtn').disabled = false;
}
function renderClean() {
  $('#cleanList').innerHTML = cleanScan.map((c) => `<label class="clean-row">
    <input type="checkbox" data-clean="${c.id}" ${c.on ? 'checked' : ''}>
    <span>${esc(c.name)}<br><span class="hint">${esc(c.path)}</span></span>
    <span class="size">${fmtBytes(c.size)}</span></label>`).join('');
  const total = cleanScan.filter((c) => c.on).reduce((a, c) => a + c.size, 0);
  $('#cleanTotal').textContent = fmtBytes(total) + ' selected';
}
document.addEventListener('change', (e) => {
  const id = e.target.dataset && e.target.dataset.clean;
  if (!id) return;
  cleanScan.find((c) => c.id === id).on = e.target.checked;
  store.set('cleanSel', cleanScan.filter((c) => c.on).map((c) => c.id));
  renderClean();
});
$('#scanBtn').onclick = scan;
$('#cleanBtn').onclick = async (e) => {
  if (!cleanScan.length) await scan();
  const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'Cleaning…';
  const r = await window.booster.runClean(cleanScan.filter((c) => c.on).map((c) => c.id));
  toast(`Freed ${fmtBytes(r.freed)}.` + (r.skipped ? ` ${r.skipped} files were in use and skipped.` : ''), 'ok');
  btn.disabled = false; btn.textContent = 'Clean selected';
  scan();
};

// ---------- game guides ----------
let currentGame = 0;
function renderGames() {
  const G = window.GAME_GUIDES;
  $('#gameTabs').innerHTML = G.map((g, i) => `<button class="tab ${i === currentGame ? 'active' : ''}" data-game="${i}">${esc(g.name)}</button>`).join('');
  const g = G[currentGame];
  // Guide content is static text shipped with the app (contains simple <b>/<i> tags).
  $('#gameGuide').innerHTML = `<div class="card guide">
      <div class="row-between"><h2>${esc(g.name)}</h2><span class="pill rec">${esc(g.tag)}</span></div>
      <h3 class="mt">More FPS</h3><ul>${g.fps.map((x) => `<li>${x}</li>`).join('')}</ul>
      <h3 class="mt">Better quality</h3><ul>${g.quality.map((x) => `<li>${x}</li>`).join('')}</ul>
      <div class="fix mt">${g.fix}</div>
    </div>`;
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-game]');
  if (t) { currentGame = +t.dataset.game; renderGames(); }
});

// ---------- render ----------
function renderAll() {
  $('#deviceBtn').textContent = 'Device: ' + DEVICE_NAMES[device] + ' ▾';
  const mm = $('#mismatch');
  if (!canRun()) {
    mm.innerHTML = `You picked <b>${DEVICE_NAMES[device]}</b>, but this app is running on <b>${DEVICE_NAMES[INFO.detected]}</b>. You can browse the ${DEVICE_NAMES[device]} tweaks, but to apply them install Game Booster on that device.`;
    mm.classList.remove('hidden');
  } else mm.classList.add('hidden');
  renderHome();
  renderList('#fpsList', 'fps');
  renderList('#netList', 'network');
  renderList('#deepList', 'clean');
  renderLinks();
  renderGames();
}

(async function init() {
  INFO = await window.booster.getInfo();
  device = store.get('device', null);
  if (!device) { device = INFO.detected; renderAll(); openDeviceModal(); }
  else renderAll();
})();
