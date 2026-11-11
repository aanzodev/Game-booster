module.exports = [
  {
    id: 'lin_governor', category: 'fps', recommended: true, admin: true,
    name: 'CPU performance mode',
    desc: 'Keeps the CPU at full speed. Uses power-profiles-daemon if installed, otherwise the CPU governor. Resets on reboot.',
    impact: 'Small–medium, better 1% lows',
    apply: `
if command -v powerprofilesctl >/dev/null 2>&1 && powerprofilesctl list | grep -q performance; then
  powerprofilesctl set performance && echo "Power profile: performance"
else
  for f in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do echo performance > "$f"; done
  echo "CPU governor: performance"
fi`,
    revert: `
if command -v powerprofilesctl >/dev/null 2>&1; then powerprofilesctl set balanced && echo "Power profile: balanced"
else
  avail=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors)
  g=powersave; echo "$avail" | grep -q schedutil && g=schedutil
  for f in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do echo $g > "$f"; done
  echo "CPU governor: $g"
fi`
  },
  {
    id: 'lin_swappiness', category: 'fps', recommended: true, admin: true,
    name: 'Keep games in RAM (swappiness 10)',
    desc: 'Makes Linux less eager to move game data to slow swap. Resets on reboot.',
    impact: 'Fewer stutters with low RAM',
    apply: `sysctl -w vm.swappiness=10`,
    revert: `sysctl -w vm.swappiness=60`
  },
  {
    id: 'lin_flushdns', category: 'network', recommended: true, admin: true, oneShot: true,
    name: 'Flush DNS cache',
    desc: 'Clears old saved addresses. Fixes "can\'t connect" problems.',
    impact: 'Fix',
    apply: `(resolvectl flush-caches || systemd-resolve --flush-caches) 2>/dev/null; echo "DNS cache cleared (if systemd-resolved is used)"`
  },
  {
    id: 'lin_deepclean', category: 'clean', recommended: true, admin: true, oneShot: true,
    name: 'Deep clean: package cache + old system logs',
    desc: 'Clears downloaded package installers and system logs older than 7 days.',
    impact: 'Frees disk space',
    apply: `
command -v journalctl >/dev/null && journalctl --vacuum-time=7d || true
command -v apt-get >/dev/null && apt-get clean && apt-get -y autoremove || true
command -v dnf >/dev/null && dnf clean all || true
command -v pacman >/dev/null && pacman -Sc --noconfirm || true
echo "Deep clean finished"`
  }
];

module.exports.prelude = '';

module.exports.links = [
  { label: 'Feral GameMode (auto performance mode while gaming)', url: 'https://github.com/FeralInteractive/gamemode' },
  { label: 'MangoHud (FPS overlay to measure gains)', url: 'https://github.com/flightlessmango/MangoHud' }
];
