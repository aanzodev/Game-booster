# ⚡ Game Booster

A desktop app for **Windows, macOS, Linux and Chromebook** that:

- **Raises FPS** with safe, reversible system tweaks (power plan, Game Mode, GPU scheduling, game priority, Game DVR off…)
- **Improves your internet for gaming**: ping/jitter/packet-loss test, turning off network throttling, stopping Windows Update upload sharing, DNS, DNS flush and network repair
- **Cleans junk**: temp files, logs, crash dumps, Fortnite/Roblox logs, shader caches, Recycle Bin, Windows Update leftovers
- **Game guides** with the best settings for **Fortnite, Battlefield 6, Roblox and Geometry Dash**, for more FPS or better quality
- Lets you **pick your device** (and detects it automatically)
- **Every tweak has an Undo button** that restores the default

> It never injects into games and never touches game files, so it's safe with anti-cheat (Easy Anti-Cheat, Javelin, Hyperion).

---

## Install

### Windows (easiest)
1. Install **Node.js LTS** from https://nodejs.org
2. Download/unzip this folder, open it, click the address bar, type `cmd`, press Enter.
3. Run:
   ```bash
   npm install
   ```
   ```bash
   npm run dist:win
   ```
4. Open the `dist` folder and run **Game Booster Setup 1.0.0.exe** (installer) or the portable `.exe`.
   Windows SmartScreen may warn because the app isn't code-signed: click **More info → Run anyway**.

Want to try it without installing? Just run `npm start` after `npm install`.

### Mac
Same steps in Terminal, but use `npm run dist:mac`, then open the `.dmg` in `dist`.
First launch: right-click the app → **Open** (the app is unsigned).

### Linux
`npm install` then `npm run dist:linux`. That gives you an `.AppImage` (any distro) and a `.deb` (Ubuntu/Debian/Mint/Pop!_OS).

### Chromebook
1. Settings → Advanced → Developers → **Linux development environment** → Turn on.
2. Copy `game-booster_1.0.0_amd64.deb` into **Linux files** and double-click it → Install.
   (Built on Linux with `npm run dist:linux`. Intel/AMD Chromebooks only; ARM Chromebooks need an `arm64` build: `npx electron-builder --linux deb --arm64`.)
3. Open **Game Booster** from the launcher.

ChromeOS keeps Linux apps in a sandbox, so on a Chromebook the app cleans the Linux side and gives you the ChromeOS steps to do by hand (plus cloud gaming for Fortnite/Battlefield, which don't run on ChromeOS).

### Build every installer automatically
Push this folder to a GitHub repo and push a tag like `v1.0.0` (or run the workflow by hand). `.github/workflows/build.yml` builds the Windows `.exe`, Mac `.dmg`, and Linux `.AppImage`/`.deb` and attaches them to the run.

---

## What each platform gets

| | Windows | Mac | Linux | Chromebook |
|---|---|---|---|---|
| FPS tweaks | 7 | 3 | 2 | manual tips |
| Network tweaks + ping test | ✅ | ✅ | ✅ | ✅ |
| Junk cleaner + deep clean | ✅ | ✅ | ✅ | ✅ |
| Game guides | ✅ | ✅ | ✅ | ✅ |

## Honest expectations
System tweaks usually give **5–15% more FPS and fewer frame drops**. No app can double your FPS. At 200 FPS in Fortnite you're likely **CPU/RAM-limited**, so the biggest extra gains are:
1. Fortnite **Performance** rendering mode (or DX12 + DLSS/TSR for better looks)
2. **XMP/EXPO** turned on in BIOS (faster RAM)
3. Latest **GPU driver**
4. Monitor actually set to **144/240 Hz**

Lag/ping comes from your connection, not your FPS: **Ethernet** beats every software tweak.

## Project layout
```
main.js            Electron main process: runs tweaks, cleaner, ping
preload.js         Safe bridge between UI and main process
tweaks/*.js        Tweaks per platform (apply + revert scripts)
src/               UI (HTML/CSS/JS) and game guides
build/icon.png     App icon
```
