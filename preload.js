const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('booster', {
  getInfo: () => ipcRenderer.invoke('get-info'),
  runTweaks: (ids, action) => ipcRenderer.invoke('run-tweaks', { ids, action }),
  scanClean: () => ipcRenderer.invoke('scan-clean'),
  runClean: (ids) => ipcRenderer.invoke('run-clean', ids),
  ping: (host) => ipcRenderer.invoke('ping', host),
  openLink: (url) => ipcRenderer.invoke('open-link', url)
});
