import React, { useEffect, useState, useRef, useCallback } from "react";

// --- Icon Mapping (Using inline SVGs) ---
const IconMap = {
  Music: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  BookOpen: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Gamepad2: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 12h4"/><path d="M8 10v4"/><path d="M15 13v2"/><path d="M14 14h2"/><path d="M16.8 17.6a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 0 0-2.8l-4.2-4.2a2 2 0 0 0-2.8 0l-1.4 1.4a2 2 0 0 0 0 2.8l4.2 4.2z"/><path d="M18 10h.01"/><path d="M6.2 6.2a2 2 0 0 0-2.8 0l-1.4 1.4a2 2 0 0 0 0 2.8l4.2 4.2a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 0 0-2.8l-4.2-4.2z"/></svg>,
  CloudRain: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>,
  Coffee: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M10 16h1"/><path d="M12 2v2"/><path d="M15 2v2"/><path d="M9 2v2"/></svg>,
  Custom: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>,
  Search: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Youtube: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>,
  Volume: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  ChevronDown: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m6 9 6 6 6-6"/></svg>,
  ChevronUp: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m18 15-6-6-6 6"/></svg>,
};
// --------------------------------------------------------------------------

// --- MOCK PLAYLIST DATA (Static) ---
const generateMockItem = (title, index, videoId = null) => ({
    title,
    videoId: index === 0 && videoId ? videoId : `mock_id_${Math.random().toString(36).substring(2, 9)}`,
    thumbnail: `https://placehold.co/60x34/${['3b82f6', '10b981', 'f97316', 'ef4444', '8b5cf6'][index % 5]}/ffffff?text=IMG`,
});

const generateMockList = (titles, firstVideoId = null) => 
    titles.map((title, index) => generateMockItem(title, index, firstVideoId));

const INITIAL_PLAYLISTS = {
    lofi: { id: "PLr5OsF2umnimx18HT9J14cCBi3q-ujjkL", name: "Lofi Beats", icon: "Music", mockItems: generateMockList(["Chill Study Session", "Relaxing Piano Mix", "Late Night Vibes", "Morning Focus Tracks"]) },
    study: { id: "PLqLz5L3P9T-I37pT0037P8fX1t9rF4e47", name: "Study Music", icon: "BookOpen", mockItems: generateMockList(["Concentration Flow", "Classical Focus", "Deep Work Zone", "Ambient Background"]) },
    deepfocus: { 
        id: "PL6NdkXsPL07KN01gH2vucrHCEyyNmVEx4", name: "Deep Focus Ambient", icon: "BookOpen", 
        mockItems: [
            { title: "Calm Inner Space (Default Track)", videoId: "UJs6__K7gSY", thumbnail: "https://placehold.co/60x34/6366f1/ffffff?text=DEF" },
            { title: "Ambient Flow State (Focus Pt. 2)", videoId: "qEN5ZHDi1Kg", thumbnail: "https://placehold.co/60x34/14b8a6/ffffff?text=QEN" },
            { title: "Concentration Loop", videoId: "8b3fqIBrNW0", thumbnail: "https://placehold.co/60x34/f97316/ffffff?text=8B3" },
            { title: "Zen Garden Drone", videoId: "xsDnEj2Hx4Q", thumbnail: "https://placehold.co/60x34/ef4444/ffffff?text=XSD" },
            { title: "Minimalist Focus Drone", videoId: "wgwcBTrY9og", thumbnail: "https://placehold.co/60x34/a855f7/ffffff?text=WGW" },
        ]
    },
    retro: { id: "PLr2uB2k9Gv47P_d_k6Qy29xY8u0QW3h4P", name: "Retro/Synthwave", icon: "Gamepad2", mockItems: generateMockList(["80s Arcade Tapes", "Future City Drive", "Neon Dreams", "Pixelated Sunset"]) },
    rainy: { id: "PL_l_2W73y9M16c9bX7fN0M4YJ5w1k8L0X", name: "Rainy Day Jazz", icon: "CloudRain", mockItems: generateMockList(["Smooth Jazz Cafe", "Muted Trumpet Solos", "Evening Drizzle", "Soft Thunderstorm"]) },
    coffee: { id: "PLjE9h53Vv25eYf-P2m9zC581lQy6W9yS6", name: "Coffee Shop Jazz", icon: "Coffee", mockItems: generateMockList(["Morning Brew", "Busy Cafe Sounds", "Acoustic Focus", "Jazz Bossa Nova"]) },
};

