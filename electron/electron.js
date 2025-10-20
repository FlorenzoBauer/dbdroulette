const { app, BrowserWindow, ipcMain, dialog, net } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Replace the electron-is-dev import at the top
let isDev = process.env.NODE_ENV === 'development' || process.defaultApp || /[\\/]electron[\\/]/.test(process.execPath);

// Keep a global reference of the window object
let mainWindow;
let updateTimeout = null;

class GitHubCustomUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.owner = 'FlorenzoBauer'; // CHANGE THIS to your GitHub username
    this.repo = 'trialrandomizer'; // CHANGE THIS to your repository name
    this.currentVersion = app.getVersion();
  }

  async checkForUpdates() {
    try {
      this.sendToRenderer('update-checking');
      
      const latestRelease = await this.fetchLatestRelease();
      
      if (this.isNewerVersion(latestRelease.tag_name)) {
        this.sendToRenderer('update-available', latestRelease);
      } else {
        this.sendToRenderer('update-not-available');
      }
    } catch (error) {
      console.error('Update check failed:', error);
      this.sendToRenderer('update-error', error.message);
    }
  }

  async fetchLatestRelease() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${this.owner}/${this.repo}/releases/latest`,
        method: 'GET',
        headers: {
          'User-Agent': 'Trial-Randomizer-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const release = JSON.parse(data);
              resolve(release);
            } catch (parseError) {
              reject(new Error('Failed to parse GitHub response'));
            }
          } else {
            reject(new Error(`GitHub API returned ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  async downloadUpdate(release) {
    try {
      this.sendToRenderer('update-downloading');
      
      // Find the asset for the current platform
      const asset = this.findPlatformAsset(release.assets);
      if (!asset) {
        throw new Error('No compatible download found for your platform');
      }

      const downloadPath = path.join(app.getPath('temp'), asset.name);
      await this.downloadFile(asset.browser_download_url, downloadPath);
      
      this.sendToRenderer('update-downloaded', downloadPath);
      
    } catch (error) {
      console.error('Download failed:', error);
      this.sendToRenderer('update-error', error.message);
    }
  }

  findPlatformAsset(assets) {
    const platform = process.platform;
    const arch = process.arch;
    
    // Look for platform-specific assets
    const platformPatterns = {
      'win32': ['win', 'windows', '.exe', 'nsis', 'setup'],
      'darwin': ['mac', 'darwin', '.dmg', 'macos'],
      'linux': ['linux', '.AppImage', 'appimage']
    };

    const patterns = platformPatterns[platform] || [platform];
    
    for (const asset of assets) {
      const assetName = asset.name.toLowerCase();
      if (patterns.some(pattern => assetName.includes(pattern.toLowerCase()))) {
        return asset;
      }
    }
    
    // Fallback: return first asset if no platform-specific one found
    return assets[0];
  }

  async downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      let receivedBytes = 0;
      let totalBytes = 0;

      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed with status ${response.statusCode}`));
          return;
        }

        totalBytes = parseInt(response.headers['content-length'], 10);
        
        response.on('data', (chunk) => {
          receivedBytes += chunk.length;
          file.write(chunk);
          
          // Calculate progress
          const progress = totalBytes > 0 ? (receivedBytes / totalBytes) * 100 : 0;
          this.sendToRenderer('update-progress', {
            percent: Math.round(progress),
            transferred: receivedBytes,
            total: totalBytes
          });
        });

        response.on('end', () => {
          file.end();
          resolve();
        });

        response.on('error', (error) => {
          file.end();
          // Delete partial file on error
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error('Failed to delete partial file:', e);
          }
          reject(error);
        });

      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  installUpdate(downloadPath) {
    if (!fs.existsSync(downloadPath)) {
      this.sendToRenderer('update-error', 'Downloaded file not found');
      return;
    }

    try {
      const { spawn } = require('child_process');
      
      if (process.platform === 'win32') {
        // For Windows .exe installers
        const child = spawn(downloadPath, ['/S'], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
      } else if (process.platform === 'darwin') {
        // For macOS .dmg files
        const child = spawn('open', [downloadPath], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
      } else if (process.platform === 'linux') {
        // For Linux .AppImage - make executable and run
        fs.chmodSync(downloadPath, 0o755);
        const child = spawn(downloadPath, [], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
      }
      
      app.quit();
      
    } catch (error) {
      console.error('Installation failed:', error);
      this.sendToRenderer('update-error', error.message);
    }
  }

  isNewerVersion(latestVersion) {
    // Remove 'v' prefix if present
    const cleanLatest = latestVersion.replace(/^v/, '');
    const cleanCurrent = this.currentVersion.replace(/^v/, '');
    
    // Simple semver comparison
    const latestParts = cleanLatest.split('.').map(Number);
    const currentParts = cleanCurrent.split('.').map(Number);
    
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false; // Versions are equal
  }

  sendToRenderer(event, data = null) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (data) {
        this.mainWindow.webContents.send(event, data);
      } else {
        this.mainWindow.webContents.send(event);
      }
    }
  }
}

let githubUpdater;

function initCustomUpdater() {
  if (githubUpdater) return;
  
  githubUpdater = new GitHubCustomUpdater(mainWindow);
  
  // Set timeout for update check (10 seconds)
  updateTimeout = setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-timeout');
    }
  }, 10000);

  // Start update check
  githubUpdater.checkForUpdates();
}

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
    
    // Initialize custom updater in production AFTER window is ready
    if (!isDev) {
      setTimeout(() => {
        initCustomUpdater();
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

// IPC handlers for update actions
ipcMain.handle('check-for-updates', () => {
  if (!isDev && githubUpdater && mainWindow && !mainWindow.isDestroyed()) {
    githubUpdater.checkForUpdates();
  }
});

ipcMain.handle('download-update', (event, releaseData) => {
  if (githubUpdater && mainWindow && !mainWindow.isDestroyed()) {
    githubUpdater.downloadUpdate(releaseData);
  }
});

ipcMain.handle('install-update', (event, downloadPath) => {
  if (githubUpdater && mainWindow && !mainWindow.isDestroyed()) {
    githubUpdater.installUpdate(downloadPath);
  }
});

ipcMain.handle('skip-update', () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
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