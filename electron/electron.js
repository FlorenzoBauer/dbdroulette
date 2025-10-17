const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

// Keep a global reference of the window object
let mainWindow;
let updateTimeout = null;

// Auto updater events
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  // Create the browser window with SECURE settings
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
      nodeIntegrationInWorker: false
    },
    icon: path.join(__dirname, 'favicon.ico'),
    title: 'Trial Randomizer',
    show: false
  });

  // Smart URL detection
  const getAppUrl = () => {
    // Always try built files first if they exist
    const buildPath = path.join(__dirname, '../build/index.html');
    
    if (fs.existsSync(buildPath)) {
      return `file://${buildPath}`;
    } else if (isDev) {
      return 'http://localhost:3000';
    } else {
      // Fallback - show error dialog for production
      return `file://${path.join(__dirname, '../build/index.html')}`;
    }
  };

  const appUrl = getAppUrl();
  
  // Enhanced loading with fallback handling
  const loadApp = () => {
    mainWindow.loadURL(appUrl).catch((error) => {
      // If we tried built files and failed, try dev server
      if (appUrl.startsWith('file://') && isDev) {
        mainWindow.loadURL('http://localhost:3000').catch((fallbackError) => {
          showLoadError();
        });
      } else if (appUrl.startsWith('http://') && isDev) {
        // If dev server failed, try to use any existing build files
        const buildPath = path.join(__dirname, '../build/index.html');
        if (fs.existsSync(buildPath)) {
          mainWindow.loadURL(`file://${buildPath}`).catch((buildError) => {
            showLoadError();
          });
        } else {
          showLoadError();
        }
      } else {
        showLoadError();
      }
    });
  };

  function showLoadError() {
    dialog.showErrorBox(
      'Load Error',
      'Failed to load the application. Please ensure the app is properly built or the development server is running.'
    );
    app.quit();
  }

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Initialize auto-updater in production AFTER window is ready
    if (!isDev) {
      setTimeout(() => {
        initAutoUpdater();
      }, 10000);
    } else {
      // In dev mode, send update-not-available immediately to skip update screen
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-not-available');
        }
      }, 5000);
    }
  });

  // Load the app
  loadApp();

  // Open DevTools for debugging (keep in development)
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initAutoUpdater() {
  // Clear any existing timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  // Set update check timeout
  updateTimeout = setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-timeout');
    }
  }, 10000);

  autoUpdater.on('checking-for-update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-checking');
    }
  });

  autoUpdater.on('update-available', () => {
    if (updateTimeout) clearTimeout(updateTimeout);
    
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available');
      
      // Ask user if they want to download the update
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version of Trial Randomizer is available. Would you like to download it now?',
        buttons: ['Download', 'Later']
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
          mainWindow.webContents.send('update-downloading');
        } else {
          mainWindow.webContents.send('update-skipped');
        }
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    if (updateTimeout) clearTimeout(updateTimeout);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-not-available');
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded');
      
      // Ask user to install the update
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Application will restart to install the update.',
        buttons: ['Restart', 'Later']
      }).then(result => {
        if (result.response === 0) {
          setImmediate(() => {
            autoUpdater.quitAndInstall();
          });
        }
      });
    }
  });

  autoUpdater.on('error', (error) => {
    if (updateTimeout) clearTimeout(updateTimeout);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', error.message);
    }
  });

  // Check for updates
  autoUpdater.checkForUpdates().catch(error => {
    // Silent fail - user doesn't need to know about update check failures
  });
}

// IPC handlers for update actions
ipcMain.handle('check-for-updates', () => {
  if (!isDev && mainWindow && !mainWindow.isDestroyed()) {
    initAutoUpdater();
  }
});

ipcMain.handle('skip-update', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-skipped');
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});