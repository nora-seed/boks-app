/* =========================================================
   RINGBOX — Core Application Logic (PWA / Vanilla JS)
   ========================================================= */

(() => {
  'use strict';

  const STORAGE_KEY = 'ringbox_pwa_state_v1';
  const CLOCK_CIRCUMFERENCE = 2 * Math.PI * 116; // r=116 -> 728.85

  /* ---------------- 1. AUDIO ENGINE (Web Audio API) ---------------- */
  const AudioEngine = (() => {
    let ctx = null;

    function ensureContext() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    // Authentic metallic boxing bell synthesized from inharmonic partials
    function strikeBell(startTime, volume = 0.45) {
      const ac = ensureContext();
      if (!ac) return;
      const t = startTime || ac.currentTime;

      const partials = [
        { freq: 448, gain: 0.42, decay: 2.3 },
        { freq: 892, gain: 0.30, decay: 1.8 },
        { freq: 1344, gain: 0.22, decay: 1.4 },
        { freq: 1815, gain: 0.16, decay: 1.0 },
        { freq: 2490, gain: 0.10, decay: 0.65 }
      ];

      const master = ac.createGain();
      master.gain.setValueAtTime(volume, t);
      master.connect(ac.destination);

      partials.forEach((p) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(p.freq, t);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(p.gain, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + p.decay);

        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + p.decay + 0.05);
      });

      // Metallic hammer transient click
      const clickOsc = ac.createOscillator();
      const clickGain = ac.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(3200, t);
      clickGain.gain.setValueAtTime(0.18, t);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      clickOsc.connect(clickGain);
      clickGain.connect(master);
      clickOsc.start(t);
      clickOsc.stop(t + 0.04);
    }

    function playGong(hits = 1) {
      if (!state.settings.soundOn) return;
      const ac = ensureContext();
      if (!ac) return;
      const now = ac.currentTime;
      for (let i = 0; i < hits; i++) {
        strikeBell(now + i * 0.32, 0.48);
      }
    }

    // 10-second wooden ring clapper (3 crisp knocks)
    function playClapper() {
      if (!state.settings.soundOn) return;
      const ac = ensureContext();
      if (!ac) return;
      const now = ac.currentTime;
      [0, 0.14, 0.28].forEach((offset) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(980, now + offset);
        osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.05);

        g.gain.setValueAtTime(0.45, now + offset);
        g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.065);

        osc.connect(g);
        g.connect(ac.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    }

    function playBeep(freq = 780, duration = 0.11, vol = 0.26) {
      if (!state.settings.soundOn) return;
      const ac = ensureContext();
      if (!ac) return;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    return { ensureContext, playGong, playClapper, playBeep };
  })();

  /* ---------------- 2. VOICE CALLER (Web Speech API - TR) ---------------- */
  const VoiceCaller = (() => {
    let trVoice = null;

    function loadVoices() {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      trVoice =
        voices.find((v) => v.lang && v.lang.toLowerCase() === 'tr-tr') ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('tr')) ||
        null;
    }

    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    function speak(text, force = false) {
      if (!force && !state.settings.voiceOn) return;
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'tr-TR';
        if (trVoice) utter.voice = trVoice;
        utter.rate = state.settings.speechRate || 1.05;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // Ignore speech API errors on restricted browsers
      }
    }

    function stop() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return { speak, stop };
  })();

  /* ---------------- 3. WAKE LOCK MANAGER ---------------- */
  const WakeLockManager = (() => {
    let sentinel = null;

    async function acquire() {
      if (!state.settings.wakeLockOn) return;
      if (!('wakeLock' in navigator)) return;
      try {
        if (sentinel) return;
        sentinel = await navigator.wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          sentinel = null;
        });
      } catch (e) {
        sentinel = null;
      }
    }

    async function release() {
      if (!sentinel) return;
      try {
        await sentinel.release();
      } catch (e) {
        // ignore
      }
      sentinel = null;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && timer.running) {
        acquire();
      }
    });

    return { acquire, release };
  })();

  /* ---------------- 4. STATE & STORAGE ---------------- */
  const defaultState = {
    settings: {
      rounds: 3,
      roundSec: 180,
      restSec: 60,
      prepSec: 5,
      comboLevel: 'beginner',
      cadenceMs: 4500,
      soundOn: true,
      voiceOn: true,
      wakeLockOn: true,
      stance: 'orthodox',
      speechRate: 1.05
    },
    activeProgram: {
      id: null,
      title: 'Standart Ring Zamanlayıcı',
      levelName: 'SERBEST ANTRENMAN',
      xp: 90
    },
    stats: {
      xp: 0,
      totalRounds: 0,
      totalSeconds: 0,
      totalWorkouts: 0,
      completedPrograms: [],
      dailyActivity: {}, // { 'YYYY-MM-DD': roundsCount }
      history: [] // [{ date, title, rounds, durationSec, xp }]
    }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneFallback(defaultState);
      const parsed = JSON.parse(raw);
      return {
        settings: { ...defaultState.settings, ...(parsed.settings || {}) },
        activeProgram: { ...defaultState.activeProgram, ...(parsed.activeProgram || {}) },
        stats: {
          ...defaultState.stats,
          ...(parsed.stats || {}),
          completedPrograms: Array.isArray(parsed.stats?.completedPrograms)
            ? parsed.stats.completedPrograms
            : [],
          dailyActivity: parsed.stats?.dailyActivity || {},
          history: Array.isArray(parsed.stats?.history) ? parsed.stats.history : []
        }
      };
    } catch (e) {
      return structuredCloneFallback(defaultState);
    }
  }

  function structuredCloneFallback(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage quota fallback
    }
  }

  let state = loadState();

  /* ---------------- 5. HELPERS ---------------- */
  function formatTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }

  function getDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function calculateStreak() {
    const map = state.stats.dailyActivity;
    let streak = 0;
    const today = new Date();
    const todayKey = getDateKey(today);

    // If trained today, count from today; otherwise allow yesterday to keep streak alive
    let cursor = new Date(today);
    if (!map[todayKey]) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (map[getDateKey(cursor)] > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function getRankInfo(xp) {
    const ranks = RINGBOX_DATA.RANKS;
    let current = ranks[0];
    let next = ranks[1] || null;
    for (let i = 0; i < ranks.length; i++) {
      if (xp >= ranks[i].minXp) {
        current = ranks[i];
        next = ranks[i + 1] || null;
      }
    }
    return { current, next };
  }

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
  }

  function vibrate(pattern) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  /* ---------------- 6. TIMER & COMBO ENGINE ---------------- */
  const timer = {
    running: false,
    phase: 'idle', // 'idle' | 'prep' | 'work' | 'rest' | 'done'
    currentRound: 1,
    remainingMs: state.settings.roundSec * 1000,
    phaseDurationMs: state.settings.roundSec * 1000,
    lastTick: 0,
    intervalId: null,
    comboTimeoutId: null,
    lastSecondBeep: -1,
    clapperPlayed: false,
    completedRoundsThisSession: 0,
    workedSecondsThisSession: 0,
    lastComboIdx: -1
  };

  function getComboPoolLabel(key) {
    const labels = {
      beginner: 'Başlangıç',
      intermediate: 'Orta Seviye',
      advanced: 'İleri / Pro',
      defense: 'Savunma & Refleks'
    };
    return labels[key] || 'Başlangıç';
  }

  function classifyBadge(token) {
    if (['EĞİL', 'SLİP', 'BLOK', 'PARRY'].includes(token)) return 'def';
    if (['GERİ', 'PİVOT'].includes(token)) return 'move';
    return '';
  }

  function renderCombo(badges, text) {
    const html = badges
      .map((b) => `<span class="combo-chip ${classifyBadge(b)}">${b}</span>`)
      .join('');
    els.comboBadges.innerHTML = html;
    els.comboText.textContent = text;
    els.gloveComboBadges.innerHTML = html;
    els.gloveComboText.textContent = text;

    els.comboBoard.classList.remove('flash');
    void els.comboBoard.offsetWidth;
    els.comboBoard.classList.add('flash');
  }

  function callNextCombo() {
    if (!timer.running || timer.phase !== 'work') return;
    const pool = RINGBOX_DATA.COMBO_POOLS[state.settings.comboLevel] || RINGBOX_DATA.COMBO_POOLS.beginner;
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === timer.lastComboIdx) {
      idx = (idx + 1) % pool.length;
    }
    timer.lastComboIdx = idx;

    const item = pool[idx];
    const adaptedText = RINGBOX_DATA.adaptText(item.text, state.settings.stance);
    const adaptedSay = RINGBOX_DATA.adaptText(item.say, state.settings.stance);

    renderCombo(item.badges, adaptedText);
    VoiceCaller.speak(adaptedSay);

    // Schedule next combo if enough time remains in round
    clearTimeout(timer.comboTimeoutId);
    if (timer.remainingMs > 2600) {
      timer.comboTimeoutId = setTimeout(callNextCombo, state.settings.cadenceMs);
    }
  }

  function stopComboLoop() {
    clearTimeout(timer.comboTimeoutId);
    timer.comboTimeoutId = null;
  }

  function enterPhase(phase) {
    timer.phase = phase;
    timer.lastSecondBeep = -1;
    timer.clapperPlayed = false;
    stopComboLoop();

    if (phase === 'prep') {
      const dur = Math.max(3, state.settings.prepSec) * 1000;
      timer.phaseDurationMs = dur;
      timer.remainingMs = dur;
      renderCombo(['GARD'], 'Gardını al, nefeslen, hazırlan!');
      VoiceCaller.speak(`Raunt ${timer.currentRound} başlıyor. Hazırlan!`);
    } else if (phase === 'work') {
      const dur = state.settings.roundSec * 1000;
      timer.phaseDurationMs = dur;
      timer.remainingMs = dur;
      AudioEngine.playGong(1);
      vibrate([120, 60, 120]);
      // Trigger first combo right after gong decays slightly
      timer.comboTimeoutId = setTimeout(callNextCombo, 1100);
    } else if (phase === 'rest') {
      const dur = state.settings.restSec * 1000;
      timer.phaseDurationMs = dur;
      timer.remainingMs = dur;
      AudioEngine.playGong(1);
      vibrate([100]);
      renderCombo(['DİNLEN'], 'Derin nefes al, omuzları gevşet, su yudumla.');
      VoiceCaller.speak('Raunt bitti! Dinlen ve nefesini topla.');
    } else if (phase === 'done') {
      timer.running = false;
      clearInterval(timer.intervalId);
      timer.intervalId = null;
      WakeLockManager.release();
      AudioEngine.playGong(3);
      vibrate([150, 80, 150, 80, 260]);
      renderCombo(['🏆', 'BİTTİ'], 'Harika iş! Antrenman başarıyla tamamlandı.');
      VoiceCaller.speak('Tebrikler! Antrenman tamamlandı. Şampiyon gibi çalıştın.');
      recordWorkoutCompletion();
    }

    updateTimerUI();
  }

  function tick() {
    if (!timer.running) return;
    const now = Date.now();
    const dt = now - timer.lastTick;
    timer.lastTick = now;

    if (timer.phase === 'work') {
      timer.workedSecondsThisSession += dt / 1000;
    }

    timer.remainingMs -= dt;
    const secLeft = Math.ceil(timer.remainingMs / 1000);

    // 10-second clapper warning in work round
    if (
      timer.phase === 'work' &&
      !timer.clapperPlayed &&
      state.settings.roundSec > 15 &&
      secLeft <= 10 &&
      secLeft > 0
    ) {
      timer.clapperPlayed = true;
      AudioEngine.playClapper();
      vibrate([70, 50, 70]);
      VoiceCaller.speak('Son on saniye! Tempoyu artır!');
    }

    // 3-2-1 countdown beeps during prep or rest
    if (
      (timer.phase === 'prep' || timer.phase === 'rest') &&
      secLeft <= 3 &&
      secLeft >= 1 &&
      secLeft !== timer.lastSecondBeep
    ) {
      timer.lastSecondBeep = secLeft;
      AudioEngine.playBeep(secLeft === 1 ? 1040 : 760, 0.12);
    }

    if (timer.remainingMs <= 0) {
      advancePhase();
      return;
    }

    updateTimerUI();
  }

  function advancePhase() {
    if (timer.phase === 'prep') {
      enterPhase('work');
    } else if (timer.phase === 'work') {
      timer.completedRoundsThisSession++;
      if (timer.currentRound >= state.settings.rounds) {
        enterPhase('done');
      } else if (state.settings.restSec > 0) {
        enterPhase('rest');
      } else {
        timer.currentRound++;
        enterPhase('work');
      }
    } else if (timer.phase === 'rest') {
      timer.currentRound++;
      enterPhase('work');
    }
  }

  function startOrPause() {
    AudioEngine.ensureContext();

    if (timer.running) {
      // Pause
      timer.running = false;
      clearInterval(timer.intervalId);
      timer.intervalId = null;
      stopComboLoop();
      VoiceCaller.stop();
      WakeLockManager.release();
      updateTimerUI();
      return;
    }

    // Start / Resume
    if (timer.phase === 'idle' || timer.phase === 'done') {
      timer.currentRound = 1;
      timer.completedRoundsThisSession = 0;
      timer.workedSecondsThisSession = 0;
      timer.running = true;
      timer.lastTick = Date.now();
      WakeLockManager.acquire();
      if (state.settings.prepSec > 0) {
        enterPhase('prep');
      } else {
        enterPhase('work');
      }
    } else {
      timer.running = true;
      timer.lastTick = Date.now();
      WakeLockManager.acquire();
      if (timer.phase === 'work') {
        timer.comboTimeoutId = setTimeout(callNextCombo, 1000);
      }
    }

    clearInterval(timer.intervalId);
    timer.intervalId = setInterval(tick, 150);
    updateTimerUI();
  }

  function resetTimer(silent = false) {
    timer.running = false;
    clearInterval(timer.intervalId);
    timer.intervalId = null;
    stopComboLoop();
    VoiceCaller.stop();
    WakeLockManager.release();

    timer.phase = 'idle';
    timer.currentRound = 1;
    timer.phaseDurationMs = state.settings.roundSec * 1000;
    timer.remainingMs = state.settings.roundSec * 1000;
    timer.clapperPlayed = false;
    timer.lastSecondBeep = -1;

    renderCombo(['1', '2'], 'Antrenman başlayınca komutlar burada belirecek');
    updateTimerUI();
    if (!silent) showToast('Zamanlayıcı sıfırlandı');
  }

  function skipPhase() {
    if (timer.phase === 'idle' || timer.phase === 'done') return;
    AudioEngine.ensureContext();
    advancePhase();
  }

  function recordWorkoutCompletion() {
    const roundsDone = Math.max(1, timer.completedRoundsThisSession || state.settings.rounds);
    const workedSec = Math.max(
      roundsDone * state.settings.roundSec,
      Math.round(timer.workedSecondsThisSession)
    );
    const earnedXp = state.activeProgram.id
      ? state.activeProgram.xp
      : Math.round(roundsDone * 25 + workedSec / 30);

    const todayKey = getDateKey();
    state.stats.xp += earnedXp;
    state.stats.totalRounds += roundsDone;
    state.stats.totalSeconds += workedSec;
    state.stats.totalWorkouts += 1;
    state.stats.dailyActivity[todayKey] = (state.stats.dailyActivity[todayKey] || 0) + roundsDone;

    if (
      state.activeProgram.id &&
      !state.stats.completedPrograms.includes(state.activeProgram.id)
    ) {
      state.stats.completedPrograms.push(state.activeProgram.id);
    }

    state.stats.history.unshift({
      date: new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      title: state.activeProgram.title,
      rounds: roundsDone,
      durationSec: workedSec,
      xp: earnedXp
    });
    if (state.stats.history.length > 50) state.stats.history.pop();

    saveState();
    renderProgress();
    renderPrograms();
    updateHeaderRank();
    showToast(`🏆 Antrenman kaydedildi! +${earnedXp} XP kazandın`);
  }

  /* ---------------- 7. DOM REFERENCES ---------------- */
  const els = {
    headerRankLabel: document.getElementById('headerRankLabel'),
    btnInstallPwa: document.getElementById('btnInstallPwa'),
    btnStanceToggle: document.getElementById('btnStanceToggle'),
    stanceShortLabel: document.getElementById('stanceShortLabel'),

    activeLevelBadge: document.getElementById('activeLevelBadge'),
    activeWorkoutName: document.getElementById('activeWorkoutName'),
    btnGloveMode: document.getElementById('btnGloveMode'),
    toggleSound: document.getElementById('toggleSound'),
    toggleVoice: document.getElementById('toggleVoice'),
    toggleWakeLock: document.getElementById('toggleWakeLock'),

    timerStage: document.getElementById('timerStage'),
    phaseLabel: document.getElementById('phaseLabel'),
    roundLabel: document.getElementById('roundLabel'),
    clockProgress: document.getElementById('clockProgress'),
    clockDisplay: document.getElementById('clockDisplay'),
    clockSubtext: document.getElementById('clockSubtext'),

    comboBoard: document.getElementById('comboBoard'),
    comboDifficultyTag: document.getElementById('comboDifficultyTag'),
    comboBadges: document.getElementById('comboBadges'),
    comboText: document.getElementById('comboText'),

    btnStartPause: document.getElementById('btnStartPause'),
    btnTestGong: document.getElementById('btnTestGong'),
    btnSkipPhase: document.getElementById('btnSkipPhase'),
    btnResetTimer: document.getElementById('btnResetTimer'),
    btnQuickPresets: document.getElementById('btnQuickPresets'),

    valRounds: document.getElementById('valRounds'),
    valRoundSec: document.getElementById('valRoundSec'),
    valRestSec: document.getElementById('valRestSec'),
    valPrepSec: document.getElementById('valPrepSec'),
    selectComboLevel: document.getElementById('selectComboLevel'),
    selectComboCadence: document.getElementById('selectComboCadence'),

    programsList: document.getElementById('programsList'),
    programFilterBar: document.getElementById('programFilterBar'),

    techStanceNote: document.getElementById('techStanceNote'),
    punchLegendStrip: document.getElementById('punchLegendStrip'),
    techFilterBar: document.getElementById('techFilterBar'),
    techniquesList: document.getElementById('techniquesList'),

    rankTitle: document.getElementById('rankTitle'),
    rankNextHint: document.getElementById('rankNextHint'),
    rankEmblem: document.getElementById('rankEmblem'),
    xpBarFill: document.getElementById('xpBarFill'),
    xpCurrentLabel: document.getElementById('xpCurrentLabel'),
    xpNextLabel: document.getElementById('xpNextLabel'),
    statStreak: document.getElementById('statStreak'),
    statRounds: document.getElementById('statRounds'),
    statMinutes: document.getElementById('statMinutes'),
    statWorkouts: document.getElementById('statWorkouts'),
    weekStrip: document.getElementById('weekStrip'),
    weekSummaryLabel: document.getElementById('weekSummaryLabel'),
    prefOrthodox: document.getElementById('prefOrthodox'),
    prefSouthpaw: document.getElementById('prefSouthpaw'),
    rangeSpeechRate: document.getElementById('rangeSpeechRate'),
    speechRateVal: document.getElementById('speechRateVal'),
    historyList: document.getElementById('historyList'),
    btnClearHistory: document.getElementById('btnClearHistory'),

    // Glove Overlay
    gloveOverlay: document.getElementById('gloveOverlay'),
    glovePhaseLabel: document.getElementById('glovePhaseLabel'),
    gloveRoundLabel: document.getElementById('gloveRoundLabel'),
    btnExitGloveMode: document.getElementById('btnExitGloveMode'),
    gloveTapZone: document.getElementById('gloveTapZone'),
    gloveClock: document.getElementById('gloveClock'),
    gloveComboBadges: document.getElementById('gloveComboBadges'),
    gloveComboText: document.getElementById('gloveComboText'),
    gloveHint: document.getElementById('gloveHint'),
    gloveSkipBtn: document.getElementById('gloveSkipBtn'),
    gloveResetBtn: document.getElementById('gloveResetBtn'),

    // Technique Modal
    techModal: document.getElementById('techModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    modalTechCategory: document.getElementById('modalTechCategory'),
    modalTechTitle: document.getElementById('modalTechTitle'),
    modalTechSvg: document.getElementById('modalTechSvg'),
    modalTechSummary: document.getElementById('modalTechSummary'),
    modalTechSteps: document.getElementById('modalTechSteps'),
    modalTechMistakes: document.getElementById('modalTechMistakes'),
    btnSpeakTech: document.getElementById('btnSpeakTech'),
    btnPracticeTech: document.getElementById('btnPracticeTech')
  };

  /* ---------------- 8. UI RENDERING ---------------- */
  function updateTimerUI() {
    const secLeft = Math.ceil(timer.remainingMs / 1000);
    const isWarning = timer.phase === 'work' && secLeft <= 10 && secLeft > 0;
    const visualPhase = isWarning ? 'warning' : timer.phase;

    els.timerStage.dataset.phase = visualPhase;
    els.gloveTapZone.dataset.phase = visualPhase;

    const phaseTextMap = {
      idle: 'HAZIR',
      prep: 'HAZIRLAN',
      work: 'DÖVÜŞ',
      warning: 'SON 10 SN!',
      rest: 'DİNLENME',
      done: 'TAMAMLANDI'
    };

    const phaseText = phaseTextMap[visualPhase] || 'HAZIR';
    els.phaseLabel.textContent = phaseText;
    els.glovePhaseLabel.textContent = phaseText;

    const roundText = `RAUNT ${timer.currentRound} / ${state.settings.rounds}`;
    els.roundLabel.textContent = roundText;
    els.gloveRoundLabel.textContent = `${timer.currentRound} / ${state.settings.rounds}`;

    const formatted = formatTime(timer.remainingMs / 1000);
    els.clockDisplay.textContent = formatted;
    els.gloveClock.textContent = formatted;

    // SVG Ring Progress
    const ratio =
      timer.phaseDurationMs > 0
        ? Math.max(0, Math.min(1, timer.remainingMs / timer.phaseDurationMs))
        : 1;
    els.clockProgress.style.strokeDashoffset = (CLOCK_CIRCUMFERENCE * (1 - ratio)).toFixed(2);

    if (timer.running) {
      els.btnStartPause.textContent = '⏸ DURAKLAT';
      els.btnStartPause.classList.add('running');
      els.clockSubtext.textContent =
        timer.phase === 'rest' ? 'Nefeslen · Gardını gevşet' : 'Gard yukarıda · Hareketli kal';
      els.gloveHint.textContent = 'DURAKLATMAK İÇİN EKRANA DOKUN';
    } else if (timer.phase === 'idle') {
      els.btnStartPause.textContent = '▶ RİNGE ÇIK';
      els.btnStartPause.classList.remove('running');
      els.clockSubtext.textContent = 'Başlamak için dokun';
      els.gloveHint.textContent = 'BAŞLAMAK İÇİN EKRANA DOKUN';
    } else if (timer.phase === 'done') {
      els.btnStartPause.textContent = '▶ TEKRAR BAŞLA';
      els.btnStartPause.classList.remove('running');
      els.clockSubtext.textContent = 'Şampiyon gibi bitirdin!';
      els.gloveHint.textContent = 'TEKRAR BAŞLATMAK İÇİN DOKUN';
    } else {
      els.btnStartPause.textContent = '▶ DEVAM ET';
      els.btnStartPause.classList.remove('running');
      els.clockSubtext.textContent = 'Duraklatıldı';
      els.gloveHint.textContent = 'DEVAM ETMEK İÇİN EKRANA DOKUN';
    }
  }

  function updateSettingsUI() {
    els.activeLevelBadge.textContent = state.activeProgram.levelName;
    els.activeWorkoutName.textContent = state.activeProgram.title;

    els.valRounds.textContent = state.settings.rounds;
    els.valRoundSec.textContent = formatTime(state.settings.roundSec);
    els.valRestSec.textContent = formatTime(state.settings.restSec);
    els.valPrepSec.textContent = formatTime(state.settings.prepSec);

    els.selectComboLevel.value = state.settings.comboLevel;
    els.selectComboCadence.value = String(state.settings.cadenceMs);
    els.comboDifficultyTag.textContent = getComboPoolLabel(state.settings.comboLevel);

    els.toggleSound.classList.toggle('on', state.settings.soundOn);
    els.toggleSound.textContent = state.settings.soundOn ? '🔔 Gong Açık' : '🔕 Gong Kapalı';

    els.toggleVoice.classList.toggle('on', state.settings.voiceOn);
    els.toggleVoice.textContent = state.settings.voiceOn ? '🎙 Sesli Kombo' : '🔇 Ses Kapalı';

    els.toggleWakeLock.classList.toggle('on', state.settings.wakeLockOn);
    els.toggleWakeLock.textContent = state.settings.wakeLockOn
      ? '📱 Ekran Açık'
      : '📱 Kilit Kapalı';

    const isOrtho = state.settings.stance !== 'southpaw';
    els.stanceShortLabel.textContent = isOrtho ? 'ORTODOKS' : 'SOLAK';
    els.techStanceNote.textContent = isOrtho ? 'Ortodoks (Sağlak)' : 'Ters Gard (Solak)';
    els.prefOrthodox.classList.toggle('active', isOrtho);
    els.prefSouthpaw.classList.toggle('active', !isOrtho);

    els.rangeSpeechRate.value = state.settings.speechRate;
    els.speechRateVal.textContent = `${state.settings.speechRate.toFixed(2)}x`;
  }

  function updateHeaderRank() {
    const { current } = getRankInfo(state.stats.xp);
    els.headerRankLabel.textContent = `${current.name} · ${state.stats.xp} XP`;
  }

  // Render Programs Tab
  let activeProgramFilter = 'all';
  function renderPrograms() {
    const items =
      activeProgramFilter === 'all'
        ? RINGBOX_DATA.PROGRAMS
        : RINGBOX_DATA.PROGRAMS.filter((p) => String(p.level) === activeProgramFilter);

    els.programsList.innerHTML = items
      .map((p) => {
        const done = state.stats.completedPrograms.includes(p.id);
        const totalMin = Math.round((p.rounds * (p.roundSec + p.restSec)) / 60);
        return `
          <article class="program-card lvl-${p.level}">
            <div class="program-top">
              <div>
                <span class="badge-level">${p.levelName}</span>
                <h3 class="program-title">${p.title}</h3>
              </div>
              ${done ? '<span class="program-done-tag">✓ Tamamlandı</span>' : ''}
            </div>
            <p class="program-desc">${p.desc}</p>
            <div class="program-meta">
              <span class="meta-tag">🥊 ${p.rounds} Raunt × ${formatTime(p.roundSec)}</span>
              <span class="meta-tag">⏱ Dinlenme ${formatTime(p.restSec)}</span>
              <span class="meta-tag">⚡ ~${totalMin} dk</span>
              <span class="meta-tag">🏆 +${p.xp} XP</span>
            </div>
            <button class="program-cta" type="button" data-load-program="${p.id}">
              ▶ Ringe Yükle ve Başla
            </button>
          </article>
        `;
      })
      .join('');
  }

  // Render Techniques Tab
  let activeTechCat = 'all';
  let currentModalTech = null;

  function renderTechniques() {
    // Punch Legend 1-6
    els.punchLegendStrip.innerHTML = RINGBOX_DATA.PUNCH_LEGEND.map(
      (p) => `
      <div class="legend-pill">
        <strong>${p.num}</strong>
        <span>${RINGBOX_DATA.adaptText(p.name, state.settings.stance)}</span>
      </div>
    `
    ).join('');

    const items =
      activeTechCat === 'all'
        ? RINGBOX_DATA.TECHNIQUES
        : RINGBOX_DATA.TECHNIQUES.filter((t) => t.category === activeTechCat);

    els.techniquesList.innerHTML = items
      .map(
        (t) => `
      <button class="tech-card" type="button" data-tech-id="${t.id}">
        <div class="tech-svg-thumb">${t.svg}</div>
        <span class="badge-level">${t.catLabel}</span>
        <h3>${RINGBOX_DATA.adaptText(t.title, state.settings.stance)}</h3>
        <p>${RINGBOX_DATA.adaptText(t.summary, state.settings.stance)}</p>
      </button>
    `
      )
      .join('');
  }

  function openTechModal(techId) {
    const tech = RINGBOX_DATA.TECHNIQUES.find((t) => t.id === techId);
    if (!tech) return;
    currentModalTech = tech;
    const stance = state.settings.stance;

    els.modalTechCategory.textContent = `${tech.catLabel} · ${tech.level}`;
    els.modalTechTitle.textContent = RINGBOX_DATA.adaptText(tech.title, stance);
    els.modalTechSvg.innerHTML = tech.svg;
    els.modalTechSummary.textContent = RINGBOX_DATA.adaptText(tech.summary, stance);
    els.modalTechSteps.innerHTML = tech.steps
      .map((s) => `<li>${RINGBOX_DATA.adaptText(s, stance)}</li>`)
      .join('');
    els.modalTechMistakes.innerHTML = tech.mistakes
      .map((m) => `<li>${RINGBOX_DATA.adaptText(m, stance)}</li>`)
      .join('');

    els.techModal.classList.remove('hidden');
  }

  function closeTechModal() {
    els.techModal.classList.add('hidden');
    VoiceCaller.stop();
  }

  // Render Progress Tab
  function renderProgress() {
    const { current, next } = getRankInfo(state.stats.xp);
    els.rankTitle.textContent = current.name;
    els.rankEmblem.textContent = current.emblem;

    if (next) {
      const span = next.minXp - current.minXp;
      const gained = state.stats.xp - current.minXp;
      const pct = Math.max(0, Math.min(100, Math.round((gained / span) * 100)));
      els.xpBarFill.style.width = `${pct}%`;
      els.rankNextHint.textContent = `${next.name} rütbesine ${next.minXp - state.stats.xp} XP kaldı`;
      els.xpCurrentLabel.textContent = `${state.stats.xp} XP`;
      els.xpNextLabel.textContent = `${next.minXp} XP`;
    } else {
      els.xpBarFill.style.width = '100%';
      els.rankNextHint.textContent = 'Zirvedesin! Dünya Şampiyonu rütbesine ulaştın.';
      els.xpCurrentLabel.textContent = `${state.stats.xp} XP`;
      els.xpNextLabel.textContent = 'MAX';
    }

    els.statStreak.textContent = calculateStreak();
    els.statRounds.textContent = state.stats.totalRounds;
    els.statMinutes.textContent = Math.round(state.stats.totalSeconds / 60);
    els.statWorkouts.textContent = state.stats.totalWorkouts;

    // 7-day strip
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    let activeDays = 0;
    const stripHtml = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const count = state.stats.dailyActivity[key] || 0;
      if (count > 0) activeDays++;
      stripHtml.push(`
        <div class="week-day ${count > 0 ? 'active' : ''}">
          <span>${dayNames[d.getDay()]}</span>
          <strong>${count > 0 ? `${count}R` : '·'}</strong>
        </div>
      `);
    }
    els.weekStrip.innerHTML = stripHtml.join('');
    els.weekSummaryLabel.textContent = `${activeDays} / 7 gün aktif`;

    // History List
    if (!state.stats.history.length) {
      els.historyList.innerHTML =
        '<p class="muted-small">Henüz tamamlanan antrenman yok. İlk raunt için Ringe Çık!</p>';
    } else {
      els.historyList.innerHTML = state.stats.history
        .slice(0, 15)
        .map(
          (h) => `
        <div class="history-item">
          <div>
            <strong>${h.title}</strong>
            <span>${h.date} · ${h.rounds} Raunt · ${Math.max(1, Math.round(h.durationSec / 60))} dk</span>
          </div>
          <span class="history-xp">+${h.xp} XP</span>
        </div>
      `
        )
        .join('');
    }
  }

  /* ---------------- 9. TAB ROUTING & EVENTS ---------------- */
  function switchTab(tabName) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    const view = document.getElementById(`view-${tabName}`);
    const nav = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (view) view.classList.add('active');
    if (nav) nav.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function loadProgramIntoRing(programId) {
    const prog = RINGBOX_DATA.PROGRAMS.find((p) => p.id === programId);
    if (!prog) return;
    state.settings.rounds = prog.rounds;
    state.settings.roundSec = prog.roundSec;
    state.settings.restSec = prog.restSec;
    state.settings.prepSec = prog.prepSec;
    state.settings.comboLevel = prog.comboLevel;
    state.settings.cadenceMs = prog.cadenceMs;
    state.activeProgram = {
      id: prog.id,
      title: prog.title,
      levelName: prog.levelName,
      xp: prog.xp
    };
    saveState();
    resetTimer(true);
    updateSettingsUI();
    switchTab('ring');
    showToast(`🥊 "${prog.title}" ringe yüklendi`);
  }

  function setStance(stance) {
    state.settings.stance = stance;
    saveState();
    updateSettingsUI();
    renderTechniques();
    showToast(stance === 'orthodox' ? 'Gard: Ortodoks (Sağlak)' : 'Gard: Ters Gard (Solak)');
  }

  function bindEvents() {
    // Bottom Navigation
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Header Stance Toggle
    els.btnStanceToggle.addEventListener('click', () => {
      setStance(state.settings.stance === 'orthodox' ? 'southpaw' : 'orthodox');
    });

    // Status Pills
    els.toggleSound.addEventListener('click', () => {
      state.settings.soundOn = !state.settings.soundOn;
      saveState();
      updateSettingsUI();
      if (state.settings.soundOn) AudioEngine.playBeep(880, 0.08);
    });

    els.toggleVoice.addEventListener('click', () => {
      state.settings.voiceOn = !state.settings.voiceOn;
      if (!state.settings.voiceOn) VoiceCaller.stop();
      saveState();
      updateSettingsUI();
      if (state.settings.voiceOn) VoiceCaller.speak('Sesli kombinasyon çağırıcı açık.');
    });

    els.toggleWakeLock.addEventListener('click', () => {
      state.settings.wakeLockOn = !state.settings.wakeLockOn;
      if (state.settings.wakeLockOn && timer.running) WakeLockManager.acquire();
      if (!state.settings.wakeLockOn) WakeLockManager.release();
      saveState();
      updateSettingsUI();
    });

    // Primary Timer Controls
    els.btnStartPause.addEventListener('click', startOrPause);
    els.btnTestGong.addEventListener('click', () => {
      AudioEngine.ensureContext();
      AudioEngine.playGong(1);
      vibrate([80]);
    });
    els.btnSkipPhase.addEventListener('click', skipPhase);
    els.btnResetTimer.addEventListener('click', () => resetTimer(false));
    els.btnQuickPresets.addEventListener('click', () => switchTab('programs'));

    // Glove Focus Mode
    els.btnGloveMode.addEventListener('click', () => {
      els.gloveOverlay.classList.remove('hidden');
      updateTimerUI();
    });
    els.btnExitGloveMode.addEventListener('click', () => {
      els.gloveOverlay.classList.add('hidden');
    });
    els.gloveTapZone.addEventListener('click', startOrPause);
    els.gloveSkipBtn.addEventListener('click', skipPhase);
    els.gloveResetBtn.addEventListener('click', () => resetTimer(false));

    // Steppers
    document.querySelectorAll('.step-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.step;
        const delta = Number(btn.dataset.delta);
        const limits = {
          rounds: [1, 15],
          roundSec: [30, 300],
          restSec: [0, 180],
          prepSec: [0, 20]
        };
        const [min, max] = limits[key];
        state.settings[key] = Math.max(min, Math.min(max, state.settings[key] + delta));
        state.activeProgram = {
          id: null,
          title: 'Özel Ring Antrenmanı',
          levelName: 'SERBEST ANTRENMAN',
          xp: 90
        };
        saveState();
        if (timer.phase === 'idle') {
          timer.phaseDurationMs = state.settings.roundSec * 1000;
          timer.remainingMs = state.settings.roundSec * 1000;
        }
        updateSettingsUI();
        updateTimerUI();
      });
    });

    // Combo Selectors
    els.selectComboLevel.addEventListener('change', (e) => {
      state.settings.comboLevel = e.target.value;
      saveState();
      updateSettingsUI();
    });

    els.selectComboCadence.addEventListener('change', (e) => {
      state.settings.cadenceMs = Number(e.target.value);
      saveState();
    });

    // Program Filter & Load
    els.programFilterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      activeProgramFilter = btn.dataset.level;
      els.programFilterBar.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      renderPrograms();
    });

    els.programsList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-load-program]');
      if (!btn) return;
      loadProgramIntoRing(btn.dataset.loadProgram);
    });

    // Techniques Filter & Modal
    els.techFilterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      activeTechCat = btn.dataset.cat;
      els.techFilterBar.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      renderTechniques();
    });

    els.techniquesList.addEventListener('click', (e) => {
      const card = e.target.closest('[data-tech-id]');
      if (!card) return;
      openTechModal(card.dataset.techId);
    });

    els.btnCloseModal.addEventListener('click', closeTechModal);
    els.techModal.addEventListener('click', (e) => {
      if (e.target === els.techModal) closeTechModal();
    });

    els.btnSpeakTech.addEventListener('click', () => {
      if (!currentModalTech) return;
      const st = state.settings.stance;
      const text = `${RINGBOX_DATA.adaptText(currentModalTech.title, st)}. ${RINGBOX_DATA.adaptText(
        currentModalTech.summary,
        st
      )} ${RINGBOX_DATA.adaptText(currentModalTech.steps[0], st)}`;
      VoiceCaller.speak(text, true);
    });

    els.btnPracticeTech.addEventListener('click', () => {
      if (!currentModalTech) return;
      state.settings.comboLevel = currentModalTech.practicePool || 'beginner';
      state.activeProgram = {
        id: null,
        title: `Teknik Çalışma: ${RINGBOX_DATA.adaptText(currentModalTech.title, state.settings.stance)}`,
        levelName: 'TEKNİK ODAK',
        xp: 75
      };
      saveState();
      closeTechModal();
      resetTimer(true);
      updateSettingsUI();
      switchTab('ring');
      showToast('Teknik çalışma ringe yüklendi');
    });

    // Progress Preferences
    els.prefOrthodox.addEventListener('click', () => setStance('orthodox'));
    els.prefSouthpaw.addEventListener('click', () => setStance('southpaw'));

    els.rangeSpeechRate.addEventListener('input', (e) => {
      state.settings.speechRate = Number(e.target.value);
      els.speechRateVal.textContent = `${state.settings.speechRate.toFixed(2)}x`;
      saveState();
    });

    els.btnClearHistory.addEventListener('click', () => {
      if (!confirm('Tüm antrenman geçmişi, XP ve seri verileri sıfırlansın mı?')) return;
      state.stats = structuredCloneFallback(defaultState.stats);
      saveState();
      renderProgress();
      renderPrograms();
      updateHeaderRank();
      showToast('Tüm ilerleme verileri sıfırlandı');
    });
  }

  /* ---------------- 10. PWA INSTALL & SERVICE WORKER ---------------- */
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    els.btnInstallPwa.classList.remove('hidden');
  });

  els.btnInstallPwa.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const res = await deferredInstallPrompt.userChoice;
    if (res.outcome === 'accepted') {
      els.btnInstallPwa.classList.add('hidden');
      showToast('RINGBOX ana ekranına eklendi!');
    }
    deferredInstallPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    els.btnInstallPwa.classList.add('hidden');
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  /* ---------------- 11. BOOTSTRAP ---------------- */
  bindEvents();
  updateSettingsUI();
  updateTimerUI();
  updateHeaderRank();
  renderPrograms();
  renderTechniques();
  renderProgress();
})();
