import React, { useState, useEffect } from 'react';
import UpdateScreen from './components/UpdateScreen';
import './App.css';
import { killers, killerPerks, survivorPerks, survivorBuildThemes, killerBuildThemes } from './data';

function App() {
  const [showUpdateScreen, setShowUpdateScreen] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('checking');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Determine environment
    const devMode = window.location.protocol === 'http:';
    setIsDev(devMode);
    
    // Set up auto-updater event listeners
    if (window.electronAPI) {
      window.electronAPI.onUpdateChecking(() => {
        setUpdateStatus('checking');
      });
      
      window.electronAPI.onUpdateAvailable(() => {
        setUpdateStatus('available');
      });
      
      window.electronAPI.onUpdateNotAvailable(() => {
        setUpdateStatus('not-available');
        setTimeout(() => setShowUpdateScreen(false), 1000);
      });
      
      window.electronAPI.onUpdateDownloading(() => {
        setUpdateStatus('downloading');
      });
      
      window.electronAPI.onUpdateProgress((event, progressObj) => {
        setUpdateProgress(progressObj.percent);
      });
      
      window.electronAPI.onUpdateDownloaded(() => {
        setUpdateStatus('downloaded');
      });
      
      window.electronAPI.onUpdateError(() => {
        setUpdateStatus('error');
        setTimeout(() => setShowUpdateScreen(false), 2000);
      });
      
      window.electronAPI.onUpdateTimeout(() => {
        setUpdateStatus('timeout');
        setTimeout(() => setShowUpdateScreen(false), 1000);
      });
      
      window.electronAPI.onUpdateSkipped(() => {
        setUpdateStatus('skipped');
        setShowUpdateScreen(false);
      });

      // Check for updates in production
      if (!devMode) {
        setTimeout(() => {
          window.electronAPI.checkForUpdates();
        }, 500);
      } else {
        // In development, skip update screen immediately
        setShowUpdateScreen(false);
      }
    } else {
      // Fallback for development without Electron
      setIsDev(true);
      setShowUpdateScreen(false);
    }

    // Cleanup function to remove listeners
    return () => {
      if (window.electronAPI) {
        const events = [
          'update-checking', 'update-available', 'update-not-available',
          'update-downloading', 'update-progress', 'update-downloaded',
          'update-error', 'update-timeout', 'update-skipped'
        ];
        
        events.forEach(event => {
          window.electronAPI.removeAllListeners(event);
        });
      }
    };
  }, []);

  const handleUpdateComplete = () => {
    setShowUpdateScreen(false);
  };

  const survivorBuildTypes = ['Tunneling', 'Stealth', 'Gens-Rushing', 'Chase', 'Boon', 'Info', 'Conviction', 'Healing', 'Breakout', 'Meme', 'Random'];
  const killerBuildTypes = ["Speed", "Vaulting", "Stealth", "Gens-Slowing", "Gen-Damage", "End-Game", "Basement", "Hex", "Info", "Meme", "Random"];

  const [selectedKiller, setSelectedKiller] = useState('');
  const [selectedKillerBuild, setSelectedKillerBuild] = useState('');
  const [selectedKillerPerks, setSelectedKillerPerks] = useState([]);
  const [selectedSurvivorBuild, setSelectedSurvivorBuild] = useState('');
  const [selectedSurvivorPerks, setSelectedSurvivorPerks] = useState([]);
  
  const [isKillerSpinning, setIsKillerSpinning] = useState(false);
  const [isKillerBuildSpinning, setIsKillerBuildSpinning] = useState(false);
  const [isSurvivorBuildSpinning, setIsSurvivorBuildSpinning] = useState(false);

  const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRandomPerks = (perkPool, count = 4) => {
    const shuffled = [...perkPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getSurvivorBuildPerks = (buildType) => {
    if (buildType === 'Random') {
      return getRandomPerks(survivorPerks);
    }

    const themePerks = survivorBuildThemes[buildType] || [];
    
    if (themePerks.length >= 4) {
      return getRandomPerks(themePerks, 4);
    } else {
      const remainingPerks = getRandomPerks(
        survivorPerks.filter(p => !themePerks.includes(p)), 
        4 - themePerks.length
      );
      return [...themePerks, ...remainingPerks];
    }
  };

  const getKillerBuildPerks = (buildType) => {
    if (buildType === 'Random') {
      return getRandomPerks(killerPerks);
    }
    
    const themePerks = killerBuildThemes[buildType] || [];
    
    if (themePerks.length >= 4) {
      return getRandomPerks(themePerks, 4);
    } else {
      const remainingPerks = getRandomPerks(
        killerPerks.filter(p => !themePerks.includes(p)), 
        4 - themePerks.length
      );
      return [...themePerks, ...remainingPerks];
    }
  };

  const spinKiller = () => {
    setIsKillerSpinning(true);
    let spins = 0;
    const maxSpins = 15;
    
    const spinInterval = setInterval(() => {
      setSelectedKiller(getRandomItem(killers));
      spins++;
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsKillerSpinning(false);
      }
    }, 100);
  };

  const spinKillerBuild = () => {
    setIsKillerBuildSpinning(true);
    let spins = 0;
    const maxSpins = 15;
    
    const spinInterval = setInterval(() => {
      const randomBuild = getRandomItem(killerBuildTypes);
      setSelectedKillerBuild(randomBuild);
      setSelectedKillerPerks(getKillerBuildPerks(randomBuild));
      spins++;
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsKillerBuildSpinning(false);
      }
    }, 100);
  };

  const spinSurvivorBuild = () => {
    setIsSurvivorBuildSpinning(true);
    let spins = 0;
    const maxSpins = 15;
    
    const spinInterval = setInterval(() => {
      const randomBuild = getRandomItem(survivorBuildTypes);
      setSelectedSurvivorBuild(randomBuild);
      setSelectedSurvivorPerks(getSurvivorBuildPerks(randomBuild));
      spins++;
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSurvivorBuildSpinning(false);
      }
    }, 100);
  };

  // Show UpdateScreen in production, main app in development
  if (showUpdateScreen && !isDev) {
    return <UpdateScreen 
      updateStatus={updateStatus} 
      updateProgress={updateProgress}
      onUpdateComplete={handleUpdateComplete} 
    />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Trial Randomizer 🎮</h1>
        <p>Spin for your next loadout!</p>
        
        <div className="roulette-container">
          {/* Killer Wheel */}
          <div className="wheel-section">
            <h2>Killer</h2>
            <div className={`result ${isKillerSpinning ? 'spinning' : ''}`}>
              {selectedKiller || 'Select Killer'}
            </div>
            <button 
              className={`spin-button ${isKillerSpinning ? 'spinning' : ''}`}
              onClick={spinKiller}
              disabled={isKillerSpinning}
            >
              {isKillerSpinning ? 'Spinning...' : 'Spin Killer'}
            </button>
          </div>

          {/* Killer Perks Wheel */}
          <div className="wheel-section">
            <h2>Killer Perks</h2>
            <div className={`result ${isKillerBuildSpinning ? 'spinning' : ''}`}>
              {selectedKillerBuild || 'Killer Build'}
            </div>
            <button 
              className={`spin-button ${isKillerBuildSpinning ? 'spinning' : ''}`}
              onClick={spinKillerBuild}
              disabled={isKillerBuildSpinning}
            >
              {isKillerBuildSpinning ? 'Spinning...' : 'Spin Perks'}
            </button>
            
            {selectedKillerPerks.length > 0 && (
              <div className="perks-container">
                <h4>Perks:</h4>
                <ul className="perks-list">
                  {selectedKillerPerks.map((perk, index) => (
                    <li key={index}>{perk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Survivor Perks Wheel */}
          <div className="wheel-section">
            <h2>Survivor Perks</h2>
            <div className={`result ${isSurvivorBuildSpinning ? 'spinning' : ''}`}>
              {selectedSurvivorBuild || 'Survivor Build'}
            </div>
            <button 
              className={`spin-button ${isSurvivorBuildSpinning ? 'spinning' : ''}`}
              onClick={spinSurvivorBuild}
              disabled={isSurvivorBuildSpinning}
            >
              {isSurvivorBuildSpinning ? 'Spinning...' : 'Spin Perks'}
            </button>
            
            {selectedSurvivorPerks.length > 0 && (
              <div className="perks-container">
                <h4>Perks:</h4>
                <ul className="perks-list">
                  {selectedSurvivorPerks.map((perk, index) => (
                    <li key={index}>{perk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="info">
          <div className="build-types">
            <div>
              <strong>Killer Builds:</strong> {killerBuildTypes.join(', ')}
            </div>
            <div>
              <strong>Survivor Builds:</strong> {survivorBuildTypes.join(', ')}
            </div>
          </div>
          <p>This app is not affiliated with Dead by Daylight or any of its developers.</p>
        </div>
      </header>
    </div>
  );
}

export default App;