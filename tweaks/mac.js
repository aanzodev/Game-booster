module.exports = [
  {
    id: 'mac_lowpower', category: 'fps', recommended: true, admin: true,
    name: 'Turn off Low Power Mode',
    desc: 'Low Power Mode slows the CPU and GPU to save battery. Turning it off gives full speed.',
    impact: 'Large if it was on',
    apply: `pmset -a lowpowermode 0 && echo "Low Power Mode off"`,
    revert: `pmset -a lowpowermode 1 && echo "Low Power Mode on"`
  },
  {
    id: 'mac_anim', category: 'fps', recommended: false, admin: false,
    name: 'Turn off window animations',
    desc: 'Snappier macOS when switching to and from games.',
    impact: 'Feel only',
    apply: `defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false && echo "Window animations off"`,
    revert: `defaults delete NSGlobalDomain NSAutomaticWindowAnimationsEnabled 2>/dev/null; echo "Window animations restored"`
  },
  {
    id: 'mac_transparency', category: 'fps', recommended: false, admin: false,
    name: 'Reduce transparency',
    desc: 'Less blur work for the GPU on older Macs. On newer macOS you may need to do this in System Settings → Accessibility → Display.',
    impact: 'Older Macs only',
    apply: `defaults write com.apple.universalaccess reduceTransparency -bool true && echo "Transparency reduced"`,
    revert: `defaults write com.apple.universalaccess reduceTransparency -bool false && echo "Transparency restored"`
  },
  {
    id: 'mac_flushdns', category: 'network', recommended: true, admin: true, oneShot: true,
    name: 'Flush DNS cache',
    desc: 'Clears old saved addresses. Fixes "can\'t connect" problems.',
    impact: 'Fix',
    apply: `dscacheutil -flushcache; killall -HUP mDNSResponder; echo "DNS cache cleared"`
  },
  {
    id: 'mac_dns', category: 'network', recommended: false, admin: true,
    name: 'Use Cloudflare DNS (1.1.1.1) on Wi-Fi and Ethernet',
    desc: 'Faster, more reliable lookups. Does not lower in-game ping.',
    impact: 'Faster lookups, not lower ping',
    apply: `networksetup -listallnetworkservices | tail -n +2 | grep -v '^\\*' | while read -r s; do networksetup -setdnsservers "$s" 1.1.1.1 1.0.0.1 2>/dev/null; done; echo "DNS set to 1.1.1.1"`,
    revert: `networksetup -listallnetworkservices | tail -n +2 | grep -v '^\\*' | while read -r s; do networksetup -setdnsservers "$s" Empty 2>/dev/null; done; echo "DNS back to automatic"`
  },
  {
    id: 'mac_deepclean', category: 'clean', recommended: true, admin: true, oneShot: true,
    name: 'Deep clean: system logs and temp files',
    desc: 'Removes old system logs and runs macOS\'s built-in maintenance.',
    impact: 'Frees disk space',
    apply: `rm -rf /private/var/log/asl/*.asl 2>/dev/null; rm -rf /Library/Logs/DiagnosticReports/* 2>/dev/null; periodic daily weekly monthly 2>/dev/null; echo "Deep clean finished"`
  }
];

module.exports.prelude = '';

module.exports.links = [
  { label: 'Login items (stop apps opening at startup)', url: 'x-apple.systempreferences:com.apple.LoginItems-Settings.extension' },
  { label: 'Displays (check refresh rate / ProMotion)', url: 'x-apple.systempreferences:com.apple.Displays-Settings.extension' },
  { label: 'Battery (Low Power Mode)', url: 'x-apple.systempreferences:com.apple.Battery-Settings.extension' }
];
