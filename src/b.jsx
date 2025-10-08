import React, { useEffect, useState, useRef } from "react";

// HarmonyFocus - Single-file React component
// Added features: YouTube Playlist selector with icons, Custom Playlist addition, 
// Ambient Mixer with toggles and Master/Individual Volume, Mock Playlist Items list.

// --- Icon Mapping (Using inline SVGs for stability in single file environment) ---
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
};
// --------------------------------------------------------------------------

export default function HarmonyFocusb() {
  const DEFAULTS = { work: 25 * 60, short: 5 * 60, long: 15 * 60, cyclesBeforeLong: 4 };

  // --- UI/Timer State (Kept for continuity) ---
  const [theme, setTheme] = useState("gradient");
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work);
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const [durations, setDurations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hf_durations")) || { work: DEFAULTS.work, short: DEFAULTS.short, long: DEFAULTS.long };
    } catch (e) { return { work: DEFAULTS.work, short: DEFAULTS.short, long: DEFAULTS.long }; }
  });

  // --- Task State ---
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hf_tasks")) || []; } catch (e) { return []; }
  });
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  
  // Task Section Title State
  const [taskSectionTitle, setTaskSectionTitle] = useState(() => {
      try { return localStorage.getItem("hf_task_title") || "Daily Focus"; } catch (e) { return "Daily Focus"; }
  });
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(taskSectionTitle);
  
  // --- YouTube Playlist State (UPDATED) ---
  const INITIAL_PLAYLISTS = {
    lofi: { id: "PLr5OsF2umnimx18HT9J14cCBi3q-ujjkL", name: "Lofi Beats", icon: "Music", mockItems: ["Chill Study Session", "Relaxing Piano Mix", "Late Night Vibes", "Morning Focus Tracks"] },
    study: { id: "PLqLz5L3P9T-I37pT0037P8fX1t9rF4e47", name: "Study Music", icon: "BookOpen", mockItems: ["Concentration Flow", "Classical Focus", "Deep Work Zone", "Ambient Background"] },
    retro: { id: "PLr2uB2k9Gv47P_d_k6Qy29xY8u0QW3h4P", name: "Retro/Synthwave", icon: "Gamepad2", mockItems: ["80s Arcade Tapes", "Future City Drive", "Neon Dreams", "Pixelated Sunset"] },
    rainy: { id: "PL_l_2W73y9M16c9bX7fN0M4YJ5w1k8L0X", name: "Rainy Day Jazz", icon: "CloudRain", mockItems: ["Smooth Jazz Cafe", "Muted Trumpet Solos", "Evening Drizzle", "Soft Thunderstorm"] },
    coffee: { id: "PLjE9h53Vv25eYf-P2m9zC581lQy6W9yS6", name: "Coffee Shop Jazz", icon: "Coffee", mockItems: ["Morning Brew", "Busy Cafe Sounds", "Acoustic Focus", "Jazz Bossa Nova"] },
  };

  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hf_custom_playlists")) || {}; } catch (e) { return {}; }
  });

  const allPlaylists = { ...INITIAL_PLAYLISTS, ...customPlaylists };
  const [selectedPlaylist, setSelectedPlaylist] = useState("lofi");
  const currentPlaylist = allPlaylists[selectedPlaylist] || allPlaylists.lofi;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/videoseries?list=${currentPlaylist.id}&autoplay=0&loop=1&controls=1`;
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newPlaylistInput, setNewPlaylistInput] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  
  // --- Ambient Audio State (UPDATED) ---
  const audioRefs = useRef({}); 
  const [masterVolume, setMasterVolume] = useState(0.8);  

  const AMBIENT_SOUNDS = {
    rain: { name: "Rain", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", defaultVolume: 0.4 },
    cafe: { name: "Café", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", defaultVolume: 0.3 },
    thunder: { name: "Thunder", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", defaultVolume: 0.5 }, 
    fireplace: { name: "Fireplace", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", defaultVolume: 0.6 }, 
  };
  
  const [ambientVolumes, setAmbientVolumes] = useState(() => {
    // Load volumes, defaulting to 0
    try { return JSON.parse(localStorage.getItem("hf_ambient_volumes")) || Object.keys(AMBIENT_SOUNDS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}); } catch (e) { return Object.keys(AMBIENT_SOUNDS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}); }
  });


  // --- Effects ---

  useEffect(() => { localStorage.setItem("hf_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("hf_durations", JSON.stringify(durations)); }, [durations]);
  useEffect(() => { localStorage.setItem("hf_task_title", taskSectionTitle); }, [taskSectionTitle]);
  useEffect(() => { localStorage.setItem("hf_custom_playlists", JSON.stringify(customPlaylists)); }, [customPlaylists]);
  useEffect(() => { localStorage.setItem("hf_ambient_volumes", JSON.stringify(ambientVolumes)); }, [ambientVolumes]);

  // Timer Tick
  useEffect(() => {
    let timer = null;
    if (running) {
      timer = setInterval(() => {
        setSecondsLeft((s) => (s <= 1 ? (handleTimerEnd(), 0) : s - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Theme
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // Ambient Audio Mixer Logic
  useEffect(() => {
    Object.keys(AMBIENT_SOUNDS).forEach(key => {
      const individualVolume = ambientVolumes[key] || 0;
      let audio = audioRefs.current[key];

      if (!audio) {
        audio = new Audio(AMBIENT_SOUNDS[key].url);
        audio.loop = true;
        audioRefs.current[key] = audio;
      }

      const finalVolume = Math.min(1.0, masterVolume * individualVolume);
      audio.volume = finalVolume;
      
      if (individualVolume > 0.01 && finalVolume > 0.01) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
    
    return () => {
        // Pause audio on unmount
        Object.values(audioRefs.current).forEach(audio => {
            if (audio) audio.pause();
        });
    };
  }, [ambientVolumes, masterVolume]);

  // --- Ambient Volume Handlers ---
  const handleAmbientVolumeChange = (key, value) => {
      setAmbientVolumes(prev => ({ ...prev, [key]: Number(value) }));
  };
  
  // Toggle: Sets to default volume if off, or to 0 if on.
  const toggleAmbientTrack = (key) => {
      setAmbientVolumes(prev => {
          const currentVolume = prev[key];
          const newVolume = currentVolume > 0.01 ? 0 : AMBIENT_SOUNDS[key].defaultVolume;
          return { ...prev, [key]: newVolume };
      });
  };

  // --- Custom Playlist Handlers ---
  function getPlaylistIdFromUrl(url) {
    // Regex to extract playlist ID from common YouTube URLs
    const idMatch = url.match(/[&?]list=([^&]+)/);
    if (idMatch && idMatch[1]) return idMatch[1];
    
    // Check if it's already a valid ID format (just an assumption of length/characters)
    if (url.length > 15 && !url.includes(' ')) return url; 
    
    return null;
  }

  function handleAddCustomPlaylist() {
      const id = getPlaylistIdFromUrl(newPlaylistInput.trim());
      const name = newPlaylistName.trim() || `Custom (${Object.keys(customPlaylists).length + 1})`;

      if (!id) {
          console.error("Invalid YouTube Playlist URL or ID.");
          return;
      }

      setCustomPlaylists(prev => ({
          ...prev,
          [`custom_${Date.now()}`]: { 
              id, 
              name, 
              icon: "Custom", 
              mockItems: ["Your custom tracks will play here.", "Refresh page to see updates.", "Enjoy your mix!"]
          }
      }));
      setNewPlaylistInput("");
      setNewPlaylistName("");
      setShowCustomInput(false);
      setSelectedPlaylist(`custom_${Date.now()}`); // Switch to the new playlist
  }

  // --- Timer Actions (Helper functions) ---
  function flashTitle() {
    const prev = document.title;
    document.title = "⏰ Harmony - Session ended";
    setTimeout(() => (document.title = prev), 3500);
  }
  function handleTimerEnd() {
    if (mode === "work") {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      setMode(nextCycle % DEFAULTS.cyclesBeforeLong === 0 ? "long" : "short");
      setSecondsLeft(nextCycle % DEFAULTS.cyclesBeforeLong === 0 ? durations.long : durations.short);
    } else {
      setMode("work");
      setSecondsLeft(durations.work);
    }
    setRunning(false);
    flashTitle();
  }

  function startEdit(task) { setEditingTaskId(task.id); setEditingText(task.text); }
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
    setMode(toMode);
    setSecondsLeft(durations[toMode]);
    setRunning(false);
  }
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

  // Task Section Title Editing Handlers (Simplified for brevity)
  const handleTitleEditBlur = () => {
    const newTitle = titleInput.trim();
    setTaskSectionTitle(newTitle || "Daily Focus");
    setIsTitleEditing(false);
  };
  const handleTitleEditKeyDown = (e) => {
      if (e.key === 'Enter') { handleTitleEditBlur(); } 
      else if (e.key === 'Escape') { setTitleInput(taskSectionTitle); setIsTitleEditing(false); }
  };
  function setDuration(modeKey, minutes) {
    const seconds = Math.max(1, Math.round(minutes * 60));
    setDurations((d) => ({ ...d, [modeKey]: seconds }));
    if (mode === modeKey) setSecondsLeft(seconds);
  }


  return (
    <div className={`min-h-screen p-6 transition-colors font-sans ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left - Timer Card and Tasks */}
        <div className={`col-span-1 lg:col-span-2 rounded-2xl p-6 shadow-2xl ${theme === "gradient" ? "text-white bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-500" : (dark ? "bg-gray-800" : "bg-white/90 shadow-xl")}`}>
          
          {/* Header */}
          <div className="flex justify-between items-start text-white/90 dark:text-gray-100">
            <div>
              <h1 className="text-2xl font-bold">Harmony Focus</h1>
              <p className="text-sm opacity-80">गहन काम और फ्लो स्टेट के लिए एक शांत कार्यक्षेत्र।</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/40 transition-colors" onClick={() => setDark((d) => !d)}>
                {dark ? "Light थीम" : "Dark थीम"}
              </button>
              <select className="rounded-md p-1 text-sm bg-white/20 hover:bg-white/40 dark:text-gray-900" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>

          {/* Timer Block */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col items-center justify-center p-6 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10 shadow-inner">
              <div className="text-sm opacity-80">{mode === "work" ? "फोकस समय" : mode === "short" ? "छोटा ब्रेक" : "लंबा ब्रेक"}</div>
              <div className="text-8xl md:text-7xl font-mono my-3 font-extrabold text-shadow-lg">{formatTime(secondsLeft)}</div>
              <div className="flex gap-4">
                <button className="px-6 py-2 rounded-xl text-lg font-semibold bg-white/20 hover:bg-white/40 transition-all shadow-md" onClick={startStop}>
                  {running ? "⏸︎ रोकें" : "▶ शुरू करें"}
                </button>
                <button className="px-6 py-2 rounded-xl text-lg bg-white/10 hover:bg-white/30 transition-colors shadow-md" onClick={() => resetTimer(mode)}>
                  ↻ रीसेट
                </button>
              </div>
              <div className="mt-6 w-full max-w-sm">
                <div className="text-xs opacity-70 mb-1">कस्टम अवधि (मिनटों में)</div>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="text-xs opacity-70">काम</div>
                    <input type="number" min="1" className="w-full rounded p-2 text-black bg-white/90" value={Math.round(durations.work / 60)} onChange={(e) => setDuration("work", Number(e.target.value))} />
                  </label>
                  <label className="w-1/3">
                    <div className="text-xs opacity-70">छोटा</div>
                    <input type="number" min="1" className="w-1/3 rounded p-2 text-black bg-white/90" value={Math.round(durations.short / 60)} onChange={(e) => setDuration("short", Number(e.target.value))} />
                  </label>
                  <label className="w-1/3">
                    <div className="text-xs opacity-70">लंबा</div>
                    <input type="number" min="1" className="w-1/3 rounded p-2 text-black bg-white/90" value={Math.round(durations.long / 60)} onChange={(e) => setDuration("long", Number(e.target.value))} />
                  </label>
                </div>
              </div>
            </div>
            {/* Progress & Quick Info */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
                <div className="text-xs opacity-80">कार्यों में प्रगति</div>
                <div className="mt-3">
                  <div className="h-3 bg-white/20 rounded overflow-hidden">
                    <div style={{ width: `${percentComplete()}%` }} className="h-full bg-white/80 transition-all"></div>
                  </div>
                  <div className="text-sm mt-2 font-semibold">{percentComplete()}% पूरा</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-white/10">
                <div className="text-xs opacity-80">सत्र</div>
                <div className="mt-3 text-sm font-medium">चक्र पूरे हुए: {cycleCount}</div>
                <div className="mt-2 text-xs opacity-70">अगला लंबा ब्रेक: चक्र {DEFAULTS.cyclesBeforeLong}</div>
              </div>
            </div>
          </div>

          {/* Task List (Renamable Title & Editable Tasks) */}
          <div className="mt-6 p-4 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center mb-3">
                {isTitleEditing ? (
                    <input
                        type="text" value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleTitleEditBlur}
                        onKeyDown={handleTitleEditKeyDown}
                        className="text-lg font-semibold bg-white/50 dark:bg-gray-700/50 rounded p-1 text-black dark:text-gray-100 focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <h2 
                        className="text-lg font-semibold cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
                        onClick={() => { setTitleInput(taskSectionTitle); setIsTitleEditing(true); }}
                    >
                        {taskSectionTitle} <span className="text-sm opacity-60">(नाम बदलने के लिए क्लिक करें)</span>
                    </h2>
                )}
            </div>

            <div className="flex items-center gap-3">
              <input 
                className="flex-1 rounded p-2 text-black bg-white/90" 
                placeholder="एक कार्य जोड़ें..." 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && addTask()} 
              />
              <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/40 transition-colors" onClick={addTask}>जोड़ें</button>
            </div>

            <div className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-2">
              {tasks.length === 0 && <div className="text-sm opacity-70 p-2">अभी कोई कार्य नहीं...</div>}
              {tasks.map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-2 rounded transition-colors shadow-sm ${t.done ? "bg-white/30" : "bg-white/10 hover:bg-white/20"}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-500 dark:bg-gray-700" />
                    
                    {editingTaskId === t.id ? (
                      <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} onBlur={() => { setEditingTaskId(null); }} onKeyDown={(e) => { if (e.key === 'Enter') { setEditingTaskId(null); } }} className="flex-1 rounded px-1 text-black dark:text-gray-100 dark:bg-gray-700 focus:outline-none" autoFocus />
                    ) : (
                      <div className={`text-sm flex-1 truncate ${t.done ? "line-through opacity-70" : "font-medium cursor-pointer"}`} onClick={() => startEdit(t)}>
                        {t.text}
                      </div>
                    )}
                  </div>
                  <div>
                    <button className="text-xs opacity-80 hover:opacity-100 p-1 rounded" onClick={() => removeTask(t.id)}>
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

        {/* Right column - Media Hub */}
        <div className="col-span-1">
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-gray-800 shadow-lg  lg:top-6 text-gray-900 dark:text-gray-100">
            <h2 className="text-lg font-bold mb-4">मीडिया हब</h2>
            
            {/* YouTube Playlist Selector (Icon-based) */}
            <h3 className="text-md font-semibold mb-2 flex items-center">{IconMap.Youtube} <span className="ml-2">फोकस प्लेलिस्ट</span></h3>
            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
              {Object.keys(allPlaylists).map(key => {
                const playlist = allPlaylists[key];
                const isActive = selectedPlaylist === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setSelectedPlaylist(key); setShowCustomInput(false); }}
                    className={`p-2 rounded-xl flex items-center text-sm transition-all shadow-md 
                                ${isActive ? 'bg-indigo-500 text-white shadow-indigo-500/50' : 'bg-white dark:bg-gray-600 hover:bg-indigo-100 dark:hover:bg-gray-500'}`}
                  >
                    {IconMap[playlist.icon] || IconMap.Custom}
                    <span className="ml-1 hidden sm:inline">{playlist.name}</span>
                  </button>
                );
              })}
              {/* Add Custom Button */}
              <button
                onClick={() => { setShowCustomInput(true); setSelectedPlaylist(null); }}
                className={`p-2 rounded-xl flex items-center text-sm transition-all shadow-md 
                            ${showCustomInput ? 'bg-green-500 text-white shadow-green-500/50' : 'bg-white dark:bg-gray-600 hover:bg-green-100 dark:hover:bg-gray-500'}`}
                title="कस्टम प्लेलिस्ट जोड़ें"
              >
                {IconMap.Search}
                <span className="ml-1 hidden sm:inline">कस्टम जोड़ें</span>
              </button>
            </div>

            {/* Custom Playlist Input */}
            {showCustomInput && (
              <div className="p-3 mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg space-y-2 text-black dark:text-white">
                <input 
                  type="text" 
                  placeholder="प्लेलिस्ट का नाम (वैकल्पिक)" 
                  value={newPlaylistName} 
                  onChange={(e) => setNewPlaylistName(e.target.value)} 
                  className="w-full p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                />
                <input 
                  type="text" 
                  placeholder="YouTube प्लेलिस्ट URL या ID पेस्ट करें" 
                  value={newPlaylistInput} 
                  onChange={(e) => setNewPlaylistInput(e.target.value)} 
                  className="w-full p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                />
                <button onClick={handleAddCustomPlaylist} className="w-full p-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                  प्लेलिस्ट सेव करें
                </button>
              </div>
            )}
            
            {/* YouTube Player & Mock List */}
            {currentPlaylist && (
              <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <h4 className="text-md font-semibold mb-2 text-indigo-600 dark:text-indigo-400">{currentPlaylist.name} (चल रहा है)</h4>
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl border-2 border-indigo-500">
                  <iframe 
                    key={currentPlaylist.id}
                    className="w-full h-full"
                    src={youtubeEmbedUrl} 
                    title={`Youtubelist: ${currentPlaylist.name}`} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                
                {/* Tracklist Preview (UPDATED) */}
                <div className="mt-3 text-sm">
                    <p className="font-bold opacity-90 mb-1">ट्रैकलिस्ट पूर्वावलोकन (Tracklist Preview):</p>
                    <ul className="space-y-1 max-h-20 overflow-y-auto">
                        {currentPlaylist.mockItems.map((item, index) => (
                            <li key={index} className={`flex items-center text-xs p-1 rounded transition-all ${index === 0 ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-gray-600' : 'opacity-70 hover:opacity-100'}`}>
                                <span className="mr-2">{IconMap.Music}</span>
                                <span className="truncate">{item}</span>
                                {index === 0 && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500 text-white">चल रहा है</span>}
                                {index === 1 && <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-500 dark:text-gray-200">अगला</span>}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs opacity-60 mt-2">नोट: यह पूर्वावलोकन है। लाइव गाना YouTube प्लेयर के अंदर ही नियंत्रित होता है।</p>
                </div>
              </div>
            )}
            
            {/* Ambient Sound Mixer & Volume Controls */}
            <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              
              <h3 className="text-md font-bold mb-2 flex items-center"><span className="mr-2">{IconMap.Volume}</span> एंबिएंट साउंड मिक्सर</h3>
              
              {/* Master Volume Slider */}
              <div className="relative p-2 bg-indigo-500/10 rounded-lg">
                <label className="text-sm font-bold flex justify-between text-indigo-700 dark:text-indigo-400">
                  मास्टर वॉल्यूम 
                  <span className="opacity-90">({Math.round(masterVolume * 100)}%)</span>
                </label>
                <input 
                  type="range" min="0" max="1" step="0.01" value={masterVolume} 
                  onChange={(e) => setMasterVolume(Number(e.target.value))} 
                  className="w-full h-2 bg-indigo-300 rounded-lg appearance-none cursor-pointer range-lg dark:bg-indigo-700 mt-1"
                />
                <p className="text-xs opacity-70 mt-1 text-indigo-600 dark:text-indigo-300">यह सभी एंबिएंट साउंड्स के अधिकतम वॉल्यूम को नियंत्रित करता है।</p>
              </div>

              {/* Individual Ambient Track Sliders with Toggle */}
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(AMBIENT_SOUNDS).map(key => {
                  const volume = ambientVolumes[key];
                  const isActive = volume > 0.01;
                  return (
                    <div key={key} className={`p-3 rounded-lg border transition-colors ${isActive ? 'bg-green-500/10 border-green-500/30 shadow-md' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <label className={`text-sm font-bold ${isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {AMBIENT_SOUNDS[key].name} 
                        </label>
                        <button
                          onClick={() => toggleAmbientTrack(key)}
                          className={`text-xs px-3 py-1 rounded-full transition-colors font-semibold shadow-sm
                            ${isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                          {isActive ? 'रोकें' : 'चलाएं'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={volume} 
                          onChange={(e) => handleAmbientVolumeChange(key, e.target.value)} 
                          className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${isActive ? 'bg-green-300' : 'bg-gray-300 dark:bg-gray-500'}`}
                          disabled={!isActive}
                        />
                        <span className={`text-xs w-8 text-right font-mono ${isActive ? 'opacity-100' : 'opacity-50'}`}>{Math.round(volume * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
          
          {/* Quick Controls */}
          <div className="mt-6 p-4 rounded-2xl bg-white/90 dark:bg-gray-800 shadow-lg text-gray-900 dark:text-gray-100">
            <div className="text-sm font-semibold">त्वरित नियंत्रण</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button className="p-2 rounded bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-400 transition-colors" onClick={() => { resetTimer("work"); startStop(); }}>काम</button>
              <button className="p-2 rounded bg-sky-500/10 hover:bg-sky-500/30 text-sky-700 dark:text-sky-400 transition-colors" onClick={() => { resetTimer("short"); startStop(); }}>छोटा ब्रेक</button>
              <button className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-colors" onClick={() => { resetTimer("long"); startStop(); }}>लंबा ब्रेक</button>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
