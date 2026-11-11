// In-game settings guides. These are where the biggest FPS gains come from.
window.GAME_GUIDES = [
  {
    name: 'Fortnite',
    tag: 'Biggest gains here',
    fps: [
      'Settings → Video → Rendering Mode: <b>Performance</b>. This is the single biggest FPS boost (often 1.5–2×), but visuals get simpler. Competitive players use it.',
      'Frame Rate Limit: set it to your monitor\'s refresh rate (144 / 240 Hz) or Unlimited. Check it isn\'t stuck at 60 or 120.',
      'NVIDIA Reflex Low Latency: <b>On + Boost</b> (NVIDIA cards).',
      'Shadows, Global Illumination, Reflections, Post Processing: <b>Off / Low</b>. They cost the most FPS.',
      'View Distance: Medium or Far. Lower distances barely help FPS and hide enemies.',
      'Window Mode: <b>Fullscreen</b> (not Windowed Fullscreen).',
      'Turn off V-Sync. Use G-Sync/FreeSync from your GPU control panel if you have it.'
    ],
    quality: [
      'For better looks and good FPS: Rendering Mode <b>DirectX 12</b> + <b>DLSS</b> (NVIDIA) or <b>TSR</b> on Quality/Balanced. Upscaling gives you higher settings at nearly the same FPS.',
      'Textures can go High if your GPU has 8 GB+ VRAM: costs very little FPS.'
    ],
    fix: 'Stutters? In the Epic Games Launcher: Library → Fortnite → ⋯ → Manage → Verify Files.'
  },
  {
    name: 'Battlefield 6',
    tag: 'Anti-cheat: built-in settings only',
    fps: [
      'Upscaling: <b>DLSS / FSR / XeSS on Quality or Balanced</b>. Biggest FPS gain with little loss in looks.',
      'NVIDIA Reflex: <b>On</b>.',
      'Future Frame Rendering: <b>On</b> (more FPS, tiny bit more input delay).',
      'Lower these first: Shadows, Volumetrics, Effects, Lighting, Ambient Occlusion, Screen-space reflections.',
      'Keep Texture Quality at what your VRAM allows (shown in the menu).',
      'Fullscreen mode, V-Sync off.'
    ],
    quality: [
      'If you have FPS to spare, raise Mesh and Terrain quality first: they help you spot enemies.',
      'DLSS Frame Generation (RTX 40/50) or FSR Frame Generation raises smoothness a lot; turn on HAGS in the Tweaks tab first.'
    ],
    fix: 'BF6 uses Javelin anti-cheat and needs Secure Boot on. Never use FPS unlockers, injectors or overlays that hook the game: they can get you banned.'
  },
  {
    name: 'Roblox',
    tag: 'Built-in FPS unlock',
    fps: [
      'In a game, press Esc → Settings → <b>Maximum Frame Rate</b>: set it to 144, 240 or the highest option. Roblox caps at 60 by default.',
      'Graphics Mode: <b>Manual</b>, then lower the Graphics Quality slider until FPS is steady.',
      'Close extra Roblox windows and browser tabs.'
    ],
    quality: [
      'With a strong PC, Graphics Quality 7–10 still runs well; heavy games depend on the game\'s own design more than your PC.'
    ],
    fix: 'Avoid third-party "FPS unlockers" and FastFlag editors: Roblox now limits them and the anti-cheat can flag injected tools. The built-in setting does the same job safely.'
  },
  {
    name: 'Geometry Dash',
    tag: 'Smoothness matters most',
    fps: [
      'Settings → Graphics: turn <b>V-Sync off</b> and set the FPS cap to your monitor\'s refresh rate or higher.',
      'Use <b>Low Detail Mode</b> on levels with heavy effects (toggle on the level page).',
      'Run in fullscreen, and set "Texture Quality" to Medium on very old PCs.'
    ],
    quality: [
      'High texture quality costs almost nothing on any modern PC. Keep it on High.'
    ],
    fix: 'If input feels delayed, lower the FPS cap to exactly your refresh rate and turn on G-Sync/FreeSync.'
  },
  {
    name: 'Every game',
    tag: 'Hardware checks',
    fps: [
      '<b>Update your GPU driver</b> (links in the Tweaks tab). New drivers often add 5–15% in new games.',
      '<b>Check your monitor\'s refresh rate</b> in Windows display settings. Many 144/240 Hz monitors are left at 60 Hz by mistake. Use DisplayPort or the HDMI port on the GPU, not the motherboard.',
      '<b>Turn on XMP / EXPO in BIOS</b>. RAM often runs at slow speed by default. At 200+ FPS you are usually CPU-limited, and this can add 10–20%.',
      'Laptops: plug in and use the High-performance GPU.',
      'Close Chrome, Discord overlays and RGB/monitoring apps while playing.',
      'Keep the game on an SSD with at least 15% free space.'
    ],
    quality: [
      'Upscalers (DLSS, FSR, XeSS, TSR) give you more FPS <i>and</i> let you keep higher settings. Use Quality mode at 1440p/4K, Balanced/Quality at 1080p.'
    ],
    fix: 'Lag (high ping) comes from your internet, not your FPS. Use Ethernet, pick the closest server region, and see the Network tab.'
  }
];
