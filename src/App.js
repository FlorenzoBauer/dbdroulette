import React, { useState, useEffect } from 'react';
import UpdateScreen from './components/UpdateScreen';
import './App.css';
import { killers, survivors, killerBuildThemes, survivorBuildThemes } from './data';

function App() {
  const [showUpdateScreen, setShowUpdateScreen] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('checking');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isDev, setIsDev] = useState(false);

  // NEW: Character selection states - exclude "Other" from initial selection
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [activeCharacterTab, setActiveCharacterTab] = useState('killer');
  const [ownedKillers, setOwnedKillers] = useState(
    killers.filter(k => k.name !== 'Other').map(k => k.name)
  );
  const [ownedSurvivors, setOwnedSurvivors] = useState(
    survivors.filter(s => s.name !== 'Other').map(s => s.name)
  );

  useEffect(() => {
    const devMode = window.location.protocol === 'http:';
    setIsDev(devMode);
    
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

      if (!devMode) {
        setTimeout(() => {
          window.electronAPI.checkForUpdates();
        }, 500);
      } else {
        setShowUpdateScreen(false);
      }
    } else {
      setIsDev(true);
      setShowUpdateScreen(false);
    }

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

  // UPDATED: Get available perks based on owned characters with "Other" category fallback
  const getAvailableKillerPerks = () => {
    const ownedKillerObjects = killers.filter(k => ownedKillers.includes(k.name));
    const characterPerks = ownedKillerObjects.flatMap(k => k.perks);
    
    // Always include "Other" category perks
    const otherKiller = killers.find(k => k.name === 'Other');
    const otherPerks = otherKiller ? otherKiller.perks : [];
    
    return [...new Set([...characterPerks, ...otherPerks])];
  };

  const getAvailableSurvivorPerks = () => {
    const ownedSurvivorObjects = survivors.filter(s => ownedSurvivors.includes(s.name));
    const characterPerks = ownedSurvivorObjects.flatMap(s => s.perks);
    
    // Always include "Other" category perks
    const otherSurvivor = survivors.find(s => s.name === 'Other');
    const otherPerks = otherSurvivor ? otherSurvivor.perks : [];
    
    return [...new Set([...characterPerks, ...otherPerks])];
  };

  // NEW: Character selection handlers
  const toggleKillerOwnership = (killerName) => {
    setOwnedKillers(prev => 
      prev.includes(killerName) 
        ? prev.filter(name => name !== killerName)
        : [...prev, killerName]
    );
  };

  const toggleSurvivorOwnership = (survivorName) => {
    setOwnedSurvivors(prev => 
      prev.includes(survivorName) 
        ? prev.filter(name => name !== survivorName)
        : [...prev, survivorName]
    );
  };

  // UPDATED: Select all/none functions - exclude "Other"
  const selectAllKillers = () => setOwnedKillers(
    killers.filter(k => k.name !== 'Other').map(k => k.name)
  );
  const selectNoKillers = () => setOwnedKillers([]);
  const selectAllSurvivors = () => setOwnedSurvivors(
    survivors.filter(s => s.name !== 'Other').map(s => s.name)
  );
  const selectNoSurvivors = () => setOwnedSurvivors([]);

  // Helper functions to get display counts (excluding "Other")
  const getDisplayKillers = () => killers.filter(k => k.name !== 'Other');
  const getDisplaySurvivors = () => survivors.filter(s => s.name !== 'Other');

  // NEW: Updated perk functions that use available perks
  const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRandomPerks = (perkPool, count = 4) => {
    if (perkPool.length === 0) return [];
    const shuffled = [...perkPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, perkPool.length));
  };

  // UPDATED: Build perk functions with "Other" category fallback
  const getSurvivorBuildPerks = (buildType) => {
    const availablePerks = getAvailableSurvivorPerks();
    
    if (buildType === 'Random') {
      return getRandomPerks(availablePerks, 4);
    }

    const themePerks = survivorBuildThemes[buildType] || [];
    const availableThemePerks = themePerks.filter(perk => availablePerks.includes(perk));
    
    if (availableThemePerks.length >= 4) {
      return getRandomPerks(availableThemePerks, 4);
    } else {
      // Get remaining perks from available pool (including "Other" category)
      const remainingAvailablePerks = availablePerks.filter(p => !availableThemePerks.includes(p));
      const remainingPerks = getRandomPerks(remainingAvailablePerks, 4 - availableThemePerks.length);
      return [...availableThemePerks, ...remainingPerks];
    }
  };

  const getKillerBuildPerks = (buildType) => {
    const availablePerks = getAvailableKillerPerks();
    
    if (buildType === 'Random') {
      return getRandomPerks(availablePerks, 4);
    }
    
    const themePerks = killerBuildThemes[buildType] || [];
    const availableThemePerks = themePerks.filter(perk => availablePerks.includes(perk));
    
    if (availableThemePerks.length >= 4) {
      return getRandomPerks(availableThemePerks, 4);
    } else {
      // Get remaining perks from available pool (including "Other" category)
      const remainingAvailablePerks = availablePerks.filter(p => !availableThemePerks.includes(p));
      const remainingPerks = getRandomPerks(remainingAvailablePerks, 4 - availableThemePerks.length);
      return [...availableThemePerks, ...remainingPerks];
    }
  };

  // NEW: Updated killer spin function that only uses owned killers (excluding "Other")
  const spinKiller = () => {
    setIsKillerSpinning(true);
    let spins = 0;
    const maxSpins = 15;
    
    const spinInterval = setInterval(() => {
      const availableKillers = killers.filter(k => ownedKillers.includes(k.name) && k.name !== 'Other');
      if (availableKillers.length > 0) {
        setSelectedKiller(getRandomItem(availableKillers).name);
      }
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

  const handleUpdateComplete = () => {
    setShowUpdateScreen(false);
  };

  const survivorBuildTypes = ['Tunneling', 'Stealth', 'Gens-Rushing', 'Chase', 'Boon', 'Info', 'Conviction', 'Healing', 'Breakout', 'Meme', 'Random'];
  const killerBuildTypes = ["Speed", "Scourge", "Vaulting", "Stealth", "Gens-Slowing", "Gen-Damage", "End-Game", "Basement", "Hex", "Info", "Meme", "Random"];

  const [selectedKiller, setSelectedKiller] = useState('');
  const [selectedKillerBuild, setSelectedKillerBuild] = useState('');
  const [selectedKillerPerks, setSelectedKillerPerks] = useState([]);
  const [selectedSurvivorBuild, setSelectedSurvivorBuild] = useState('');
  const [selectedSurvivorPerks, setSelectedSurvivorPerks] = useState([]);
  
  const [isKillerSpinning, setIsKillerSpinning] = useState(false);
  const [isKillerBuildSpinning, setIsKillerBuildSpinning] = useState(false);
  const [isSurvivorBuildSpinning, setIsSurvivorBuildSpinning] = useState(false);

  if (showUpdateScreen && !isDev) {
    return <UpdateScreen 
      updateStatus={updateStatus} 
      updateProgress={updateProgress}
      onUpdateComplete={handleUpdateComplete} 
    />;
  }

  return (
    <div className="App">
      {/* NEW: Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <button 
            className="character-selector-btn"
            onClick={() => setShowCharacterSelector(!showCharacterSelector)}
          >
            Character Selection ({ownedKillers.length}/{getDisplayKillers().length} killers, {ownedSurvivors.length}/{getDisplaySurvivors().length} survivors)
          </button>
        </div>
        <div className="nav-center">
          <h1>🎮 Trial Randomizer 🎮</h1>
        </div>
        <div className="nav-right">
          {/* Future nav items can go here */}
        </div>
      </nav>

      {/* NEW: Character Selection Dropdown */}
      {showCharacterSelector && (
        <div className="character-selector-overlay">
          <div className="character-selector-modal">
            <div className="character-tabs">
              <button 
                className={`tab-button ${activeCharacterTab === 'killer' ? 'active' : ''}`}
                onClick={() => setActiveCharacterTab('killer')}
              >
                Killers ({ownedKillers.length}/{getDisplayKillers().length})
              </button>
              <button 
                className={`tab-button ${activeCharacterTab === 'survivor' ? 'active' : ''}`}
                onClick={() => setActiveCharacterTab('survivor')}
              >
                Survivors ({ownedSurvivors.length}/{getDisplaySurvivors().length})
              </button>
            </div>

            <div className="character-content">
              {activeCharacterTab === 'killer' && (
                <div className="killer-selection">
                  <div className="selection-controls">
                    <button onClick={selectAllKillers}>Select All</button>
                    <button onClick={selectNoKillers}>Select None</button>
                  </div>
                  <div className="character-grid">
                    {getDisplayKillers().map(killer => (
                      <label key={killer.name} className="character-checkbox">
                        <input
                          type="checkbox"
                          checked={ownedKillers.includes(killer.name)}
                          onChange={() => toggleKillerOwnership(killer.name)}
                        />
                        <span className="checkmark"></span>
                        {killer.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeCharacterTab === 'survivor' && (
                <div className="survivor-selection">
                  <div className="selection-controls">
                    <button onClick={selectAllSurvivors}>Select All</button>
                    <button onClick={selectNoSurvivors}>Select None</button>
                  </div>
                  <div className="character-grid">
                    {getDisplaySurvivors().map(survivor => (
                      <label key={survivor.name} className="character-checkbox">
                        <input
                          type="checkbox"
                          checked={ownedSurvivors.includes(survivor.name)}
                          onChange={() => toggleSurvivorOwnership(survivor.name)}
                        />
                        <span className="checkmark"></span>
                        {survivor.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              className="close-selector"
              onClick={() => setShowCharacterSelector(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className="App-header">
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
              disabled={isKillerSpinning || ownedKillers.length === 0}
            >
              {isKillerSpinning ? 'Spinning...' : 'Spin Killer'}
            </button>
            {ownedKillers.length === 0 && (
              <p className="warning">No killers selected!</p>
            )}
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