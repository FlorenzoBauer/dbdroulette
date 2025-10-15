import React, { useState, useEffect } from 'react';
import './UpdateScreen.css';

const UpdateScreen = ({ onUpdateComplete }) => {
  const [status, setStatus] = useState('checking');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set up IPC listeners for update events
    const { ipcRenderer } = window.require('electron');
    
    const listeners = {
      'update-checking': () => setStatus('checking'),
      'update-available': () => setStatus('available'),
      'update-not-available': () => {
        setStatus('not-available');
        setTimeout(() => onUpdateComplete(), 1000);
      },
      'update-downloading': () => setStatus('downloading'),
      'update-progress': (event, progressObj) => {
        setProgress(Math.round(progressObj.percent));
      },
      'update-downloaded': () => setStatus('downloaded'),
      'update-error': (event, errorMsg) => {
        setStatus('error');
        setError(errorMsg);
        setTimeout(() => onUpdateComplete(), 3000);
      },
      'update-timeout': () => {
        setStatus('timeout');
        setTimeout(() => onUpdateComplete(), 1000);
      },
      'update-skipped': () => {
        setStatus('skipped');
        setTimeout(() => onUpdateComplete(), 1000);
      }
    };

    // Add all listeners
    Object.entries(listeners).forEach(([channel, handler]) => {
      ipcRenderer.on(channel, handler);
    });

    // Check for updates on component mount
    ipcRenderer.invoke('check-for-updates');

    // Set timeout for update check (5 seconds)
    const timeout = setTimeout(() => {
      if (status === 'checking') {
        ipcRenderer.invoke('skip-update');
      }
    }, 5000);

    return () => {
      // Cleanup listeners
      Object.keys(listeners).forEach(channel => {
        ipcRenderer.removeAllListeners(channel);
      });
      clearTimeout(timeout);
    };
  }, [status, onUpdateComplete]);

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Checking for updates...';
      case 'available':
        return 'Update available! Downloading...';
      case 'not-available':
        return 'You have the latest version!';
      case 'downloading':
        return `Downloading update... ${progress}%`;
      case 'downloaded':
        return 'Update downloaded! Restarting...';
      case 'error':
        return `Update error: ${error}`;
      case 'timeout':
        return 'Update check timed out. Continuing...';
      case 'skipped':
        return 'Update skipped. Continuing...';
      default:
        return 'Checking for updates...';
    }
  };

  return (
    <div className="update-screen">
      <div className="update-container">
        <h1>🎮 DBD Roulette 🎮</h1>
        <div className="update-status">
          <div className="status-message">{getStatusMessage()}</div>
          {(status === 'checking' || status === 'downloading') && (
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${status === 'downloading' ? progress : 100}%` }}
              ></div>
            </div>
          )}
          {status === 'error' && (
            <button 
              className="continue-button"
              onClick={() => onUpdateComplete()}
            >
              Continue Anyway
            </button>
          )}
        </div>
        <div className="version-info">
          Version {process.env.REACT_APP_VERSION || '1.0.0'}
        </div>
      </div>
    </div>
  );
};

export default UpdateScreen;