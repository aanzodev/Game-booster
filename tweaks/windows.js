// Windows tweaks. Each script runs as a PowerShell file.
// `admin: true` = needs a UAC prompt. `revert` restores Windows defaults.

const MMKEY = 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile';

module.exports = [
  {
    id: 'win_power', category: 'fps', recommended: true, admin: false,
    name: 'High / Ultimate Performance power plan',
    desc: 'Stops the CPU from down-clocking between frames. Helps most when CPU-bound (high FPS like 200+). Laptops: plug in.',
    impact: 'Small–medium FPS, better 1% lows',
    apply: `
$out = powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>$null
$g = ($out | Select-String -Pattern '[a-f0-9\\-]{36}').Matches.Value | Select-Object -First 1
if ($g) { powercfg -setactive $g; Write-Output "Ultimate Performance enabled" }
else { powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c; Write-Output "High Performance enabled" }`,
    revert: `powercfg -setactive 381b4222-f694-41f0-9685-ff5bb260df2e; Write-Output "Balanced plan restored"`
  },
  {
    id: 'win_gamemode', category: 'fps', recommended: true, admin: false,
    name: 'Turn on Windows Game Mode',
    desc: 'Gives the game priority and pauses Windows Update installs while playing.',
    impact: 'Small, steadier frametimes',
    apply: `Set-Reg 'HKCU:\\Software\\Microsoft\\GameBar' 'AutoGameModeEnabled' 1; Set-Reg 'HKCU:\\Software\\Microsoft\\GameBar' 'AllowAutoGameMode' 1; Write-Output "Game Mode on"`,
    revert: `Remove-ItemProperty 'HKCU:\\Software\\Microsoft\\GameBar' -Name AutoGameModeEnabled,AllowAutoGameMode -ErrorAction SilentlyContinue; Write-Output "Game Mode back to default"`
  },
  {
    id: 'win_gamedvr', category: 'fps', recommended: true, admin: false,
    name: 'Turn off Xbox background recording (Game DVR)',
    desc: 'Stops Windows from constantly recording gameplay in the background.',
    impact: 'Small–medium FPS on weaker GPUs',
    apply: `Set-Reg 'HKCU:\\System\\GameConfigStore' 'GameDVR_Enabled' 0; Set-Reg 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR' 'AppCaptureEnabled' 0; Write-Output "Background recording off"`,
    revert: `Set-Reg 'HKCU:\\System\\GameConfigStore' 'GameDVR_Enabled' 1; Set-Reg 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR' 'AppCaptureEnabled' 1; Write-Output "Background recording restored"`
  },
  {
    id: 'win_hags', category: 'fps', recommended: true, admin: true, reboot: true,
    name: 'Hardware-accelerated GPU scheduling',
    desc: 'Lets the GPU manage its own memory. Needed for DLSS Frame Generation. Needs a restart. Needs a GTX 1000 / RX 5000 or newer GPU.',
    impact: 'Small FPS, lower latency',
    apply: `Set-Reg 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers' 'HwSchMode' 2; Write-Output "HAGS on (restart required)"`,
    revert: `Set-Reg 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers' 'HwSchMode' 1; Write-Output "HAGS off (restart required)"`
  },
  {
    id: 'win_mmcss', category: 'fps', recommended: true, admin: true,
    name: 'Prioritize games in the multimedia scheduler',
    desc: 'Gives "Games" tasks higher CPU/GPU priority and reserves less CPU for background work.',
    impact: 'Small, smoother frametimes',
    apply: `
Set-Reg '${MMKEY}' 'SystemResponsiveness' 10
Set-Reg '${MMKEY}\\Tasks\\Games' 'GPU Priority' 8
Set-Reg '${MMKEY}\\Tasks\\Games' 'Priority' 6
Set-Reg '${MMKEY}\\Tasks\\Games' 'Scheduling Category' 'High' 'String'
Set-Reg '${MMKEY}\\Tasks\\Games' 'SFIO Priority' 'High' 'String'
Write-Output "Game scheduling priority raised"`,
    revert: `
Set-Reg '${MMKEY}' 'SystemResponsiveness' 20
Set-Reg '${MMKEY}\\Tasks\\Games' 'GPU Priority' 8
Set-Reg '${MMKEY}\\Tasks\\Games' 'Priority' 2
Set-Reg '${MMKEY}\\Tasks\\Games' 'Scheduling Category' 'Medium' 'String'
Set-Reg '${MMKEY}\\Tasks\\Games' 'SFIO Priority' 'Normal' 'String'
Write-Output "Scheduler defaults restored"`
  },
  {
    id: 'win_visual', category: 'fps', recommended: false, admin: false,
    name: 'Windows visual effects: best performance',
    desc: 'Turns off animations and shadows in Windows itself. Frees resources on low-end PCs; makes Windows look plainer. Sign out to apply.',
    impact: 'Low-end PCs only',
    apply: `Set-Reg 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects' 'VisualFXSetting' 2; Write-Output "Visual effects set to best performance (sign out to apply)"`,
    revert: `Set-Reg 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects' 'VisualFXSetting' 0; Write-Output "Visual effects back to default"`
  },
  {
    id: 'win_mouse', category: 'fps', recommended: true, admin: false,
    name: 'Turn off mouse acceleration',
    desc: 'Makes aim consistent: the same hand movement always turns the same amount. Sign out to apply.',
    impact: 'Better aim (no FPS change)',
    apply: `$p='HKCU:\\Control Panel\\Mouse'; Set-ItemProperty $p MouseSpeed '0'; Set-ItemProperty $p MouseThreshold1 '0'; Set-ItemProperty $p MouseThreshold2 '0'; Write-Output "Mouse acceleration off (sign out to apply)"`,
    revert: `$p='HKCU:\\Control Panel\\Mouse'; Set-ItemProperty $p MouseSpeed '1'; Set-ItemProperty $p MouseThreshold1 '6'; Set-ItemProperty $p MouseThreshold2 '10'; Write-Output "Mouse acceleration restored"`
  },

  // ---------- Network ----------
  {
    id: 'win_netthrottle', category: 'network', recommended: true, admin: true,
    name: 'Turn off network throttling',
    desc: 'Windows limits network packet processing while media plays. This removes that limit.',
    impact: 'Small, fewer lag spikes',
    apply: `Set-Reg '${MMKEY}' 'NetworkThrottlingIndex' 0xffffffff; Write-Output "Network throttling off"`,
    revert: `Set-Reg '${MMKEY}' 'NetworkThrottlingIndex' 10; Write-Output "Network throttling restored"`
  },
  {
    id: 'win_delivery', category: 'network', recommended: true, admin: true,
    name: 'Stop sharing Windows Updates with other PCs',
    desc: 'Windows can upload updates to strangers over your internet (Delivery Optimization). This uses your upload bandwidth and can cause lag.',
    impact: 'Fewer lag spikes on slow connections',
    apply: `Set-Reg 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DeliveryOptimization' 'DODownloadMode' 0; Write-Output "Update sharing off"`,
    revert: `Remove-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DeliveryOptimization' -Name DODownloadMode -ErrorAction SilentlyContinue; Write-Output "Update sharing back to default"`
  },
  {
    id: 'win_dns', category: 'network', recommended: false, admin: true,
    name: 'Use Cloudflare DNS (1.1.1.1)',
    desc: 'Faster, more reliable website and server lookups. Note: this does not lower in-game ping; it speeds up connecting and loading.',
    impact: 'Faster lookups, not lower ping',
    apply: `Get-NetAdapter -Physical | Where-Object Status -eq 'Up' | Set-DnsClientServerAddress -ServerAddresses 1.1.1.1,1.0.0.1; Clear-DnsClientCache; Write-Output "DNS set to 1.1.1.1"`,
    revert: `Get-NetAdapter -Physical | Set-DnsClientServerAddress -ResetServerAddresses; Clear-DnsClientCache; Write-Output "DNS back to automatic"`
  },
  {
    id: 'win_flushdns', category: 'network', recommended: true, admin: false, oneShot: true,
    name: 'Flush DNS cache',
    desc: 'Clears old saved addresses. Fixes "can\'t connect" problems.',
    impact: 'Fix',
    apply: `ipconfig /flushdns | Out-Null; Write-Output "DNS cache cleared"`
  },
  {
    id: 'win_netreset', category: 'network', recommended: false, admin: true, oneShot: true, reboot: true,
    name: 'Repair network stack',
    desc: 'Resets Winsock and TCP/IP. Use only if your internet is broken or very unstable. Needs a restart; VPN apps may need reinstalling.',
    impact: 'Repair tool',
    apply: `netsh winsock reset | Out-Null; netsh int ip reset | Out-Null; ipconfig /flushdns | Out-Null; Write-Output "Network stack reset (restart required)"`
  },

  // ---------- Deep clean ----------
  {
    id: 'win_deepclean', category: 'clean', recommended: true, admin: true, oneShot: true,
    name: 'Deep clean: Windows temp + update cache + Recycle Bin',
    desc: 'Deletes C:\\Windows\\Temp, downloaded Windows Update files that were already installed, and empties the Recycle Bin.',
    impact: 'Frees disk space',
    apply: `
Get-ChildItem "$env:WINDIR\\Temp" -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
Get-ChildItem "$env:WINDIR\\SoftwareDistribution\\Download" -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Start-Service wuauserv -ErrorAction SilentlyContinue
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
Write-Output "Deep clean finished"`
  }
];

module.exports.prelude = `
$ErrorActionPreference = 'Stop'
function Set-Reg($p, $n, $v, $t = 'DWord') {
  if (!(Test-Path $p)) { New-Item -Path $p -Force | Out-Null }
  New-ItemProperty -Path $p -Name $n -Value $v -PropertyType $t -Force | Out-Null
}
`;

module.exports.links = [
  { label: 'Startup apps (turn off what you don\'t need)', url: 'ms-settings:startupapps' },
  { label: 'Display: check your refresh rate (e.g. 144/240 Hz)', url: 'ms-settings:display-advanced' },
  { label: 'Graphics: set games to High-performance GPU', url: 'ms-settings:display-advancedgraphics' },
  { label: 'Storage settings', url: 'ms-settings:storagesense' },
  { label: 'NVIDIA drivers', url: 'https://www.nvidia.com/en-us/geforce/drivers/' },
  { label: 'AMD drivers', url: 'https://www.amd.com/en/support/download/drivers.html' },
  { label: 'Intel drivers', url: 'https://www.intel.com/content/www/us/en/download-center/home.html' }
];
