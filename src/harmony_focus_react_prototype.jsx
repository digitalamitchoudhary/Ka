import React, { useEffect, useRef, useState } from "react";

// HarmonyFocus - Single-file React component
// Requirements to run:
// - A React app (Vite / Create React App)
// - TailwindCSS configured (for styling classes used below)
//
// Paste this file as e.g. src/HarmonyFocus.jsx and import in your App.

export default function HarmonyFocus() {
  // Timer settings
  const DEFAULTS = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
    cyclesBeforeLong: 4,
  };

  const [theme, setTheme] = useState("gradient");
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work);
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // Custom intervals (editable by user)
  const [durations, setDurations] = useState({
    work: DEFAULTS.work,
    short: DEFAULTS.short,
    long: DEFAULTS.long,
  });

  // Tasks
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hf_tasks")) || [];
    } catch (e) {
      return [];
    }
  });
  const [newTask, setNewTask] = useState("");

  // Playlist & Ambient
  const ambientRef = useRef(null);
  const musicRef = useRef(null);
  const [ambientTrack, setAmbientTrack] = useState("none");
  const [musicTrackIndex, setMusicTrackIndex] = useState(0);
  const [tracks] = useState([
    { title: "Focus Mix 1", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Focus Mix 2", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Peaceful Piano", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  ]);

  // Helpers
  const percentComplete = () => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };

  // Persist tasks
  useEffect(() => {
    localStorage.setItem("hf_tasks", JSON.stringify(tasks));
  }, [tasks]);

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

  useEffect(() => {
    // apply theme background and dark mode
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

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
    // small notification (visual)
    flashTitle();
  }

  function flashTitle() {
    const prev = document.title;
    document.title = "⏰ Harmony - Session ended";
    setTimeout(() => (document.title = prev), 3500);
  }

  // Task actions
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

  // Ambient & Music controls
  useEffect(() => {
    if (!ambientRef.current) return;
    if (ambientTrack === "none") {
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
    } else {
      ambientRef.current.loop = true;
      ambientRef.current.play().catch(() => {});
    }
  }, [ambientTrack]);

  useEffect(() => {
    if (!musicRef.current) return;
    musicRef.current.pause();
    musicRef.current.src = tracks[musicTrackIndex].src;
    musicRef.current.loop = false;
    if (musicPlaying) {
      musicRef.current.play().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicTrackIndex]);

  const [musicPlaying, setMusicPlaying] = useState(false);
  function toggleMusic() {
    if (!musicRef.current) return;
    if (musicPlaying) {
      musicRef.current.pause();
      setMusicPlaying(false);
    } else {
      musicRef.current.play().catch(() => {});
      setMusicPlaying(true);
    }
  }

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
    <div className={`min-h-screen p-6 transition-colors ${dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Timer Card */}
        <div className={`col-span-1 lg:col-span-2 rounded-2xl p-6 shadow-2xl ${theme === "gradient" ? "bg-gradient-to-br from-indigo-400 via-sky-300 to-emerald-300" : "bg-white/5"}`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold">Harmony Focus</h1>
              <p className="text-sm opacity-80">A calm workspace for deep work — Pomodoro, tasks & ambience.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-1 rounded-lg bg-white/20" onClick={() => setDark((d) => !d)}>
                {dark ? "Light" : "Dark"}
              </button>
              <select className="rounded-md p-1 bg-white/10" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="gradient">Gradient</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col items-center justify-center p-6 rounded-xl bg-white/20">
              <div className="text-sm opacity-80">{mode === "work" ? "Focus Time" : mode === "short" ? "Short Break" : "Long Break"}</div>
              <div className="text-6xl font-mono my-3">{formatTime(secondsLeft)}</div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/10" onClick={startStop}>{running ? "Pause" : "Start"}</button>
                <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => resetTimer(mode)}>Reset</button>
              </div>

              <div className="mt-4 w-full">
                <div className="text-xs opacity-80">Custom durations (minutes)</div>
                <div className="flex gap-2 mt-2">
                  <label className="flex-1">
                    <div className="text-xs opacity-70">Work</div>
                    <input type="number" min="1" className="w-full rounded p-2 text-black" value={Math.round(durations.work / 60)} onChange={(e) => setDuration("work", Number(e.target.value))} />
                  </label>
                  <label className="w-1/3">
                    <div className="text-xs opacity-70">Short</div>
                    <input type="number" min="1" className="w-full rounded p-2 text-black" value={Math.round(durations.short / 60)} onChange={(e) => setDuration("short", Number(e.target.value))} />
                  </label>
                  <label className="w-1/3">
                    <div className="text-xs opacity-70">Long</div>
                    <input type="number" min="1" className="w-full rounded p-2 text-black" value={Math.round(durations.long / 60)} onChange={(e) => setDuration("long", Number(e.target.value))} />
                  </label>
                </div>
              </div>

            </div>

            {/* Right column small cards */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-white/10">
                <div className="text-xs opacity-80">Tasks Progress</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-3 bg-white/20 rounded overflow-hidden">
                      <div style={{ width: `${progress}%` }} className="h-full bg-white/60 transition-all"></div>
                    </div>
                    <div className="text-sm mt-2">{progress}% complete</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10">
                <div className="text-xs opacity-80">Ambient</div>
                <div className="mt-3 flex flex-col gap-2">
                  <select className="rounded p-2 text-black" value={ambientTrack} onChange={(e) => setAmbientTrack(e.target.value)}>
                    <option value="none">None</option>
                    <option value="rain">Rain</option>
                    <option value="cafe">Cafe</option>
                    <option value="white">White Noise</option>
                  </select>
                  <small className="opacity-70">Ambient plays looped and mixes with music.</small>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10">
                <div className="text-xs opacity-80">Session</div>
                <div className="mt-3 text-sm">Cycles completed: {cycleCount}</div>
                <div className="mt-2 text-xs opacity-70">After {DEFAULTS.cyclesBeforeLong} cycles, a long break is scheduled.</div>
              </div>
            </div>

          </div>

          {/* Task list */}
          <div className="mt-6 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <input className="flex-1 rounded p-2 text-black" placeholder="Add a task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
              <button className="px-4 py-2 rounded-lg bg-white/20" onClick={addTask}>Add</button>
            </div>

            <div className="mt-4 space-y-2 max-h-44 overflow-auto">
              {tasks.length === 0 && <div className="text-sm opacity-70">No tasks yet — add something to start tracking.</div>}
              {tasks.map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-2 rounded ${t.done ? "bg-white/20" : "bg-white/5"}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
                    <div className={`text-sm ${t.done ? "line-through opacity-70" : ""}`}>{t.text}</div>
                  </div>
                  <div>
                    <button className="text-xs opacity-80 mr-2" onClick={() => removeTask(t.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column - Player & settings */}
        <div className="col-span-1">
          <div className="p-4 rounded-2xl bg-white/5 shadow-lg sticky top-6">
            <h2 className="text-lg font-semibold">Music Player</h2>
            <p className="text-xs opacity-80">Play curated focus tracks along with ambient sounds.</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded bg-white/10" onClick={() => setMusicTrackIndex((i) => (i - 1 + tracks.length) % tracks.length)}>◀</button>
                <div className="flex-1">
                  <div className="text-sm">{tracks[musicTrackIndex].title}</div>
                  <div className="text-xs opacity-70">Track {musicTrackIndex + 1} of {tracks.length}</div>
                </div>
                <button className="px-3 py-2 rounded bg-white/10" onClick={() => setMusicTrackIndex((i) => (i + 1) % tracks.length)}>▶</button>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded bg-white/20" onClick={toggleMusic}>{musicPlaying ? "Pause" : "Play"}</button>
                <button className="px-3 py-2 rounded bg-white/10" onClick={() => { setMusicPlaying(false); if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0; } }}>Stop</button>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="text-xs opacity-80">Playback</div>
                <div className="mt-2 text-sm">Volume controls (browser default)</div>
              </div>

              <div className="mt-4 p-3 rounded bg-white/10">
                <div className="text-xs opacity-80">Shortcuts</div>
                <div className="text-sm mt-2">Space = start/pause | Enter = add task</div>
              </div>

              <div className="mt-4 text-xs opacity-70">Pro tip: Mix low-volume ambient with music for best focus.</div>
            </div>

            {/* Hidden audio elements */}
            <audio ref={ambientRef} src={
              ambientTrack === "rain" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" :
                ambientTrack === "cafe" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" :
                ambientTrack === "white" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" :
                ""
            } />

            <audio ref={musicRef} src={tracks[musicTrackIndex].src} onEnded={() => setMusicPlaying(false)} />

          </div>

          <div className="mt-6 p-4 rounded-2xl bg-white/5">
            <div className="text-sm font-semibold">Quick Controls</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button className="p-2 rounded bg-white/10" onClick={() => { resetTimer("work"); setRunning(true); }}>Start Work</button>
              <button className="p-2 rounded bg-white/10" onClick={() => { resetTimer("short"); setRunning(true); }}>Short Break</button>
              <button className="p-2 rounded bg-white/10" onClick={() => { resetTimer("long"); setRunning(true); }}>Long Break</button>
            </div>

            <div className="mt-4 text-xs opacity-70">
              Save & local-only: tasks and preferences are stored in your browser's localStorage.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
