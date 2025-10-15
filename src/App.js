import React, { useState, useEffect } from 'react';
import UpdateScreen from './components/UpdateScreen';
import './App.css';

function App() {
  const [showUpdateScreen, setShowUpdateScreen] = useState(true);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    const { ipcRenderer } = window.require('electron');
    setIsDev(process.env.NODE_ENV === 'development');
    
    // In development, skip update screen
    if (process.env.NODE_ENV === 'development') {
      setShowUpdateScreen(false);
    }
  }, []);

  const handleUpdateComplete = () => {
    setShowUpdateScreen(false);
  };

  //Actual app content 
  const killers = [
    'Trapper', 'Wraith', 'Hillbilly', 'Nurse', 'Huntress', 'Shape', 'Hag',
    'Doctor', 'Cannibal', 'Nightmare', 'Pig', 'Clown', 'Spirit', 'Legion',
    'Plague', 'Ghost Face', 'Demogorgon', 'Oni', 'Deathslinger', 'Executioner',
    'Blight', 'Twins', 'Trickster', 'Nemesis', 'Cenobite', 'Artist', 'Onryō',
    'Dredge', 'Mastermind', 'Knight', 'Skull Merchant', 'Xenomorph', 'Good Guy'
  ];

  const killerPerks = [
    'Barbecue & Chilli', 'Hex: Ruin', 'Hex: Undying', 'Pop Goes the Weasel',
    'Corrupt Intervention', 'Scourge Hook: Pain Resonance', 'No Way Out',
    'Deadlock', 'Save the Best for Last', 'Play With Your Food', 'Tinkerer',
    'Discordance', 'Thanatophobia', 'Dying Light', 'Bamboozle', 'Brutal Strength',
    'Enduring', 'Spirit Fury', 'A Nurse\'s Calling', 'Agitation', 'Monitor & Abuse',
    'Overcharge', 'Unnerving Presence', 'Hex: Devour Hope', 'Hex: Thrill of the Hunt',
    'Hex: Haunted Ground', 'Blood Warden', 'Fire Up', 'Beast of Prey', 'Territorial Imperative',
    'Predator', 'Shadowborn', 'Lightborn', 'Franklin\'s Demise', 'Iron Grasp',
    'Remember Me', 'Blood Echo', 'Zanshin Tactics', 'Nemesis', 'Gearhead',
    'Coulrophobia', 'Infectious Fright', 'Forced Penance', 'Trail of Torment',
    'Deathbound', 'Dark Devotion', 'I\'m All Ears', 'Thrilling Tremors',
    'Furtive Chase', 'Starstruck', 'Hex: Blood Favor', 'Hex: Retribution',
    'Hoarder', 'Oppression', 'Coup de Grâce', 'Nowhere to Hide', 'Call of Brine',
    'Merciless Storm', 'Septic Touch', 'Grim Embrace', 'Lethal Pursuer',
    'Darkness Revealed', 'Dissolution', 'Forced Hesitation', 'Game Afoot',
    'Hubris', 'Rapid Brutality', 'Superior Anatomy', 'Machine Learning',
    'Thwack!', 'Leverage', 'Made for This', 'Scavenger', 'Wiretap'
  ];

  const survivorPerks = [
    'Dead Hard', 'Decisive Strike', 'Borrowed Time', 'Self-Care',
    'Spine Chill', 'Iron Will', 'Adrenaline', 'Balanced Landing',
    'Sprint Burst', 'Lithe', 'Quick & Quiet', 'Dance With Me',
    'Windows of Opportunity', 'Prove Thyself', 'Botany Knowledge',
    'Empathy', 'Kindred', 'Alert', 'Dark Sense', 'Deja Vu',
    'Hope', 'No One Left Behind', 'We\'ll Make It', 'We\'re Gonna Live Forever',
    'Bond', 'Leader', 'Open-Handed', 'Up the Ante', 'Ace in the Hole',
    'Plunderer\'s Instinct', 'Slippery Meat', 'Small Game', 'This Is Not Happening',
    'Urban Evasion', 'Unbreakable', 'Saboteur', 'Breakdown', 'Buckle Up',
    'Mettle of Man', 'Flip-Flop', 'Power Struggle', 'Tenacity',
    'Blood Pact', 'Desperate Measures', 'For the People', 'Guardian',
    'Off the Record', 'Soul Guard', 'Any Means Necessary', 'Autodidact',
    'Better Together', 'Breakout', 'Built to Last', 'Corrective Action',
    'Distortion', 'Diversion', 'Fixated', 'Flashbang',
    'Fogwise', 'Hyperfocus', 'Inner Healing', 'Inner Strength',
    'Overzealous', 'Parental Guidance', 'Poised', 'Potential Energy',
    'Reactive Healing', 'Red Herring', 'Renewal', 'Repressed Alliance',
    'Residual Manifest', 'Rookie Spirit', 'Smash Hit', 'Stake Out',
    'Stormborn', 'Teamwork: Power of Two', 'Teamwork: Collective Stealth', 'Vigil',
    'Visionary', 'Wake Up!', 'Wiretap', 'Background Player',
    'Chemical Trap', 'Dramaturgy', 'Friendly Competition', 'Head On',
    'Hex: Pentimento', 'Low Profile', 'Object of Obsession', 'Plot Twist',
    'Premonition', 'Resurgence', 'Solidarity', 'Streetwise',
    'Technician', 'Unburied', 'Visionary', 'Breakdown'
  ];

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

    // Define survivor build themes with specific perks
    
      const survivorBuildThemes = {
      'Tunneling': ['Decisive Strike', 'Dramaturgy', 'Off The Record', 'Unbreakable', 'Overcome', 'Wicked', 'Deliverance', 'Shoulder the Burden', 'Borrowed Time', 'Head On', 'Moment of Glory', 'Second Wind', 'Pick your own Exhaust', 'Resurgence', 'Slippery Meat', 'Power Struggle', 'Flip Flop', 'Unbreakable', 'Buckle Up'],
      'Stealth': ['Distortion', 'Parental Guidance', 'Off the Record', 'Dance With Me', 'Ghost Notes', 'Iron Will', 'Cut Loose', 'Quick & Quiet', 'Urban Evasion', 'Fixated', 'Light-footed', 'Lucky Star', 'Low Profile', 'Lucky Break', 'Lightweight', 'Plot Twist', 'Calm Spirit', 'Diversion', 'Deception'],
      'Gens-Rushing': ['Stakeout', 'Weaving Spiders', 'Built To Last', 'HyperFocus', 'Bardic Inspiration', 'Prove Thyself', 'Leader', 'One, Two, Three', 'Resilience', 'Potential Energy', 'Technician', 'Fast Track', 'Friendly Competition', 'Overzealous', 'Deadline', 'Repressed Alliance'],
      'Chase': ['Finesse', 'Resilience', 'Windows of Opportunity', 'Lithe','Adrenaline','Balanced Landing', 'Sprint Burst', 'Dead Hard', 'Chemical Trap', 'Hope', 'Vigil', 'Fixated', 'Last Stand', 'Made for This', 'Overcome', 'Quick Gambit', 'Exulation', 'Champion of Light', 'Smash Hit'],
      'Boon': ['Circle Of Healing', 'Exponential', 'Dark Theory', 'Shadow Step', 'Illumination'],
      'Info': ['Deja Vu', 'Detective\'s Hunch', 'Wiretap', 'Object of Obsession', 'Alert', 'Kindred', 'Empathy', 'Bond', 'Clairvoyance', 'Dark Sense', 'Fogwise', 'Inner Focus', 'Tracherous Crows', 'Left Behind', 'Lucky Star', 'Premonition', 'Visionary', 'Wake Up!', 'Rookie Spirit', 'Plunderer\'s Instinct', 'Small Game', 'Still Light', 'Trouble Shooter', 'Better Together'],
      'Conviction': ['Conviction', 'Soul Guard', 'Plot twist', 'Unbreakable', 'Boon: Exponential', 'Tenacity', 'Flip-Flop', 'Power Struggle', 'No Mither'],
      'Healing': ['Auto-Didact', 'One, Two, Three', 'We\'ll Make it', 'Pharmacy', 'Self-Care', 'Empathy', 'Botany Knowledge', 'Clean Break', 'Inner Healing', 'Do No Harm', 'Empathic Connection', 'Blood Pact', 'Reactive Healing', 'Resilience', 'Resurgence', 'Solidarity', 'Strength in Shadows','We\'re Gonna Live Forever'],
      'Breakout': ['Breakout', 'Mettle Of Man', 'Self-Care', 'Background Player', 'For the People', 'Sabatuer', 'Champion of Light', 'Any Means Necessary', 'Flashbang'],
      'Meme': ['FlashBang', 'Mirrored Illusion', 'Scene Partner', 'Head On', 'Boiled Over', 'No Mither', 'Any Means Necessary', 'Bardic Inspiration', 'One, Two, Three', 'Object of Obsession', 'Diversion', 'For the People', 'Blast Mine', 'Dramaturgy', 'Plot Twist', 'Up the Ante', 'Ace in the Hole', 'Open-Handed']
    };

    const themePerks = survivorBuildThemes[buildType] || [];
    
    // Always pick 4 random perks from the theme
    if (themePerks.length >= 4) {
      return getRandomPerks(themePerks, 4);
    } else {
      // If not enough theme perks, fill with random perks from the full pool
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
    
    
    // Define killer build themes with specific perks
    const killerBuildThemes = {
      'Speed': ['Batteries Included', 'Furtive Chase', 'Machine Learning', 'Rapid Brutality', 'Unbound'],
      'Vaulting': ['Bamboozle', 'Dark Arrogance', 'Super Anatomy', 'Fire Up', 'Unbound'],
      'Stealth': ['Hex: Plaything', 'Unforeseen', 'Furtive Chase', 'Trail of Torment', 'Dark Devotion', 'Insidious'],
      'Gens-Slowing': ['Dying Light', 'Thanatophobia', 'Ruin', 'Hex: Pentimento', 'Dead Man\'s Switch'],
      'Gen-Damage': ['Pop', 'Surge', 'Eruption', 'Scourge Hook: Pain Resonance', 'Call of Brine', 'Oppression'],
      "End-Game": ['Remember Me', 'Blood Warden', 'No-ed', 'Haywire', 'No Way Out', 'Terminus', 'Ranchor','None Are Free'],
      'Basement': ['Insidious', 'Mad Grit', 'Agitation', 'Brutal Strength', 'Enduring', 'Iron Grasp', 'Monstrous Shrine', 'Territorial Imperative'],
      'Hex': ['Devour Hope', 'Face the Darkness', 'Thrill of the Hunt', 'Haunted Grounds', 'Pentimento', 'Blood Favor', 'Retribution','Crowd Control', 'Third Seal', 'Huntress Lullaby', 'Nothing But Misery', 'Overature of Doom', 'Ruin', 'Two Can Play', 'Undying', 'Wretched Fate', 'No Ed', 'Plaything'],
      'Info': ['Reveal the Darkness', 'Discordance', 'Barbecue', 'Nurse\'s Calling', 'Nowhere to Hide', 'Bitter Murmur', 'Infectious Fright', 'Lethal Pursuer', 'Floods of Rage', 'Iron Maiden', 'Predator', 'I\'m All Ears', 'Retribution', 'Nemesis', 'Deer Stalker', 'Lightborn', 'Weave Attunement', 'Wandering Eye', 'Zanshin Tactics', 'Twack!', 'Jagged Compass', 'Alien Instinct', 'Dragon\'s Grip', 'Gearhead', 'Friends til the End', 'Grim Embrace', 'Ranchor'],
      'Meme': ['Spirit Fury', 'Lightborn', 'Franklin\'s Demise', 'Phantom Fear', 'Distressing', 'Coup de Grace', 'Merciless Storm', 'No Quarter']
    };
    
    const themePerks = killerBuildThemes[buildType] || [];
    
    // Always pick 4 random perks from the theme
    if (themePerks.length >= 4) {
      return getRandomPerks(themePerks, 4);
    } else {
      // If not enough theme perks, fill with random perks from the full pool
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

   if (showUpdateScreen && !isDev) {
    return <UpdateScreen onUpdateComplete={handleUpdateComplete} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 DBD Roulette 🎮</h1>
        <p>Spin for your next Dead by Daylight loadout!</p>
        
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
            
            {/* Killer Perks Display */}
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
            
            {/* Survivor Perks Display */}
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