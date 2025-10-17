const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
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
  
  // Remove event listeners - ADDED THIS
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Environment info
  isDev: process.env.NODE_ENV === 'development'
});