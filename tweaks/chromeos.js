// On a Chromebook this app runs inside the Linux development environment,
// which is sandboxed: it cannot change ChromeOS itself. So it cleans the Linux
// side and shows ChromeOS steps you do by hand.
module.exports = [
  {
    id: 'cros_deepclean', category: 'clean', recommended: true, admin: true, oneShot: true,
    name: 'Clean the Linux environment',
    desc: 'Clears package installers and old logs inside the Linux container, freeing Chromebook storage.',
    impact: 'Frees disk space',
    apply: `apt-get clean; apt-get -y autoremove; journalctl --vacuum-time=3d 2>/dev/null || true; echo "Linux environment cleaned"`
  }
];

module.exports.prelude = '';

module.exports.manual = [
  'Close tabs and Android apps you are not using: each one uses RAM that games need.',
  'Plug in your charger: Chromebooks slow down on battery.',
  'Roblox: install from the Play Store, then in-game set Graphics Mode to Manual and lower the slider.',
  'Fortnite and Battlefield 6 do not run natively on ChromeOS. Play them through a cloud service (GeForce NOW or Xbox Cloud Gaming) in Chrome: your Chromebook just streams video, so FPS depends on your internet, not your hardware.',
  'Geometry Dash: install from the Play Store and turn on Low Detail Mode on heavy levels.',
  'For cloud gaming: use 5 GHz Wi-Fi or a USB Ethernet adapter, sit near the router, and stop other downloads.',
  'Settings → About ChromeOS → Check for updates. Updates often improve graphics performance.',
  'Settings → Device → Storage management: clear files and Linux disk space you no longer need.'
];

module.exports.links = [
  { label: 'GeForce NOW (play Fortnite in the browser)', url: 'https://play.geforcenow.com' },
  { label: 'Xbox Cloud Gaming (Fortnite free)', url: 'https://www.xbox.com/play' }
];