// --- Ambient Sound Definitions ---
const AMBIENT_SOUNDS = {
  rain: { name: "Rain", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", defaultVolume: 0.4 },
  cafe: { name: "Café", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", defaultVolume: 0.3 },
  thunder: { name: "Thunder", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", defaultVolume: 0.5 }, 
  fireplace: { name: "Fireplace", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", defaultVolume: 0.6 }, 
};

// --- Default Settings (Used if localStorage is empty) ---
const DEFAULTS = { 
    work: 25 * 60, 
    short: 5 * 60, 
    long: 15 * 60, 
    cyclesBeforeLong: 4,
    theme: "gradient",
    dark: false,
    mode: "work",
    secondsLeft: 25 * 60,
    running: false,
    cycleCount: 0,
    masterVolume: 0.8,
    selectedPlaylist: "deepfocus",
    currentVideoId: INITIAL_PLAYLISTS.deepfocus.mockItems[0].videoId,
    isMediaPlaying: false,
    taskSectionTitle: "Daily Focus",
    tasks: [], // Tasks are stored as an array locally now
    ambientVolumes: Object.keys(AMBIENT_SOUNDS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
};

// --- Local Storage Helper ---
const saveToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Failed to save ${key} to local storage:`, e);
    }
};

const loadFromLocalStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage, using default.`, error);
        return defaultValue;
    }
};


export default function HarmonyFocusC() {
  const timerRef = useRef(null);
  const audioRefs = useRef({});

  // --- State Initialization (Load from Local Storage) ---
  const [theme, setTheme] = useState(() => loadFromLocalStorage('theme', DEFAULTS.theme));
  const [dark, setDark] = useState(() => loadFromLocalStorage('dark', DEFAULTS.dark));

  const [durations, setDurations] = useState(() => loadFromLocalStorage('durations', { work: DEFAULTS.work, short: DEFAULTS.short, long: DEFAULTS.long }));
  const [mode, setMode] = useState(() => loadFromLocalStorage('mode', DEFAULTS.mode));
  const [running, setRunning] = useState(() => loadFromLocalStorage('running', DEFAULTS.running));
  const [cycleCount, setCycleCount] = useState(() => loadFromLocalStorage('cycleCount', DEFAULTS.cycleCount));
  
  // SecondsLeft depends on mode and duration, so it needs special loading logic
  const initialSecondsLeft = loadFromLocalStorage('secondsLeft', DEFAULTS.secondsLeft);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft > 0 ? initialSecondsLeft : durations[mode]);

  const [tasks, setTasks] = useState(() => loadFromLocalStorage('tasks', DEFAULTS.tasks));
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [taskSectionTitle, setTaskSectionTitle] = useState(() => loadFromLocalStorage('taskSectionTitle', DEFAULTS.taskSectionTitle));
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(taskSectionTitle);
  
  const [isMediaPlaying, setIsMediaPlaying] = useState(() => loadFromLocalStorage('isMediaPlaying', DEFAULTS.isMediaPlaying)); 
  const [selectedPlaylist, setSelectedPlaylist] = useState(() => loadFromLocalStorage('selectedPlaylist', DEFAULTS.selectedPlaylist)); 
  const currentPlaylist = INITIAL_PLAYLISTS[selectedPlaylist] || INITIAL_PLAYLISTS.deepfocus;
  const [currentVideoId, setCurrentVideoId] = useState(() => loadFromLocalStorage('currentVideoId', currentPlaylist.mockItems[0].videoId)); 
  const [apiWarning, setApiWarning] = useState(null); 

  const [masterVolume, setMasterVolume] = useState(() => loadFromLocalStorage('masterVolume', DEFAULTS.masterVolume));  
  const [ambientVolumes, setAmbientVolumes] = useState(() => loadFromLocalStorage('ambientVolumes', DEFAULTS.ambientVolumes));
  
  // Toggles for UI sections
  const [isTracklistOpen, setIsTracklistOpen] = useState(true);
  const [isAmbientMixerOpen, setIsAmbientMixerOpen] = useState(true);

  // --- Local Storage Sync Effects ---

  // 1. Sync App Preferences (Theme, Dark Mode, Titles)
  useEffect(() => {
    saveToLocalStorage('theme', theme);
    saveToLocalStorage('dark', dark);
    saveToLocalStorage('taskSectionTitle', taskSectionTitle);
  }, [theme, dark, taskSectionTitle]);

  // 2. Sync Timer Settings (Durations, Cycles)
  useEffect(() => {
    saveToLocalStorage('durations', durations);
    saveToLocalStorage('cycleCount', cycleCount);
  }, [durations, cycleCount]);
  
  // 3. Sync Media Settings
  useEffect(() => {
    saveToLocalStorage('selectedPlaylist', selectedPlaylist);
    saveToLocalStorage('currentVideoId', currentVideoId);
    saveToLocalStorage('isMediaPlaying', isMediaPlaying);
    saveToLocalStorage('masterVolume', masterVolume);
    saveToLocalStorage('ambientVolumes', ambientVolumes);
  }, [selectedPlaylist, currentVideoId, isMediaPlaying, masterVolume, ambientVolumes]);

  // 4. Sync Tasks (Always save tasks array when it changes)
  useEffect(() => {
    saveToLocalStorage('tasks', tasks);
  }, [tasks]);

  // 5. Sync Running Timer State (Mode, SecondsLeft, Running Status)
  // This runs frequently to handle browser/tab crashes
  useEffect(() => {
    const saveTimerState = () => {
        saveToLocalStorage('mode', mode);
        saveToLocalStorage('secondsLeft', secondsLeft);
        saveToLocalStorage('running', running);
    };

    // Save state immediately on change
    saveTimerState();

    // Set up an interval for frequent saving if running, in case of unexpected closure
    let interval;
    if (running) {
        interval = setInterval(saveTimerState, 5000); // Save every 5 seconds
    }
    
    return () => clearInterval(interval);
  }, [mode, secondsLeft, running]);
  
  // --- Timer Actions (Helper functions) ---
  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }
  const percentComplete = () => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };
  
  function startStop() { setRunning((r) => !r); }
  
  function resetTimer(toMode = mode) {
    setRunning(false);
    setMode(toMode);
    setSecondsLeft(durations[toMode]);
  }

  function handleTimerEnd() {
    setRunning(false);
    
    let nextMode;
    let newCycleCount = cycleCount;
    
    if (mode === "work") {
      newCycleCount = cycleCount + 1;
      if (newCycleCount % DEFAULTS.cyclesBeforeLong === 0) {
        nextMode = "long";
      } else {
        nextMode = "short";
      }
      setCycleCount(newCycleCount);
    } else { // break modes
      nextMode = "work";
    }
    
    setMode(nextMode);
    setSecondsLeft(durations[nextMode]);
    
    // Auto-start the next timer after a brief pause
    setTimeout(() => {
        setRunning(true); 
    }, 2000);
  }


  // 1. Timer Tick Effect
  useEffect(() => {
    if (running && secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && running) {
      handleTimerEnd();
    }
    return () => clearTimeout(timerRef.current);
  }, [running, secondsLeft, mode, durations, cycleCount]);


  // --- Settings and Configuration Update Functions ---

  function setDuration(durationMode, valueInMinutes) {
    const valueInSeconds = Number(valueInMinutes) * 60;
    const newDurations = { ...durations, [durationMode]: valueInSeconds };
    
    setDurations(newDurations);
    
    // If the currently active mode's duration is changed, reset the timer
    if (mode === durationMode) {
      resetTimer(durationMode);
    }
  }

  function toggleTheme(newTheme) {
    setTheme(newTheme);
  }

  function toggleDarkMode() {
    setDark(d => !d);
  }


  // --- Task Management Functions (CRUD with Local Storage) ---

  function addTask() {
    if (!newTask.trim()) return;
    
    const newTaskItem = {
      id: Date.now().toString(), // Use timestamp for unique ID
      text: newTask.trim(),
      done: false,
    };

    // Prepend the new task to the array
    setTasks(prevTasks => [newTaskItem, ...prevTasks]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function removeTask(id) {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }
  
  function startEdit(task) { setEditingTaskId(task.id); setEditingText(task.text); }
  
  function saveEdit(id) {
    if (!editingText.trim()) {
      setEditingTaskId(null);
      return;
    }
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, text: editingText.trim() } : task
      )
    );
    setEditingTaskId(null);
  }

  function handleTitleChange(e) { setTitleInput(e.target.value); }
  
  function saveTitle() { 
    setTaskSectionTitle(titleInput); 
    setIsTitleEditing(false); 
  }
  
  function cancelTitleEdit() {
    setTitleInput(taskSectionTitle);
    setIsTitleEditing(false);
  }

  // --- Media/YouTube Control Handlers ---

  const toggleMediaPlayback = () => {
    const newState = !isMediaPlaying;
    setIsMediaPlaying(newState);

    if (newState && !currentVideoId) {
        setCurrentVideoId(currentPlaylist.mockItems[0].videoId);
    }
  };

  const handleTrackClick = (track) => {
    setCurrentVideoId(track.videoId);
    setIsMediaPlaying(true); 
    
    const warningMessage = `Requested to play: **"${track.title}"**! If we had a YouTube API key, this song would start immediately. The player URL is now set to Video ID: ${track.videoId}.`;
    setApiWarning(warningMessage);
    setTimeout(() => setApiWarning(null), 8000);
  };
  
  // Reset video on playlist change
  useEffect(() => {
    if (currentPlaylist.mockItems && currentPlaylist.mockItems.length > 0) {
        if (currentVideoId !== currentPlaylist.mockItems[0].videoId) {
            setCurrentVideoId(currentPlaylist.mockItems[0].videoId);
            setIsMediaPlaying(false);
        }
    }
    setApiWarning(null); 
  }, [selectedPlaylist]);


  // --- Ambient Sound Mixer Logic ---
  
  function handleAmbientVolumeChange(soundKey, newVolume) {
    setAmbientVolumes(prev => ({ ...prev, [soundKey]: newVolume }));
  }

  function toggleAmbientSound(soundKey) {
    const newVolume = ambientVolumes[soundKey] > 0 ? 0 : AMBIENT_SOUNDS[soundKey].defaultVolume;
    setAmbientVolumes(prev => ({ ...prev, [soundKey]: newVolume }));
  }
  
  function handleMasterVolumeChange(newVolume) { 
    setMasterVolume(newVolume);
  }

  // Ambient Audio Control Effect (Play/Pause based on combined volume)
  useEffect(() => {
    Object.keys(AMBIENT_SOUNDS).forEach(key => {
      let audio = audioRefs.current[key];
      if (!audio) {
        audio = new Audio(AMBIENT_SOUNDS[key].url);
        audio.loop = true;
        audioRefs.current[key] = audio;
      }
      
      const combinedVolume = ambientVolumes[key] * masterVolume;
      audio.volume = combinedVolume;

      if (combinedVolume > 0 && audio.paused) {
        // Play audio only if the combined volume is non-zero
        audio.play().catch(e => console.log(`Ambient playback failed for ${key}: `, e));
      } else if (combinedVolume === 0 && !audio.paused) {
        audio.pause();
      }
    });

    return () => {
      // This cleanup ensures audio stops when the component unmounts
      Object.values(audioRefs.current).forEach(audio => {
        if (audio && !audio.paused) audio.pause();
      });
    };
  }, [ambientVolumes, masterVolume]);


  // Logic to construct the iframe URL
  const autoplayParam = isMediaPlaying ? 1 : 0;
  const controlsParam = 0; 
  const brandingParam = 1; 
  const relParam = 0; 

  const youtubeEmbedUrl = currentVideoId 
    ? `https://www.youtube.com/embed/${currentVideoId}?list=${currentPlaylist.id}&autoplay=${autoplayParam}&loop=1&controls=${controlsParam}&modestbranding=${brandingParam}&rel=${relParam}`
    : `https://www.youtube.com/embed/videoseries?list=${currentPlaylist.id}&autoplay=${autoplayParam}&loop=1&controls=${controlsParam}&modestbranding=${brandingParam}&rel=${relParam}`;
  
  // Note: The Firebase loading screen is now removed since data loads instantly from Local Storage.

  return (
    <div className={`min-h-screen p-6 transition-colors font-sans ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        <style dangerouslySetInnerHTML={{__html: `
            /* Custom utility for text shadow on timer */
            .text-shadow-lg {
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
            }
            /* Custom scrollbar styling */
            .max-h-64::-webkit-scrollbar, .max-h-44::-webkit-scrollbar {
                width: 6px;
            }
            .max-h-64::-webkit-scrollbar-thumb, .max-h-44::-webkit-scrollbar-thumb {
                background-color: ${dark ? '#4B5563' : '#D1D5DB'};
                border-radius: 3px;
            }
            .max-h-64::-webkit-scrollbar-track, .max-h-44::-webkit-scrollbar-track {
                background: transparent;
            }
            /* Hide input arrows */
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; margin: 0; 
            }
        `}} />
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left - Timer Card and Tasks (2/3 width on desktop) */}
        <div className={`col-span-1 lg:col-span-2 space-y-6`}>
            
            {/* Timer and Task Container */}
            <div className={`rounded-2xl p-6 shadow-2xl ${theme === "gradient" ? "text-white bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-500" : (dark ? "bg-gray-800" : "bg-white/90 shadow-xl")}`}>
              
              {/* Header */}
              <div className={theme === "gradient" ? "text-white/90" : (dark ? "text-gray-100" : "text-gray-900")}>
                <h1 className="text-2xl font-bold">Amit Focus</h1>
                <p className="text-sm opacity-80">
                    A tranquil workspace for deep work and flow state. (Local Persistence)
                </p>
              </div>
                
              {/* Settings / Other Options Block */}
              <div className="mt-4 p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10 flex flex-wrap gap-4 items-center">
                <h3 className="text-base font-semibold mr-4">Visual Settings:</h3>
                <div className="flex items-center gap-3">
                  <button 
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/40 transition-colors text-sm" 
                    onClick={toggleDarkMode}
                  >
                    {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>
                  <label className="flex items-center space-x-2 text-sm">
                    <span className="opacity-80">Theme:</span>
                    <select 
                        className="rounded-md p-1 text-sm bg-white/40 hover:bg-white/60 text-gray-900" 
                        value={theme} 
                        onChange={(e) => toggleTheme(e.target.value)}
                    >
                      <option value="gradient">Gradient</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </label>
                </div>
              </div>
              {/* End Settings Block */}

              {/* Quick Controls Section (New Feature) */}
              <div className="mt-6 p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10 text-white/90 dark:text-gray-100 shadow-inner">
                <div className="text-sm font-semibold mb-3">Quick Controls</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <button 
                    className="p-3 rounded-xl bg-indigo-500/80 hover:bg-indigo-600 transition-colors shadow-md font-semibold text-lg" 
                    onClick={() => { resetTimer("work"); setRunning(true); }}
                  >
                    Work
                  </button>
                  <button 
                    className="p-3 rounded-xl bg-sky-500/80 hover:bg-sky-600 transition-colors shadow-md font-semibold text-lg" 
                    onClick={() => { resetTimer("short"); setRunning(true); }}
                  >
                   Short Break
                  </button>
                  <button 
                    className="p-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-600 transition-colors shadow-md font-semibold text-lg" 
                    onClick={() => { resetTimer("long"); setRunning(true); }}
                  >
                   Long Break
                  </button>
                </div>
              </div>
              {/* End Quick Controls */}


              {/* Timer Block */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col items-center justify-center p-6 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10 shadow-inner">
                  <div className="text-sm opacity-80">{mode === "work" ? "Focus Time" : mode === "short" ? "Short Break" : "Long Break"}</div>
                  <div className="text-8xl md:text-7xl font-mono my-3 font-extrabold text-shadow-lg">{formatTime(secondsLeft)}</div>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 rounded-xl text-lg font-semibold bg-white/20 hover:bg-white/40 transition-all shadow-md" onClick={startStop}>
                      {running ? "⏸︎ Pause" : "▶ Start"}
                    </button>
                    <button className="px-6 py-2 rounded-xl text-lg bg-white/10 hover:bg-white/30 transition-colors shadow-md" onClick={() => resetTimer(mode)}>
                      ↻ Reset
                    </button>
                  </div>
                  <div className="mt-6 w-full max-w-sm">
                    <div className="text-xs opacity-70 mb-1">Custom Durations (in minutes)</div>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <div className="text-xs opacity-70">Work</div>
                        <input type="number" min="1" className="w-full rounded p-2 text-black bg-white/90" value={Math.round(durations.work / 60)} onChange={(e) => setDuration("work", Number(e.target.value))} />
                      </label>
                      <label className="w-1/3">
                        <div className="text-xs opacity-70">Short</div>
                        <input type="number" min="1" className="w-full rounded p-2 text-black bg-white/90" value={Math.round(durations.short / 60)} onChange={(e) => setDuration("short", Number(e.target.value))} />
                      </label>
                      <label className="w-1/3">
                        <div className="text-xs opacity-70">Long</div>
                        <input type="number" min="1" className="w-full rounded p-2 text-black bg-white/90" value={Math.round(durations.long / 60)} onChange={(e) => setDuration("long", Number(e.target.value))} />
                      </label>
                    </div>
                  </div>
                </div>
                {/* Progress & Quick Info */}
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
                    <div className="text-xs opacity-80">Task Progress</div>
                    <div className="mt-3">
                      <div className="h-3 bg-white/20 rounded overflow-hidden">
                        <div style={{ width: `${percentComplete()}%` }} className="h-full bg-white/80 transition-all"></div>
                      </div>
                      <div className="text-sm mt-2 font-semibold">{percentComplete()}% Complete</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
                    <div className="text-xs opacity-80">Session</div>
                    <div className="mt-3 text-sm font-medium">Cycles Completed: {cycleCount}</div>
                    <div className="mt-2 text-xs opacity-70">Next Long Break: Cycle {DEFAULTS.cyclesBeforeLong}</div>
                  </div>
                </div>
              </div>

              {/* Task List (Renamable Title & Editable Tasks) */}
              <div className="mt-6 p-4 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10">
                {/* Title Editor */}
                <div className="flex items-center justify-between mb-4">
                  {isTitleEditing ? (
                    <div className="flex w-full space-x-2">
                      <input
                        type="text"
                        className="flex-1 rounded p-1 text-black bg-white/90"
                        value={titleInput}
                        onChange={handleTitleChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); }}
                      />
                      <button onClick={saveTitle} className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600 rounded">Save</button>
                      <button onClick={cancelTitleEdit} className="text-sm px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded">Cancel</button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-semibold cursor-pointer" onClick={() => setIsTitleEditing(true)}>
                      {taskSectionTitle} ✍
                    </h3>
                  )}
                </div>

                {/* New Task Input */}
                <div className="mb-4 flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-3 rounded-lg text-black placeholder-gray-500 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                  />
                   <button 
                    onClick={addTask}
                    className="px-4 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-semibold shadow-md"
                    title="Add Task"
                  >
                    + Add
                  </button>
                </div>
                
                {/* Task List */}
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {tasks.length === 0 ? (
                    <li className="text-center opacity-70 italic p-4">Your task list is empty. Add a task to start focusing!</li>
                  ) : (
                    tasks.map((task) => (
                      <li key={task.id} className="flex items-center p-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
                        {editingTaskId === task.id ? (
                          // Editing mode
                          <div className="flex w-full space-x-2">
                            <input
                              type="text"
                              className="flex-1 rounded p-1 text-black bg-white/90"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(task.id); }}
                            />
                            <button onClick={() => saveEdit(task.id)} className="text-xs px-3 py-1 bg-indigo-500 hover:bg-indigo-600 rounded">Save</button>
                            <button onClick={() => setEditingTaskId(null)} className="text-xs px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded">Cancel</button>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => toggleTask(task.id)}
                              className="w-5 h-5 text-indigo-600 bg-gray-100 rounded border-gray-300 focus:ring-indigo-500 mr-3 cursor-pointer"
                            />
                            <span
                              className={`flex-1 text-base cursor-pointer ${task.done ? "line-through opacity-60 italic" : ""}`}
                              onClick={() => startEdit(task)}
                              title="Click to edit"
                            >
                              {task.text}
                            </span>
                            {/* Delete Button */}
                            <button
                              onClick={() => removeTask(task.id)}
                              className="ml-2 w-7 h-7 flex items-center justify-center text-lg rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                              title="Delete task"
                            >
                              
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                            </button>
                          </>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div> {/* End of Timer and Task Container */}

        </div> {/* End of Left Column */}

        {/* Right column - Media Hub (1/3 width on desktop) */}
        <div className="col-span-1">
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-gray-800 shadow-lg lg:sticky lg:top-6 text-gray-900 dark:text-gray-100">
            <h2 className="text-lg font-bold mb-4">Media Hub (Ambient Sounds)</h2>
            
            {/* YouTube Playlist Selector (Icon-based) */}
            <h3 className="text-md font-semibold mb-2 flex items-center">{IconMap.Youtube} <span className="ml-2">Focus Playlists</span></h3>
            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
              {Object.keys(INITIAL_PLAYLISTS).map(key => {
                const playlist = INITIAL_PLAYLISTS[key];
                const isActive = selectedPlaylist === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setSelectedPlaylist(key); }}
                    className={`p-2 rounded-xl flex items-center text-sm transition-all shadow-md 
                                ${isActive ? 'bg-indigo-500 text-white shadow-indigo-500/50' : 'bg-white dark:bg-gray-600 hover:bg-indigo-100 dark:hover:bg-gray-500'}`}
                  >
                    {IconMap[playlist.icon] || IconMap.Custom}
                    <span className="ml-1 hidden sm:inline">{playlist.name}</span>
                  </button>
                );
              })}
            </div>

            {/* YouTube Player & Mock List */}
            {currentPlaylist && (
              <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <h4 className="text-md font-semibold mb-2 text-indigo-600 dark:text-indigo-400">{currentPlaylist.name}</h4>
                
                {/* External Play/Pause Button */}
                <button
                    onClick={toggleMediaPlayback}
                    className={`w-full py-2 mb-3 rounded-lg text-lg font-bold transition-all shadow-md 
                                ${isMediaPlaying ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                >
                    {isMediaPlaying ? '⏸︎ Pause Media' : '▶ Play Media'}
                </button>
                
                {/* API Warning Message */}
                {apiWarning && (
                  <div className="p-2 mb-3 text-xs rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" dangerouslySetInnerHTML={{ __html: apiWarning }}>
                  </div>
                )}
                
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl border-2 border-indigo-500">
                  <iframe 
                    key={youtubeEmbedUrl} // Key forces iframe reload on URL change
                    className="w-full h-full"
                    src={youtubeEmbedUrl} 
                    title={`Youtubelist: ${currentPlaylist.name}`} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                
                {/* Tracklist Preview (WITH TOGGLE) */}
                <div className="mt-3 text-sm">
                    <div 
                        className="flex justify-between items-center font-bold opacity-90 mb-1 cursor-pointer" 
                        onClick={() => setIsTracklistOpen(prev => !prev)}
                    >
                        <p>Tracklist Preview (Click to Select):</p>
                        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            {isTracklistOpen ? IconMap.ChevronUp : IconMap.ChevronDown}
                        </button>
                    </div>
                    
                    {isTracklistOpen && (
                        <>
                            <ul className="space-y-1 max-h-44 overflow-y-auto pr-2">
                                {currentPlaylist.mockItems.map((item) => {
                                  const isCurrentlyPlaying = item.videoId === currentVideoId && isMediaPlaying;
                                  const isCurrentlySelected = item.videoId === currentVideoId;
                                  return (
                                    <li 
                                      key={item.videoId} 
                                      onClick={() => handleTrackClick(item)}
                                      className={`flex items-center p-1 rounded cursor-pointer transition-all border 
                                                  ${isCurrentlyPlaying 
                                                      ? 'font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-gray-600 border-indigo-300 dark:border-indigo-500 shadow-md' 
                                                      : isCurrentlySelected
                                                        ? 'font-medium opacity-90 border-indigo-100 dark:border-gray-500 bg-indigo-50 dark:bg-gray-700'
                                                        : 'opacity-80 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 border-transparent'}`}
                                    >
                                        {/* Mock Thumbnail */}
                                        <img src={item.thumbnail} alt="Mock Thumbnail" className="w-12 h-auto rounded mr-2 flex-shrink-0" />
                                        
                                        <span className="text-xs truncate flex-1">{item.title}</span>
                                        
                                        {isCurrentlyPlaying && (
                                            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500 text-white">Playing</span>
                                        )}
                                    </li>
                                  )
                                })}
                            </ul>
                            <p className="text-xs opacity-60 mt-2">Note: The tracklist changes when switching playlists. Click a track to select it.</p>
                        </>
                    )}
                </div>
              </div>
            )}
            
            {/* Ambient Sound Mixer (WITH TOGGLE) */}
            <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div 
                    className="flex justify-between items-center font-bold text-md cursor-pointer mb-2" 
                    onClick={() => setIsAmbientMixerOpen(prev => !prev)}
                >
                    <h3 className="font-bold">Ambient Sound Mixer</h3>
                    <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        {isAmbientMixerOpen ? IconMap.ChevronUp : IconMap.ChevronDown}
                    </button>
                </div>

                {isAmbientMixerOpen && (
                    <div className="space-y-4">
                        {/* Master Volume Control */}
                        <div className="flex items-center gap-3">
                          {IconMap.Volume}
                          <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={masterVolume}
                              onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
                              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-sm font-semibold w-8">{Math.round(masterVolume * 100)}%</span>
                        </div>
        
                        {/* Individual Ambient Toggles and Sliders */}
                        <div className="grid grid-cols-2 gap-3">
                          {Object.keys(AMBIENT_SOUNDS).map((key) => {
                              const currentVolume = ambientVolumes[key];
                              return (
                                <div key={key} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{AMBIENT_SOUNDS[key].name}</label>
                                        <button 
                                            onClick={() => toggleAmbientSound(key)}
                                            className={`w-6 h-6 rounded-full transition-colors ${currentVolume > 0 ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                                        >
                                            {currentVolume > 0 ? '✔' : ' '}
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={currentVolume}
                                        onChange={(e) => handleAmbientVolumeChange(key, Number(e.target.value))}
                                        className="w-full h-1 mt-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                                        disabled={currentVolume === 0}
                                    />
                                </div>
                              );
                          })}
                        </div>
                        <p className="text-xs opacity-70">Note: Browser may require one click interaction (like 'Play Media') to allow audio to start.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
