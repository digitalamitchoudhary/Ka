import React, { useEffect, useRef, useState } from "react";

// HarmonyFocus - Single-file React component
// Requirements to run:
// - A React app (Vite / Create React App)
// - TailwindCSS configured (for styling classes used below)
//
// Features added: YouTube Playlist selection, Multi-Track Ambient Mixer with Master/Individual Volume, Task Renaming.

export default function Tests() {
  // Timer settings
  const DEFAULTS = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
    cyclesBeforeLong: 4,
  };

  // State for UI and Theme
  const [theme, setTheme] = useState("gradient");
  const [dark, setDark] = useState(false);
  
  // Timer State
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work);
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // Custom intervals (editable by user)
  const [durations, setDurations] = useState(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("hf_durations"));
        return saved ? saved : { work: DEFAULTS.work, short: DEFAULTS.short, long: DEFAULTS.long };
      } catch (e) {
        return { work: DEFAULTS.work, short: DEFAULTS.short, long: DEFAULTS.long };
      }
  });

  // Tasks State
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hf_tasks")) || [];
    } catch (e) {
      return [];
    }
  });
  const [newTask, setNewTask] = useState("");
  // State for task editing
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  
  // Task Section Title State (NEW FEATURE)
  const [taskSectionTitle, setTaskSectionTitle] = useState(() => {
      try {
          return localStorage.getItem("hf_task_title") || "Daily Focus";
      } catch (e) {
          return "Daily Focus";
      }
  });
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(taskSectionTitle);


  // --- Audio State & Refs for Ambient Mixing (UPDATED) ---
  
  // Use useRef to store Audio element references for all tracks
  const audioRefs = useRef({}); 
  const [masterVolume, setMasterVolume] = useState(0.8);  // Master volume for all ambient sounds

  // Ambient track definitions (NEW/UPDATED)
  const AMBIENT_SOUNDS = {
    rain: { name: "Rain", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", defaultVolume: 0.4 },
    cafe: { name: "Café", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", defaultVolume: 0.3 },
    thunder: { name: "Thunder", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", defaultVolume: 0.5 }, // Example URL for thunder/white noise
    fireplace: { name: "Fireplace", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", defaultVolume: 0.6 }, // Example URL
  };
  
  // State to hold individual volume for each ambient track (0 means off)
  const [ambientVolumes, setAmbientVolumes] = useState(() => {
      // Initialize volumes based on AMBIENT_SOUNDS keys, all set to 0 (off)
      return Object.keys(AMBIENT_SOUNDS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  });


  // --- YouTube Playlist Definitions (UPDATED) ---
  const YOUTUBE_PLAYLISTS = {
    lofi: { id: "PLr5OsF2umnimx18HT9J14cCBi3q-ujjkL", name: "Lofi Beats" }, // New ID from user's request
    study: { id: "PLqLz5L3P9T-I37pT0037P8fX1t9rF4e47", name: "Study Music" },
    retro: { id: "PLr2uB2k9Gv47P_d_k6Qy29xY8u0QW3h4P", name: "Retro/Synthwave" },
    rainy: { id: "PL_l_2W73y9M16c9bX7fN0M4YJ5w1k8L0X", name: "Rainy Day Jazz" }, 
    coffee: { id: "PLjE9h53Vv25eYf-P2m9zC581lQy6W9yS6", name: "Coffee Shop Jazz" },
  };

  const [selectedPlaylist, setSelectedPlaylist] = useState("lofi");
  const currentPlaylistId = YOUTUBE_PLAYLISTS[selectedPlaylist].id;
  // Note: Autoplay is disabled by default for better user experience and browser compliance.
  const youtubeEmbedUrl = `https://www.youtube.com/embed/videoseries?list=${currentPlaylistId}&autoplay=0&loop=1&controls=1`;


  // Helpers
  const percentComplete = () => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };
  
  function startEdit(task) {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  }

  // --- Effects ---

  // Persist tasks and task title
  useEffect(() => {
    localStorage.setItem("hf_tasks", JSON.stringify(tasks));
  }, [tasks]);
  
  // Persist durations
  useEffect(() => {
    localStorage.setItem("hf_durations", JSON.stringify(durations));
  }, [durations]);

  // Persist task title
  useEffect(() => {
    localStorage.setItem("hf_task_title", taskSectionTitle);
  }, [taskSectionTitle]);

  // Timer tick
  useEffect(() => {
    let timer = null;
    if (running) {
      timer = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleTimerEnd();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Theme and Dark Mode
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // Ambient Audio and Volume Control (Individual + Master Volume) - UPDATED FOR MIXING
  useEffect(() => {
    Object.keys(AMBIENT_SOUNDS).forEach(key => {
      const individualVolume = ambientVolumes[key] || 0;
      let audio = audioRefs.current[key];

      // 1. Manage Audio Element creation
      if (!audio) {
        audio = new Audio(AMBIENT_SOUNDS[key].url);
        audio.loop = true;
        audioRefs.current[key] = audio;
      }

      // 2. Calculate Final Volume (Master * Individual)
      const finalVolume = Math.min(1.0, masterVolume * individualVolume);
      audio.volume = finalVolume;
      
      // 3. Play/Pause logic
      if (individualVolume > 0.01 && finalVolume > 0.01) {
        // Attempt to play, catch potential autoplay restriction errors
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
    
    // Cleanup: Ensure all audio is paused on component unmount (or when this effect re-runs)
    return () => {
        // This cleanup is simplified; actual cleanup happens on unmount in the next effect.
        // This part primarily ensures that volume changes are reflected.
    };
  }, [ambientVolumes, masterVolume]);

  // Global Audio Cleanup on component unmount
  useEffect(() => {
      return () => {
          Object.values(audioRefs.current).forEach(audio => audio.pause());
      };
  }, []);

  // Handler to set individual ambient volume
  const handleAmbientVolumeChange = (key, value) => {
      setAmbientVolumes(prev => ({ ...prev, [key]: Number(value) }));
  };
  
  // Handler to toggle track on/off (if off, sets to default volume)
  const toggleAmbientTrack = (key) => {
      setAmbientVolumes(prev => {
          const currentVolume = prev[key];
          // If volume is near zero, set it to default, otherwise turn it off (set to 0)
          const newVolume = currentVolume > 0.01 ? 0 : AMBIENT_SOUNDS[key].defaultVolume;
          return { ...prev, [key]: newVolume };
      });
  };


  // --- Timer Actions ---

  function startStop() {
    setRunning((r) => !r);
  }

  function resetTimer(toMode = mode) {
    setMode(toMode);
    setSecondsLeft(durations[toMode]);
    setRunning(false);
  }

  function handleTimerEnd() {
    // simple auto-switch logic
    if (mode === "work") {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      if (nextCycle % DEFAULTS.cyclesBeforeLong === 0) {
        setMode("long");
        setSecondsLeft(durations.long);
      } else {
        setMode("short");
        setSecondsLeft(durations.short);
      }
    } else {
      setMode("work");
      setSecondsLeft(durations.work);
    }
    setRunning(false);
    flashTitle();
  }

  function flashTitle() {
    const prev = document.title;
    document.title = "⏰ Harmony - Session ended";
    setTimeout(() => (document.title = prev), 3500);
  }

  // --- Task Actions (with Renaming) ---

  function addTask() {
    if (!newTask.trim()) return;
    setTasks((t) => [{ id: Date.now(), text: newTask.trim(), done: false }, ...t]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function removeTask(id) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }
  
  function updateTaskText(id, newText) {
      setTasks((t) =>
          t.map((x) => (x.id === id ? { ...x, text: newText.trim() } : x))
      );
  }

  function handleEditChange(e) {
    setEditingText(e.target.value);
  }

  function handleEditBlur(id) {
    if (editingText.trim() && editingText.trim() !== tasks.find(t => t.id === id)?.text) {
        updateTaskText(id, editingText);
    }
    setEditingTaskId(null);
    setEditingText("");
  }
  
  function handleEditKeyDown(e, id) {
    if (e.key === 'Enter') {
      handleEditBlur(id);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
      setEditingText("");
    }
  }

  // Task Section Title Editing Handlers (NEW)
  const handleTitleEditBlur = () => {
    const newTitle = titleInput.trim();
    if (newTitle) {
        setTaskSectionTitle(newTitle);
    } else {
        setTitleInput(taskSectionTitle); // Revert if empty
    }
    setIsTitleEditing(false);
  };

  const handleTitleEditKeyDown = (e) => {
      if (e.key === 'Enter') {
          handleTitleEditBlur();
      } else if (e.key === 'Escape') {
          setTitleInput(taskSectionTitle);
          setIsTitleEditing(false);
      }
  };


  // Formatting time
  function formatTime(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  // Editable durations UI handlers
  function setDuration(modeKey, minutes) {
    const seconds = Math.max(1, Math.round(minutes * 60));
    setDurations((d) => ({ ...d, [modeKey]: seconds }));
    if (mode === modeKey) setSecondsLeft(seconds);
  }

  // UI - small helpers
  const progress = percentComplete();

  return (
    <div className={`min-h-screen p-6 transition-colors font-sans ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Timer Card and Tasks */}
        <div className={`col-span-1 lg:col-span-2 rounded-2xl p-6 shadow-2xl ${theme === "gradient" ? "text-white bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-500" : (dark ? "bg-gray-800" : "bg-white/90 shadow-xl")}`}>
          
          {/* Header */}
          <div className="flex justify-between items-start text-white/90 dark:text-gray-100">
            <div>
              <h1 className="text-2xl font-bold">Harmony Focus</h1>
              <p className="text-sm opacity-80">A calm workspace for deep work and flow state.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/40 transition-colors" onClick={() => setDark((d) => !d)}>
                {dark ? "Light" : "Dark"}
              </button>
              <select className="rounded-md p-1 text-sm bg-white/20 hover:bg-white/40 dark:text-gray-900" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timer Block */}
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

              {/* Custom Durations */}
              <div className="mt-6 w-full max-w-sm">
                <div className="text-xs opacity-70 mb-1">Custom durations (minutes)</div>
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
                <div className="text-xs opacity-80">Tasks Progress</div>
                <div className="mt-3">
                  <div className="h-3 bg-white/20 rounded overflow-hidden">
                    <div style={{ width: `${progress}%` }} className="h-full bg-white/80 transition-all"></div>
                  </div>
                  <div className="text-sm mt-2 font-semibold">{progress}% complete</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
                <div className="text-xs opacity-80">Session</div>
                <div className="mt-3 text-sm font-medium">Cycles completed: {cycleCount}</div>
                <div className="mt-2 text-xs opacity-70">Next Long Break: Cycle {DEFAULTS.cyclesBeforeLong}</div>
              </div>
            </div>

          </div>

          {/* Task List */}
          <div className="mt-6 p-4 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10">
            {/* Task Section Title (NEW FEATURE: Renamable) */}
            <div className="flex items-center mb-3">
                {isTitleEditing ? (
                    <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleTitleEditBlur}
                        onKeyDown={handleTitleEditKeyDown}
                        className="text-lg font-semibold bg-white/50 dark:bg-gray-700/50 rounded p-1 text-black dark:text-gray-100 focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <h2 
                        className="text-lg font-semibold cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
                        onClick={() => {
                            setTitleInput(taskSectionTitle);
                            setIsTitleEditing(true);
                        }}
                    >
                        {taskSectionTitle} (Click to rename)
                    </h2>
                )}
            </div>

            <div className="flex items-center gap-3">
              <input 
                className="flex-1 rounded p-2 text-black bg-white/90" 
                placeholder="Add a task..." 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && addTask()} 
              />
              <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/40 transition-colors" onClick={addTask}>Add</button>
            </div>

            <div className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-2">
              {tasks.length === 0 && <div className="text-sm opacity-70 p-2">No tasks yet — time to plan your focus session!</div>}
              {tasks.map((t) => (
                <div 
                  key={t.id} 
                  className={`flex items-center justify-between p-2 rounded transition-colors shadow-sm ${t.done ? "bg-white/30" : "bg-white/10 hover:bg-white/20"}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={t.done} 
                      onChange={() => toggleTask(t.id)} 
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-500 dark:bg-gray-700" 
                    />
                    
                    {/* Task Renaming Logic */}
                    {editingTaskId === t.id ? (
                      <input 
                        type="text"
                        value={editingText}
                        onChange={handleEditChange}
                        onBlur={() => handleEditBlur(t.id)}
                        onKeyDown={(e) => handleEditKeyDown(e, t.id)}
                        className="flex-1 rounded px-1 text-black dark:text-gray-100 dark:bg-gray-700 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className={`text-sm flex-1 truncate ${t.done ? "line-through opacity-70" : "font-medium cursor-pointer"}`}
                        onClick={() => startEdit(t)}
                      >
                        {t.text}
                      </div>
                    )}
                  </div>
                  <div>
                    <button className="text-xs opacity-80 hover:opacity-100 p-1 rounded" onClick={() => removeTask(t.id)}>
                      {/* Trash icon (inline SVG) */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column - Media Player & Volume Controls */}
        <div className="col-span-1">
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-gray-800 shadow-lg   lg:top-6 text-gray-900 dark:text-gray-100">
            <h2 className="text-lg font-bold mb-4">Media Hub</h2>
            
            {/* YouTube Playlist Embed (UPDATED for selection) */}
            <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <h3 className="text-md font-semibold mb-2">Focus Playlist (YouTube)</h3>
              <select 
                className="w-full rounded p-2 mb-3 text-black dark:text-gray-100 dark:bg-gray-600 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                value={selectedPlaylist} 
                onChange={(e) => setSelectedPlaylist(e.target.value)}
              >
                {Object.keys(YOUTUBE_PLAYLISTS).map(key => (
                  <option key={key} value={key}>
                    {YOUTUBE_PLAYLISTS[key].name}
                  </option>
                ))}
              </select>
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl border-2 border-indigo-500">
                <iframe 
                  key={currentPlaylistId} // Key ensures the iframe re-renders when playlist changes
                  className="w-full h-full"
                  src={youtubeEmbedUrl} 
                  title={`Youtubelist: ${YOUTUBE_PLAYLISTS[selectedPlaylist].name}`} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-xs opacity-70 mt-2">Use the controls inside the video player to adjust volume and skip tracks.</p>
            </div>
            
            {/* Volume Sliders (UPDATED for Master/Mixing) */}
            <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              
              <h3 className="text-md font-semibold mb-2">Ambient Sound Mixer</h3>
              
              {/* Master Volume Slider */}
              <div className="relative p-2 bg-indigo-500/10 rounded-lg">
                <label className="text-sm font-bold flex justify-between text-indigo-700 dark:text-indigo-400">
                  Master Volume 
                  <span className="opacity-90">({Math.round(masterVolume * 100)}%)</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={masterVolume} 
                  onChange={(e) => setMasterVolume(Number(e.target.value))} 
                  className="w-full h-2 bg-indigo-300 rounded-lg appearance-none cursor-pointer range-lg dark:bg-indigo-700 mt-1"
                />
                <p className="text-xs opacity-70 mt-1 text-indigo-600 dark:text-indigo-300">Controls the max volume of all ambient sounds.</p>
              </div>

              {/* Individual Ambient Track Sliders (NEW: Multiple tracks) */}
              <div className="space-y-3">
                {Object.keys(AMBIENT_SOUNDS).map(key => {
                  const volume = ambientVolumes[key];
                  const isActive = volume > 0.01;
                  return (
                    <div key={key} className={`p-3 rounded-lg border transition-colors ${isActive ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`text-sm font-medium ${isActive ? 'text-green-700 dark:text-green-400' : ''}`}>
                          {AMBIENT_SOUNDS[key].name} 
                          <span className="opacity-70 font-normal ml-2">({Math.round(volume * 100)}%)</span>
                        </label>
                        <button
                          onClick={() => toggleAmbientTrack(key)}
                          className={`text-xs px-3 py-1 rounded-full transition-colors ${isActive ? 'bg-red-500/80 text-white hover:bg-red-600' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                        >
                          {isActive ? 'Stop' : 'Play'}
                        </button>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume} 
                        onChange={(e) => handleAmbientVolumeChange(key, e.target.value)} 
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer range-lg mt-1 ${isActive ? 'bg-green-300' : 'bg-gray-300 dark:bg-gray-500'}`}
                        disabled={!isActive}
                      />
                    </div>
                  );
                })}
              </div>

            </div>
            
            {/* Note: Hidden audio elements are now managed dynamically via audioRefs.current */}

          </div>
          
          {/* Quick Controls & Pro Tip */}
          <div className="mt-6 p-4 rounded-2xl bg-white/90 dark:bg-gray-800 shadow-lg text-gray-900 dark:text-gray-100">
            <div className="text-sm font-semibold">Quick Controls</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button className="p-2 rounded bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-400 transition-colors" onClick={() => { resetTimer("work"); setRunning(true); }}>Work</button>
              <button className="p-2 rounded bg-sky-500/10 hover:bg-sky-500/30 text-sky-700 dark:text-sky-400 transition-colors" onClick={() => { resetTimer("short"); setRunning(true); }}>Short</button>
              <button className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-colors" onClick={() => { resetTimer("long"); setRunning(true); }}>Long</button>
            </div>
            <div className="mt-4 text-xs opacity-70">
              All settings (tasks, title, durations, theme) are saved in your browser.
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
