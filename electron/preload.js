const { contextBridge, ipcRenderer, app } = require('electron');
const path = require('path');
const fs = require('fs');

// Function to get app version safely in dev and production
function getAppVersion() {
  try {
    // In production, use app.getVersion()
    if (process.versions.electron && !process.env.NODE_ENV) {
      const electronApp = require('electron').app;
      return electronApp.getVersion();
    } else {
      // In dev, fallback to package.json
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkg = require(packageJsonPath);
        return pkg.version || 'Unknown';
      }
    }
  } catch (err) {
    console.error('Failed to get app version:', err);
  }
  return 'Unknown';
}

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
  
  // Auto-updater actions
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  skipUpdate: () => ipcRenderer.invoke('skip-update'),

  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Environment info
  isDev: process.env.NODE_ENV === 'development',

  // App version
  getAppVersion: getAppVersion
});
