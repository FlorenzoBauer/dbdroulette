// import React, { useState, useEffect } from 'react';
// import './UpdateScreen.css';
// import packageJson from '../../package.json';

// const UpdateScreen = ({ updateStatus, updateProgress, onUpdateComplete }) => {
//   const [status, setStatus] = useState(updateStatus || 'checking');
//   const [progress, setProgress] = useState(updateProgress || 0);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     setStatus(updateStatus);
//   }, [updateStatus]);

//   useEffect(() => {
//     setProgress(updateProgress);
//   }, [updateProgress]);

//   useEffect(() => {
//     console.log('UpdateScreen mounted - status:', status);
    
//     if (window.electronAPI) {
//       console.log('Setting up update listeners in UpdateScreen');
      
//       const updateHandlers = {
//         'update-checking': () => {
//           console.log('Update checking in UpdateScreen');
//           setStatus('checking');
//         },
//         'update-available': () => {
//           console.log('Update available in UpdateScreen');
//           setStatus('available');
//         },
//         'update-not-available': () => {
//           console.log('No update available in UpdateScreen');
//           setStatus('not-available');
//           setTimeout(() => onUpdateComplete(), 1500);
//         },
//         'update-downloading': () => {
//           console.log('Update downloading in UpdateScreen');
//           setStatus('downloading');
//         },
//         'update-progress': (event, progressObj) => {
//           console.log('Download progress in UpdateScreen:', progressObj.percent);
//           setProgress(Math.round(progressObj.percent));
//         },
//         'update-downloaded': () => {
//           console.log('Update downloaded in UpdateScreen');
//           setStatus('downloaded');
//           // Auto-restart after 3 seconds
//           setTimeout(() => {
//             if (window.electronAPI && window.electronAPI.quitAndInstall) {
//               window.electronAPI.quitAndInstall();
//             }
//           }, 3000);
//         },
//         'update-error': (event, errorMsg) => {
//           console.log('Update error in UpdateScreen:', errorMsg);
//           setStatus('error');
//           setError(errorMsg);
//         },
//         'update-timeout': () => {
//           console.log('Update timeout in UpdateScreen');
//           setStatus('timeout');
//           setTimeout(() => onUpdateComplete(), 1500);
//         },
//         'update-skipped': () => {
//           console.log('Update skipped in UpdateScreen');
//           setStatus('skipped');
//           setTimeout(() => onUpdateComplete(), 1000);
//         }
//       };

//       // Register all event listeners using electronAPI
//       Object.entries(updateHandlers).forEach(([event, handler]) => {
//         const methodName = `on${event.charAt(0).toUpperCase() + event.slice(1).replace('-', '')}`;
//         if (window.electronAPI[methodName]) {
//           window.electronAPI[methodName](handler);
//         }
//       });

//       // Set timeout for update check (8 seconds)
//       const timeout = setTimeout(() => {
//         if (status === 'checking') {
//           console.log('Update check timeout - skipping');
//           window.electronAPI.skipUpdate();
//         }
//       }, 8000);

//       return () => {
//         if (window.electronAPI && window.electronAPI.removeAllListeners) {
//           const events = [
//             'update-checking', 'update-available', 'update-not-available',
//             'update-downloading', 'update-progress', 'update-downloaded',
//             'update-error', 'update-timeout', 'update-skipped'
//           ];
          
//           events.forEach(event => {
//             try {
//               window.electronAPI.removeAllListeners(event);
//             } catch (error) {
//               console.log('Error removing listener:', error);
//             }
//           });
//         }
//         clearTimeout(timeout);
//       };
//     } else {
//       // Fallback: if no electronAPI, just continue after delay
//       setTimeout(() => onUpdateComplete(), 1000);
//     }
//   }, [status, onUpdateComplete]);

//   const getStatusMessage = () => {
//     switch (status) {
//       case 'checking':
//         return 'Checking for updates...';
//       case 'available':
//         return 'Update available! Preparing download...';
//       case 'not-available':
//         return 'You\'re up to date!';
//       case 'downloading':
//         return `Downloading update... ${progress}%`;
//       case 'downloaded':
//         return 'Update complete! Restarting app...';
//       case 'error':
//         return `Update failed: ${error}`;
//       case 'timeout':
//         return 'Connection timeout. Starting app...';
//       case 'skipped':
//         return 'Starting application...';
//       default:
//         return 'Checking for updates...';
//     }
//   };

//   return (
//     <div className={`update-screen status-${status}`}>
//       <div className="update-container">
//         <h1>🎮 Trial Randomizer 🎮</h1>
//         <div className="update-status">
//           <div className="status-message">{getStatusMessage()}</div>
          
//           {(status === 'checking' || status === 'downloading') && (
//             <div className="progress-container">
//               <div 
//                 className="progress-bar" 
//                 style={{ 
//                   width: `${status === 'downloading' ? progress : 100}%`,
//                   background: status === 'checking' 
//                     ? 'linear-gradient(90deg, #d69e2e, #b7791f)' 
//                     : 'linear-gradient(90deg, #48bb78, #38a169)'
//                 }}
//               ></div>
//             </div>
//           )}
          
//           {status === 'error' && (
//             <button 
//               className="continue-button"
//               onClick={() => onUpdateComplete()}
//             >
//               Continue Anyway
//             </button>
//           )}
//         </div>
        
//         <div className="version-info">
//           v{packageJson.version}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateScreen;