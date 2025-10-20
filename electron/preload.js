const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auto-updater events
  onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateDownloading: (callback) => ipcRenderer.on('update-downloading', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  onUpdateTimeout: (callback) => ipcRenderer.on('update-timeout', callback),
  onUpdateSkipped: (callback) => ipcRenderer.on('update-skipped', callback),
  
  // Custom updater actions
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (releaseData) => ipcRenderer.invoke('download-update', releaseData),
  installUpdate: (downloadPath) => ipcRenderer.invoke('install-update', downloadPath),
  skipUpdate: () => ipcRenderer.invoke('skip-update'),
  quitAndInstall: (downloadPath) => ipcRenderer.invoke('install-update', downloadPath),

  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Environment info
  isDev: process.env.NODE_ENV === 'development',

  // App version
  getAppVersion: () => {
    try {
      if (process.versions.electron && !process.env.NODE_ENV) {
        const electronApp = require('electron').app;
        return electronApp.getVersion();
      } else {
        const packageJson = require('../package.json');
        return packageJson.version || 'Unknown';
      }
    } catch (err) {
      return 'Unknown';
    }
  }
});