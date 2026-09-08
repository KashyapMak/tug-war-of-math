/**
 * Math Tug of War - Game Engine
 */
(function() {
  'use strict';

  // --- Audio Synthesizer (Web Audio API) ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Fallback gracefully
    }
  }

  const soundEffects = {
    countdownTick: () => playTone(520, 'sine', 0.1, 0.12),
    countdownGo: () => {
      playTone(880, 'triangle', 0.35, 0.25);
      setTimeout(() => playTone(1174, 'triangle', 0.4, 0.2), 100);
    },
    correct: () => {
      playTone(659.25, 'sine', 0.12, 0.15);
      setTimeout(() => playTone(880, 'sine', 0.2, 0.15), 100);
    },
    incorrect: () => {
      playTone(280, 'sawtooth', 0.2, 0.12);
      setTimeout(() => playTone(220, 'sawtooth', 0.25, 0.12), 120);
    },
    skip: () => playTone(400, 'triangle', 0.15, 0.1),
    timeout: () => playTone(220, 'sine', 0.3, 0.15),
    win: () => {
      [523, 659, 784, 1046].forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.3, 0.18), idx * 120);
      });
    },
    perfectWin: () => {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.35, 0.22), idx * 110);
      });
    },
    mudSplash: () => {
      playTone(180, 'sawtooth', 0.18, 0.25);
      setTimeout(() => playTone(120, 'sine', 0.25, 0.3), 60);
    },
    hold: () => {
      playTone(330, 'triangle', 0.15, 0.2);
      setTimeout(() => playTone(261.6, 'triangle', 0.2, 0.2), 80);
    },
    resume: () => {
      playTone(261.6, 'triangle', 0.15, 0.2);
      setTimeout(() => playTone(392, 'triangle', 0.2, 0.2), 80);
    }
  };

  // --- State & Config Objects ---
  const config = {
    blueName: 'Blue Team',
    redName: 'Red Team',
    bluePhoto: localStorage.getItem('math_tug_custom_blue_photo') || null,
    redPhoto: localStorage.getItem('math_tug_custom_red_photo') || null,
    questionCount: 15,
    operation: 'mixed', // addition, subtraction, multiplication, division, mixed
    mixedOps: ['addition', 'subtraction', 'multiplication', 'division'],
    digits: 2,
    carrying: 'any', // any, require, none
    borrowing: 'any', // any, require, none
    allowNegative: false,
    mulMin: 1,
    mulMax: 12,
    divMin: 1,
    divMax: 12,
    timingMode: 'timed', // timed, untimed
    timerSeconds: 15,
    scoreCorrect: 1,
    scoreIncorrect: 0,
    scoreSkip: -1,
    scoreTimeout: 0,
    negativeScoring: false,
    answerFeedback: true
  };

  const gameState = {
    status: 'idle', // idle, countdown, playing, paused, finishing, finished
    elapsedSeconds: 0,
    elapsedInterval: null,
    countdownTimer: null,
    pausedBeforeModalStatus: null,
    blue: createTeamState(),
    red: createTeamState()
  };

  function createTeamState() {
    return {
      score: 0,
      currentIndex: 0,
      questions: [],
      currentInput: '',
      hasMinus: false,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      timeoutCount: 0,
      responseTimes: [],
      questionStartTime: 0,
      remainingTime: 15,
      timerInterval: null,
      isFinished: false,
      feedbackTimeout: null
    };
  }

  // --- DOM Selectors ---
  const announcer = document.getElementById('announcer');
  const leadText = document.getElementById('lead-text');
  const elapsedDisplay = document.getElementById('elapsed-display');
  const winnerBanner = document.getElementById('winner-banner');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownDisplay = document.getElementById('countdown-display');

  const blueDisplayName = document.getElementById('blue-display-name');
  const blueScoreDisplay = document.getElementById('blue-score');
  const blueProgressLabel = document.getElementById('blue-progress-label');
  const blueTimerDisplay = document.getElementById('blue-timer');
  const blueExpr = document.getElementById('blue-question-expr');
  const blueInputText = document.getElementById('blue-input-text');
  const bluePlaceholder = document.getElementById('blue-placeholder');
  const blueFeedback = document.getElementById('blue-feedback');
  const blueBtnSubmit = document.getElementById('blue-btn-submit');
  const blueBtnSkip = document.getElementById('blue-btn-skip');
  const blueSignRow = document.getElementById('blue-sign-row');

  const redDisplayName = document.getElementById('red-display-name');
  const redScoreDisplay = document.getElementById('red-score');
  const redProgressLabel = document.getElementById('red-progress-label');
  const redTimerDisplay = document.getElementById('red-timer');
  const redExpr = document.getElementById('red-question-expr');
  const redInputText = document.getElementById('red-input-text');
  const redPlaceholder = document.getElementById('red-placeholder');
  const redFeedback = document.getElementById('red-feedback');
  const redBtnSubmit = document.getElementById('red-btn-submit');
  const redBtnSkip = document.getElementById('red-btn-skip');
  const redSignRow = document.getElementById('red-sign-row');

  const tugActionGroup = document.getElementById('tug-action-group');
  const blueTeamSvgGroup = document.getElementById('blue-team-svg-group');
  const redTeamSvgGroup = document.getElementById('red-team-svg-group');

  // Modals
  const modalConfig = document.getElementById('modal-config');
  const modalRules = document.getElementById('modal-rules');
  const modalResults = document.getElementById('modal-results');

  // Arena Start & Hold Overlays
  const arenaStartOverlay = document.getElementById('arena-start-overlay');
  const arenaHoldOverlay = document.getElementById('arena-hold-overlay');
  const btnArenaStart = document.getElementById('btn-arena-start');
  const btnArenaOptions = document.getElementById('btn-arena-options');
  const btnArenaResume = document.getElementById('btn-arena-resume');
  const btnArenaStop = document.getElementById('btn-arena-stop');
  const btnArenaReset = document.getElementById('btn-arena-reset');
  const btnHoldGame = document.getElementById('btn-hold-game');
  const holdIcon = document.getElementById('hold-icon');
  const holdLabel = document.getElementById('hold-label');

  // Modal Tabs
  const tabBtnTeam = document.getElementById('tab-btn-team');
  const tabBtnGame = document.getElementById('tab-btn-game');
  const tabPaneTeam = document.getElementById('tab-content-team');
  const tabPaneGame = document.getElementById('tab-content-game');

  // Accessible Announcement Helper
  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  }

  // --- Modal Tab Switching ---
  function switchConfigTab(targetTab) {
    if (targetTab === 'team') {
      if (tabBtnTeam) {
        tabBtnTeam.classList.add('active');
        tabBtnTeam.setAttribute('aria-selected', 'true');
      }
      if (tabBtnGame) {
        tabBtnGame.classList.remove('active');
        tabBtnGame.setAttribute('aria-selected', 'false');
      }
      if (tabPaneTeam) tabPaneTeam.classList.remove('hidden');
      if (tabPaneGame) tabPaneGame.classList.add('hidden');
    } else {
      if (tabBtnGame) {
        tabBtnGame.classList.add('active');
        tabBtnGame.setAttribute('aria-selected', 'true');
      }
      if (tabBtnTeam) {
        tabBtnTeam.classList.remove('active');
        tabBtnTeam.setAttribute('aria-selected', 'false');
      }
      if (tabPaneGame) tabPaneGame.classList.remove('hidden');
      if (tabPaneTeam) tabPaneTeam.classList.add('hidden');
    }
  }

  // --- Question Generator ---
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateSingleQuestion(opType) {
    let operation = opType;
    if (operation === 'mixed') {
      const pool = config.mixedOps.length > 0 ? config.mixedOps : ['addition'];
      operation = pool[Math.floor(Math.random() * pool.length)];
    }

    const d = config.digits;
    const minVal = d === 1 ? 1 : Math.pow(10, d - 1);
    const maxVal = Math.pow(10, d) - 1;

    if (operation === 'addition') {
      let a = getRandomInt(minVal, maxVal);
      let b = getRandomInt(minVal, maxVal);

      if (config.carrying === 'none') {
        let safeA = 0;
        let safeB = 0;
        let place = 1;
        for (let i = 0; i < d; i++) {
          const digitA = getRandomInt(0, 8);
          const digitB = getRandomInt(0, 9 - digitA);
          safeA += digitA * place;
          safeB += digitB * place;
          place *= 10;
        }
        a = Math.max(minVal, safeA);
        b = Math.max(1, safeB);
      } else if (config.carrying === 'require') {
        const unitA = getRandomInt(4, 9);
        const unitB = getRandomInt(10 - unitA, 9);
        a = (Math.floor(a / 10) * 10) + unitA;
        b = (Math.floor(b / 10) * 10) + unitB;
      }

      return {
        text: `${a} + ${b}`,
        answer: a + b
      };
    }

    if (operation === 'subtraction') {
      let a = getRandomInt(minVal, maxVal);
      let b = getRandomInt(minVal, maxVal);

      if (!config.allowNegative) {
        if (a < b) [a, b] = [b, a];
      }

      if (config.borrowing === 'none' && a >= b) {
        let safeA = 0;
        let safeB = 0;
        let place = 1;
        for (let i = 0; i < d; i++) {
          const digitA = getRandomInt(1, 9);
          const digitB = getRandomInt(0, digitA);
          safeA += digitA * place;
          safeB += digitB * place;
          place *= 10;
        }
        a = Math.max(minVal, safeA);
        b = Math.max(1, safeB);
      } else if (config.borrowing === 'require' && a >= b) {
        const unitA = getRandomInt(0, 7);
        const unitB = getRandomInt(unitA + 1, 9);
        a = (Math.max(1, Math.floor(a / 10)) * 10) + unitA;
        b = (Math.floor(b / 10) * 10) + unitB;
        if (a <= b) a += 20;
      }

      return {
        text: `${a} − ${b}`,
        answer: a - b
      };
    }

    if (operation === 'multiplication') {
      const minF = Math.min(config.mulMin, config.mulMax);
      const maxF = Math.max(config.mulMin, config.mulMax);
      const a = getRandomInt(minF, maxF);
      const b = getRandomInt(minF, maxF);
      return {
        text: `${a} × ${b}`,
        answer: a * b
      };
    }

    if (operation === 'division') {
      const minDiv = Math.max(1, Math.min(config.divMin, config.divMax));
      const maxDiv = Math.max(minDiv, config.divMax);
      const divisor = getRandomInt(minDiv, maxDiv);
      const quotient = getRandomInt(1, 12);
      const dividend = divisor * quotient;
      return {
        text: `${dividend} ÷ ${divisor}`,
        answer: quotient
      };
    }

    // Default fallback
    return { text: '2 + 2', answer: 4 };
  }

  function generateQuestionsForTeam(count) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(generateSingleQuestion(config.operation));
    }
    return list;
  }

  // --- Tug of War Physics & Visual Positioning ---
  function triggerPullAnimation(team) {
    if (!blueTeamSvgGroup || !redTeamSvgGroup) return;
    const pullGroup = team === 'blue' ? blueTeamSvgGroup : redTeamSvgGroup;
    const oppGroup = team === 'blue' ? redTeamSvgGroup : blueTeamSvgGroup;
    const pullClass = team === 'blue' ? 'team-pulling-left' : 'team-pulling-right';

    pullGroup.classList.remove('team-pulling-left', 'team-pulling-right', 'team-strain-opp');
    oppGroup.classList.remove('team-pulling-left', 'team-pulling-right', 'team-strain-opp');

    void pullGroup.offsetWidth;
    void oppGroup.offsetWidth;

    pullGroup.classList.add(pullClass);
    oppGroup.classList.add('team-strain-opp');

    setTimeout(() => {
      pullGroup.classList.remove(pullClass);
      oppGroup.classList.remove('team-strain-opp');
    }, 480);
  }

  function triggerMudSplash(side) {
    const splashGroup = document.getElementById('mud-splash-particles');
    if (!splashGroup) return;
    const offsetX = side === 'left' ? -40 : (side === 'right' ? 40 : 0);
    splashGroup.setAttribute('transform', `translate(${offsetX}, 0)`);
    splashGroup.style.opacity = '1';
    splashGroup.style.transition = 'opacity 0.2s, transform 0.6s ease-out';
    soundEffects.mudSplash();
    setTimeout(() => {
      splashGroup.style.opacity = '0';
    }, 850);
  }

  function triggerVictoryCelebration(winnerTeam) {
    if (!blueTeamSvgGroup || !redTeamSvgGroup) return;
    const winGroup = winnerTeam === 'blue' ? blueTeamSvgGroup : redTeamSvgGroup;
    const loseGroup = winnerTeam === 'blue' ? redTeamSvgGroup : blueTeamSvgGroup;

    winGroup.classList.remove('char-idle-bob', 'team-pulling-left', 'team-pulling-right', 'team-strain-opp');
    loseGroup.classList.remove('char-idle-bob', 'team-pulling-left', 'team-pulling-right', 'team-strain-opp');

    winGroup.classList.add('team-celebrate-anim');
    loseGroup.classList.add('team-mud-slip-anim');

    triggerMudSplash(winnerTeam === 'blue' ? 'right' : 'left');
  }

  function updateTugOfWarVisual(overrideOffset = null) {
    let xOffset = 0;
    let normalized = 0;

    if (overrideOffset !== null) {
      xOffset = overrideOffset;
      normalized = overrideOffset > 0 ? -1 : 1;
    } else {
      const scoreDiff = gameState.blue.score - gameState.red.score;
      const threshold = Math.max(4, Math.min(12, Math.ceil(config.questionCount * 0.5)));
      normalized = Math.max(-1, Math.min(1, scoreDiff / threshold));
      const maxOffset = 130;
      xOffset = -(normalized * maxOffset);
    }

    if (tugActionGroup) {
      tugActionGroup.setAttribute('transform', `translate(${xOffset}, 0)`);
    }

    if (blueTeamSvgGroup && redTeamSvgGroup && !gameState.winningTeam) {
      const blueLean = normalized > 0 ? -4 : 0;
      const redLean = normalized < 0 ? 4 : 0;
      blueTeamSvgGroup.setAttribute('transform', `translate(${blueLean}, 0)`);
      redTeamSvgGroup.setAttribute('transform', `translate(${redLean}, 0)`);
    }

    // Update Live Leader Announcement
    const scoreDiff = gameState.blue.score - gameState.red.score;
    if (scoreDiff > 0) {
      leadText.textContent = `${config.blueName} leads by ${scoreDiff} point${scoreDiff === 1 ? '' : 's'}`;
      leadText.className = 'lead-announcement lead-blue';
    } else if (scoreDiff < 0) {
      const diffAbs = Math.abs(scoreDiff);
      leadText.textContent = `${config.redName} leads by ${diffAbs} point${diffAbs === 1 ? '' : 's'}`;
      leadText.className = 'lead-announcement lead-red';
    } else {
      leadText.textContent = 'Scores are level';
      leadText.className = 'lead-announcement lead-tie';
    }
  }

  // --- Team Photos Management ---
  const DEFAULT_BLUE_PHOTO = '/assets/team_blue.png';
  const DEFAULT_RED_PHOTO = '/assets/team_red.png';

  function getTeamPhotoUrl(team) {
    if (team === 'blue') {
      return config.bluePhoto || DEFAULT_BLUE_PHOTO;
    }
    return config.redPhoto || DEFAULT_RED_PHOTO;
  }

  function isTeamCustomPhoto(team) {
    return team === 'blue' ? Boolean(config.bluePhoto) : Boolean(config.redPhoto);
  }

  function setTeamPhoto(team, dataUrl) {
    if (team === 'blue') {
      config.bluePhoto = dataUrl;
      try {
        localStorage.setItem('math_tug_custom_blue_photo', dataUrl);
      } catch (e) {
        // quota exceeded fallback
      }
    } else {
      config.redPhoto = dataUrl;
      try {
        localStorage.setItem('math_tug_custom_red_photo', dataUrl);
      } catch (e) {
        // quota exceeded fallback
      }
    }
    updateTeamPhotoVisuals();
    announce(`Custom photo updated for ${team === 'blue' ? config.blueName : config.redName}`);
  }

  function resetTeamPhoto(team) {
    if (team === 'blue') {
      config.bluePhoto = null;
      localStorage.removeItem('math_tug_custom_blue_photo');
    } else {
      config.redPhoto = null;
      localStorage.removeItem('math_tug_custom_red_photo');
    }
    updateTeamPhotoVisuals();
    announce(`Reset photo to default cartoon for ${team === 'blue' ? config.blueName : config.redName}`);
  }

  function processImageFile(file, callback) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 500;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const optimized = canvas.toDataURL('image/jpeg', 0.88);
        callback(optimized);
      };
      img.onerror = () => {
        alert('Could not read image file. Please try a different photo.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      alert('Could not load image file.');
    };
    reader.readAsDataURL(file);
  }

  function updateTeamPhotoVisuals() {
    const blueUrl = getTeamPhotoUrl('blue');
    const redUrl = getTeamPhotoUrl('red');
    const isCustomBlue = isTeamCustomPhoto('blue');
    const isCustomRed = isTeamCustomPhoto('red');

    // Update Arena SVG Images
    const blueSvgImg = document.getElementById('team-blue-svg-img');
    const redSvgImg = document.getElementById('team-red-svg-img');
    if (blueSvgImg) {
      blueSvgImg.setAttribute('href', blueUrl);
      blueSvgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', blueUrl);
    }
    if (redSvgImg) {
      redSvgImg.setAttribute('href', redUrl);
      redSvgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', redUrl);
    }

    // Update Configuration Modal Previews & Badges
    const cfgBluePreview = document.getElementById('cfg-blue-photo-preview');
    const cfgRedPreview = document.getElementById('cfg-red-photo-preview');
    if (cfgBluePreview) cfgBluePreview.src = blueUrl;
    if (cfgRedPreview) cfgRedPreview.src = redUrl;

    const cfgBlueBadge = document.getElementById('cfg-blue-photo-badge');
    const cfgRedBadge = document.getElementById('cfg-red-photo-badge');
    if (cfgBlueBadge) {
      cfgBlueBadge.textContent = isCustomBlue ? 'Custom Photo Active' : 'Default Cartoon';
      cfgBlueBadge.className = `photo-badge ${isCustomBlue ? 'custom' : 'default'}`;
    }
    if (cfgRedBadge) {
      cfgRedBadge.textContent = isCustomRed ? 'Custom Photo Active' : 'Default Cartoon';
      cfgRedBadge.className = `photo-badge ${isCustomRed ? 'custom' : 'default'}`;
    }

    const cfgBlueReset = document.getElementById('cfg-blue-photo-reset');
    const cfgRedReset = document.getElementById('cfg-red-photo-reset');
    if (cfgBlueReset) cfgBlueReset.style.display = isCustomBlue ? 'inline-block' : 'none';
    if (cfgRedReset) cfgRedReset.style.display = isCustomRed ? 'inline-block' : 'none';

    const cfgBlueNameDisplay = document.getElementById('cfg-blue-photo-name-display');
    const cfgRedNameDisplay = document.getElementById('cfg-red-photo-name-display');
    if (cfgBlueNameDisplay) cfgBlueNameDisplay.textContent = config.blueName;
    if (cfgRedNameDisplay) cfgRedNameDisplay.textContent = config.redName;
  }

  // --- Keypad & Input Handling ---
  function handleKeypadInput(team, val) {
    if (gameState.status !== 'playing') return;
    const tState = gameState[team];
    if (tState.isFinished) return;

    initAudio();

    if (val === 'clear') {
      tState.currentInput = '';
      tState.hasMinus = false;
    } else if (val === 'backspace') {
      if (tState.currentInput.length > 0) {
        tState.currentInput = tState.currentInput.slice(0, -1);
        if (tState.currentInput === '-') {
          tState.currentInput = '';
          tState.hasMinus = false;
        }
      }
    } else if (val === 'sign') {
      if (config.allowNegative) {
        if (tState.currentInput.startsWith('-')) {
          tState.currentInput = tState.currentInput.substring(1);
          tState.hasMinus = false;
        } else {
          tState.currentInput = '-' + tState.currentInput;
          tState.hasMinus = true;
        }
      }
    } else {
      if (tState.currentInput.length < 8) {
        if (tState.currentInput === '0' && val !== '.') {
          tState.currentInput = val;
        } else if (tState.currentInput === '-0') {
          tState.currentInput = '-' + val;
        } else {
          tState.currentInput += val;
        }
      }
    }

    updateInputDisplay(team);
  }

  function updateInputDisplay(team) {
    const tState = gameState[team];
    const textElem = team === 'blue' ? blueInputText : redInputText;
    const placeholderElem = team === 'blue' ? bluePlaceholder : redPlaceholder;
    const submitBtn = team === 'blue' ? blueBtnSubmit : redBtnSubmit;

    textElem.textContent = tState.currentInput;
    if (tState.currentInput.length > 0) {
      placeholderElem.style.display = 'none';
    } else {
      placeholderElem.style.display = 'inline';
    }

    const isValidNumber = tState.currentInput.length > 0 &&
                          tState.currentInput !== '-' &&
                          !isNaN(Number(tState.currentInput));

    submitBtn.disabled = !isValidNumber || tState.isFinished || gameState.status !== 'playing';
  }

  // --- Question Submission, Skip, and Timeout ---
  function submitAnswer(team) {
    if (gameState.status !== 'playing') return;
    const tState = gameState[team];
    if (tState.isFinished) return;

    const entered = Number(tState.currentInput);
    if (isNaN(entered)) return;

    const currentQ = tState.questions[tState.currentIndex];
    const isCorrect = entered === currentQ.answer;

    const timeSpent = Math.max(0.1, (Date.now() - tState.questionStartTime) / 1000);
    tState.responseTimes.push(timeSpent);

    if (isCorrect) {
      tState.score += config.scoreCorrect;
      tState.correctCount++;
      showFeedback(team, `Correct! +${config.scoreCorrect}`, 'feedback-correct');
      soundEffects.correct();
      triggerPullAnimation(team);
      announce(`${team === 'blue' ? config.blueName : config.redName}: Correct!`);
    } else {
      tState.score += config.scoreIncorrect;
      if (!config.negativeScoring && tState.score < 0) tState.score = 0;
      tState.incorrectCount++;
      const feedbackMsg = config.answerFeedback ? `Incorrect! Answer: ${currentQ.answer}` : 'Incorrect!';
      showFeedback(team, feedbackMsg, 'feedback-incorrect');
      soundEffects.incorrect();
      announce(`${team === 'blue' ? config.blueName : config.redName}: Incorrect.`);
    }

    updateScoresAndStats();
    advanceQuestion(team);
  }

  function skipQuestion(team) {
    if (gameState.status !== 'playing') return;
    const tState = gameState[team];
    if (tState.isFinished) return;

    tState.score += config.scoreSkip;
    if (!config.negativeScoring && tState.score < 0) tState.score = 0;
    tState.skippedCount++;

    showFeedback(team, `Skipped (${config.scoreSkip >= 0 ? '+' : ''}${config.scoreSkip})`, 'feedback-neutral');
    soundEffects.skip();
    announce(`${team === 'blue' ? config.blueName : config.redName} skipped question.`);

    updateScoresAndStats();
    advanceQuestion(team);
  }

  function handleQuestionTimeout(team) {
    const tState = gameState[team];
    if (tState.isFinished || gameState.status !== 'playing') return;

    tState.score += config.scoreTimeout;
    if (!config.negativeScoring && tState.score < 0) tState.score = 0;
    tState.timeoutCount++;

    showFeedback(team, 'Time Expired!', 'feedback-incorrect');
    soundEffects.timeout();
    announce(`${team === 'blue' ? config.blueName : config.redName}: Time expired!`);

    updateScoresAndStats();
    advanceQuestion(team);
  }

  function showFeedback(team, msg, cssClass) {
    const banner = team === 'blue' ? blueFeedback : redFeedback;
    const tState = gameState[team];
    if (tState.feedbackTimeout) clearTimeout(tState.feedbackTimeout);

    banner.textContent = msg;
    banner.className = `feedback-banner ${cssClass}`;
    tState.feedbackTimeout = setTimeout(() => {
      banner.textContent = '';
    }, 2500);
  }

  function advanceQuestion(team) {
    const tState = gameState[team];
    tState.currentInput = '';
    tState.hasMinus = false;
    updateInputDisplay(team);

    tState.currentIndex++;
    if (tState.currentIndex >= config.questionCount) {
      finishTeam(team);
    } else {
      renderCurrentQuestion(team);
      startQuestionTimer(team);
    }
  }

  function renderCurrentQuestion(team) {
    const tState = gameState[team];
    const qExpr = team === 'blue' ? blueExpr : redExpr;
    const pLabel = team === 'blue' ? blueProgressLabel : redProgressLabel;

    if (tState.currentIndex < tState.questions.length) {
      const q = tState.questions[tState.currentIndex];
      qExpr.textContent = q.text;
      pLabel.textContent = `Question ${tState.currentIndex + 1} of ${config.questionCount}`;
      tState.questionStartTime = Date.now();
    }
  }

  // --- Question Timers (Independent) ---
  function startQuestionTimer(team) {
    const tState = gameState[team];
    const timerElem = team === 'blue' ? blueTimerDisplay : redTimerDisplay;

    if (tState.timerInterval) clearInterval(tState.timerInterval);

    if (config.timingMode === 'untimed') {
      timerElem.textContent = 'Untimed';
      timerElem.classList.remove('timer-warning');
      return;
    }

    tState.remainingTime = config.timerSeconds;
    updateTimerBadge(timerElem, tState.remainingTime);

    tState.timerInterval = setInterval(() => {
      if (gameState.status !== 'playing') return;
      tState.remainingTime--;
      updateTimerBadge(timerElem, tState.remainingTime);

      if (tState.remainingTime === 5) {
        announce(`${team === 'blue' ? config.blueName : config.redName}: 5 seconds remaining!`);
      }

      if (tState.remainingTime <= 0) {
        clearInterval(tState.timerInterval);
        handleQuestionTimeout(team);
      }
    }, 1000);
  }

  function updateTimerBadge(elem, seconds) {
    elem.textContent = `⏱️ ${seconds}s`;
    if (seconds <= 5 && seconds > 0) {
      elem.classList.add('timer-warning');
    } else {
      elem.classList.remove('timer-warning');
    }
  }

  function stopTeamTimer(team) {
    const tState = gameState[team];
    if (tState.timerInterval) {
      clearInterval(tState.timerInterval);
      tState.timerInterval = null;
    }
  }

  function resumeQuestionTimer(team) {
    const tState = gameState[team];
    if (tState.isFinished || config.timingMode === 'untimed') return;
    const timerElem = team === 'blue' ? blueTimerDisplay : redTimerDisplay;

    if (tState.timerInterval) clearInterval(tState.timerInterval);

    updateTimerBadge(timerElem, tState.remainingTime);

    tState.timerInterval = setInterval(() => {
      if (gameState.status !== 'playing') return;
      tState.remainingTime--;
      updateTimerBadge(timerElem, tState.remainingTime);

      if (tState.remainingTime === 5) {
        announce(`${team === 'blue' ? config.blueName : config.redName}: 5 seconds remaining!`);
      }

      if (tState.remainingTime <= 0) {
        clearInterval(tState.timerInterval);
        handleQuestionTimeout(team);
      }
    }, 1000);
  }

  // --- Team & Game Completion ---
  function finishTeam(team) {
    const tState = gameState[team];
    tState.isFinished = true;
    stopTeamTimer(team);

    const statusTag = document.getElementById(`${team}-status-tag`);
    if (statusTag) {
      statusTag.textContent = 'Finished';
      statusTag.style.color = '#15803d';
    }

    const qExpr = team === 'blue' ? blueExpr : redExpr;
    qExpr.textContent = 'Done!';

    setTeamControlsEnabled(team, false);

    announce(`${team === 'blue' ? config.blueName : config.redName} has finished all questions.`);

    // Check Perfect Win Condition
    const otherTeam = team === 'blue' ? 'red' : 'blue';
    const otherTeamFinished = gameState[otherTeam].isFinished;
    const isPerfectRun = (
      tState.correctCount === config.questionCount &&
      tState.skippedCount === 0 &&
      tState.incorrectCount === 0 &&
      tState.timeoutCount === 0
    );

    if (isPerfectRun && !otherTeamFinished) {
      gameState.isPerfectWin = true;
      gameState.winningTeam = team;

      stopTeamTimer(otherTeam);
      gameState[otherTeam].isFinished = true;
      setTeamControlsEnabled(otherTeam, false);

      const otherStatusTag = document.getElementById(`${otherTeam}-status-tag`);
      if (otherStatusTag) {
        otherStatusTag.textContent = 'Outpaced';
        otherStatusTag.style.color = '#dc2626';
      }

      const otherExpr = otherTeam === 'blue' ? blueExpr : redExpr;
      otherExpr.textContent = 'Match Ended';

      const winnerName = team === 'blue' ? config.blueName : config.redName;
      announce(`Instant Victory! ${winnerName} answered all questions with 100% accuracy and no skips!`);

      finishMatch(team, true);
      return;
    }

    if (gameState.blue.isFinished && gameState.red.isFinished) {
      finishMatch();
    }
  }

  function setTeamControlsEnabled(team, enabled) {
    const keys = document.querySelectorAll(`.${team}-key`);
    keys.forEach(k => k.disabled = !enabled);

    const skipBtn = team === 'blue' ? blueBtnSkip : redBtnSkip;
    skipBtn.disabled = !enabled;

    updateInputDisplay(team);
  }

  function finishMatch(forcedWinner = null, isPerfect = false) {
    if (gameState.status === 'finishing' || gameState.status === 'finished') return;
    gameState.status = 'finishing';

    if (gameState.elapsedInterval) clearInterval(gameState.elapsedInterval);
    stopTeamTimer('blue');
    stopTeamTimer('red');

    let winnerTeam = forcedWinner;
    let winnerText = '';

    if (isPerfect && forcedWinner) {
      winnerTeam = forcedWinner;
      const winnerName = winnerTeam === 'blue' ? config.blueName : config.redName;
      winnerText = `🏆 ${winnerName} Wins!`;
      soundEffects.perfectWin();

      const arenaInstantBadge = document.getElementById('arena-instant-badge');
      if (arenaInstantBadge) {
        arenaInstantBadge.textContent = `⚡ PERFECT RUN — ${winnerName.toUpperCase()} INSTANT VICTORY! ⚡`;
        arenaInstantBadge.style.display = 'inline-flex';
      }
    } else {
      const bScore = gameState.blue.score;
      const rScore = gameState.red.score;
      if (bScore > rScore) {
        winnerTeam = 'blue';
        winnerText = `🏆 ${config.blueName} Wins!`;
      } else if (rScore > bScore) {
        winnerTeam = 'red';
        winnerText = `🏆 ${config.redName} Wins!`;
      } else {
        winnerTeam = 'draw';
        winnerText = `🤝 It’s a Draw!`;
      }
      soundEffects.win();
    }

    gameState.winningTeam = winnerTeam;
    gameState.isPerfectWin = isPerfect;

    if (winnerTeam === 'blue') {
      winnerBanner.style.color = 'var(--blue-primary)';
    } else if (winnerTeam === 'red') {
      winnerBanner.style.color = 'var(--red-primary)';
    } else {
      winnerBanner.style.color = '#d97706';
    }

    winnerBanner.textContent = winnerText;
    winnerBanner.classList.add('active');
    announce(`Match Finished! ${winnerText}`);

    if (winnerTeam === 'blue' || winnerTeam === 'red') {
      triggerVictoryCelebration(winnerTeam);
      const finalPullOffset = winnerTeam === 'blue' ? -130 : 130;
      updateTugOfWarVisual(finalPullOffset);
    } else {
      updateTugOfWarVisual();
    }

    setTimeout(() => {
      gameState.status = 'finished';
      openResultsModal(winnerText, isPerfect, winnerTeam);
    }, 1600);

    if (btnHoldGame) {
      btnHoldGame.disabled = true;
      btnHoldGame.classList.remove('btn-holding');
    }
    if (arenaHoldOverlay) arenaHoldOverlay.style.display = 'none';
  }

  // --- Match Elapsed Timer ---
  function startElapsedTimer() {
    if (gameState.elapsedInterval) clearInterval(gameState.elapsedInterval);
    gameState.elapsedInterval = setInterval(() => {
      if (gameState.status === 'playing') {
        gameState.elapsedSeconds++;
        const mins = Math.floor(gameState.elapsedSeconds / 60);
        const secs = gameState.elapsedSeconds % 60;
        elapsedDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);
  }

  // --- Countdown Routine (3 -> 2 -> 1 -> GO!) ---
  function startMatchCountdown() {
    initAudio();
    gameState.status = 'countdown';

    if (arenaStartOverlay) arenaStartOverlay.style.display = 'none';
    if (arenaHoldOverlay) arenaHoldOverlay.style.display = 'none';

    winnerBanner.classList.remove('active');
    setTeamControlsEnabled('blue', false);
    setTeamControlsEnabled('red', false);

    if (btnHoldGame) {
      btnHoldGame.disabled = true;
      btnHoldGame.classList.remove('btn-holding');
    }

    countdownOverlay.classList.add('active');
    let count = 3;

    function step() {
      if (gameState.status !== 'countdown') return;

      if (count > 0) {
        countdownDisplay.textContent = String(count);
        announce(String(count));
        soundEffects.countdownTick();
        count--;
        gameState.countdownTimer = setTimeout(step, 1000);
      } else if (count === 0) {
        countdownDisplay.textContent = 'GO!';
        announce('GO!');
        soundEffects.countdownGo();
        count = -1;
        gameState.countdownTimer = setTimeout(() => {
          countdownOverlay.classList.remove('active');
          beginActiveMatch();
        }, 700);
      }
    }

    step();
  }

  function beginActiveMatch() {
    gameState.status = 'playing';
    startElapsedTimer();

    if (btnHoldGame) {
      btnHoldGame.disabled = false;
      btnHoldGame.classList.remove('btn-holding');
      if (holdIcon) holdIcon.textContent = '⏸️';
      if (holdLabel) holdLabel.textContent = 'Hold';
      btnHoldGame.setAttribute('aria-label', 'Hold or Pause Game');
    }

    setTeamControlsEnabled('blue', true);
    setTeamControlsEnabled('red', true);

    startQuestionTimer('blue');
    startQuestionTimer('red');
  }

  // --- Hold / Pause Game Routines ---
  function holdMatch() {
    if (gameState.status !== 'playing') return;
    gameState.status = 'paused';

    if (gameState.elapsedInterval) {
      clearInterval(gameState.elapsedInterval);
      gameState.elapsedInterval = null;
    }
    stopTeamTimer('blue');
    stopTeamTimer('red');

    setTeamControlsEnabled('blue', false);
    setTeamControlsEnabled('red', false);

    if (holdIcon) holdIcon.textContent = '▶️';
    if (holdLabel) holdLabel.textContent = 'Resume';
    if (btnHoldGame) {
      btnHoldGame.classList.add('btn-holding');
      btnHoldGame.setAttribute('aria-label', 'Resume Game');
    }

    if (arenaHoldOverlay) arenaHoldOverlay.style.display = 'flex';
    soundEffects.hold();
    announce('Match held. Press Resume to continue.');
  }

  function resumeMatch() {
    if (gameState.status !== 'paused') return;
    gameState.status = 'playing';

    if (arenaHoldOverlay) arenaHoldOverlay.style.display = 'none';

    if (holdIcon) holdIcon.textContent = '⏸️';
    if (holdLabel) holdLabel.textContent = 'Hold';
    if (btnHoldGame) {
      btnHoldGame.classList.remove('btn-holding');
      btnHoldGame.setAttribute('aria-label', 'Hold or Pause Game');
    }

    startElapsedTimer();
    resumeQuestionTimer('blue');
    resumeQuestionTimer('red');

    setTeamControlsEnabled('blue', !gameState.blue.isFinished);
    setTeamControlsEnabled('red', !gameState.red.isFinished);

    soundEffects.resume();
    announce('Match resumed.');
  }

  function toggleHoldMatch() {
    if (gameState.status === 'playing') {
      holdMatch();
    } else if (gameState.status === 'paused') {
      resumeMatch();
    }
  }

  // --- State Initialization & Replay ---
  function prepareMatch(autoStart = false) {
    if (gameState.countdownTimer) {
      clearTimeout(gameState.countdownTimer);
      gameState.countdownTimer = null;
    }
    if (gameState.elapsedInterval) {
      clearInterval(gameState.elapsedInterval);
      gameState.elapsedInterval = null;
    }
    stopTeamTimer('blue');
    stopTeamTimer('red');

    winnerBanner.classList.remove('active');
    countdownOverlay.classList.remove('active');

    if (arenaHoldOverlay) arenaHoldOverlay.style.display = 'none';

    const arenaInstantBadge = document.getElementById('arena-instant-badge');
    if (arenaInstantBadge) arenaInstantBadge.style.display = 'none';

    const splash = document.getElementById('mud-splash-particles');
    if (splash) splash.style.opacity = '0';

    if (blueTeamSvgGroup && redTeamSvgGroup) {
      blueTeamSvgGroup.classList.remove('team-celebrate-anim', 'team-mud-slip-anim', 'team-pulling-left', 'team-pulling-right', 'team-strain-opp');
      redTeamSvgGroup.classList.remove('team-celebrate-anim', 'team-mud-slip-anim', 'team-pulling-left', 'team-pulling-right', 'team-strain-opp');
      blueTeamSvgGroup.classList.add('char-idle-bob');
      redTeamSvgGroup.classList.add('char-idle-bob');
      blueTeamSvgGroup.setAttribute('transform', 'translate(0, 0)');
      redTeamSvgGroup.setAttribute('transform', 'translate(0, 0)');
    }

    gameState.status = 'idle';
    gameState.blue = createTeamState();
    gameState.red = createTeamState();
    gameState.elapsedSeconds = 0;
    gameState.winningTeam = null;
    gameState.isPerfectWin = false;
    elapsedDisplay.textContent = '00:00';

    blueDisplayName.textContent = config.blueName;
    redDisplayName.textContent = config.redName;
    updateTeamPhotoVisuals();

    const blueSvgLabel = document.getElementById('team-blue-svg-label');
    const redSvgLabel = document.getElementById('team-red-svg-label');
    if (blueSvgLabel) blueSvgLabel.textContent = config.blueName.toUpperCase();
    if (redSvgLabel) redSvgLabel.textContent = config.redName.toUpperCase();

    const blueStatusTag = document.getElementById('blue-status-tag');
    const redStatusTag = document.getElementById('red-status-tag');
    if (blueStatusTag) {
      blueStatusTag.textContent = 'Ready';
      blueStatusTag.style.color = '#64748b';
    }
    if (redStatusTag) {
      redStatusTag.textContent = 'Ready';
      redStatusTag.style.color = '#64748b';
    }

    blueSignRow.style.display = config.allowNegative ? 'block' : 'none';
    redSignRow.style.display = config.allowNegative ? 'block' : 'none';

    gameState.blue.questions = generateQuestionsForTeam(config.questionCount);
    gameState.red.questions = generateQuestionsForTeam(config.questionCount);

    renderCurrentQuestion('blue');
    renderCurrentQuestion('red');

    blueInputText.textContent = '';
    bluePlaceholder.style.display = 'inline';
    redInputText.textContent = '';
    redPlaceholder.style.display = 'inline';
    blueFeedback.textContent = '';
    redFeedback.textContent = '';

    if (config.timingMode === 'untimed') {
      blueTimerDisplay.textContent = 'Untimed';
      redTimerDisplay.textContent = 'Untimed';
    } else {
      blueTimerDisplay.textContent = `⏱️ ${config.timerSeconds}s`;
      redTimerDisplay.textContent = `⏱️ ${config.timerSeconds}s`;
    }
    blueTimerDisplay.classList.remove('timer-warning');
    redTimerDisplay.classList.remove('timer-warning');

    setTeamControlsEnabled('blue', false);
    setTeamControlsEnabled('red', false);

    updateScoresAndStats();
    updateTugOfWarVisual(0);

    if (btnHoldGame) {
      btnHoldGame.disabled = true;
      btnHoldGame.classList.remove('btn-holding');
      if (holdIcon) holdIcon.textContent = '⏸️';
      if (holdLabel) holdLabel.textContent = 'Hold';
    }

    leadText.textContent = 'Ready to Play — Click Start Match to begin';
    leadText.className = 'lead-announcement lead-tie';

    if (autoStart) {
      if (arenaStartOverlay) arenaStartOverlay.style.display = 'none';
      startMatchCountdown();
    } else {
      if (arenaStartOverlay) arenaStartOverlay.style.display = 'flex';
      announce('Match ready. Click Start Match on screen to begin.');
    }
  }

  function updateScoresAndStats() {
    blueScoreDisplay.textContent = gameState.blue.score;
    redScoreDisplay.textContent = gameState.red.score;

    const blueCorrect = document.getElementById('blue-stat-correct');
    const blueIncorrect = document.getElementById('blue-stat-incorrect');
    const blueSkipped = document.getElementById('blue-stat-skipped');
    const blueTimeout = document.getElementById('blue-stat-timeout');
    if (blueCorrect) blueCorrect.textContent = gameState.blue.correctCount;
    if (blueIncorrect) blueIncorrect.textContent = gameState.blue.incorrectCount;
    if (blueSkipped) blueSkipped.textContent = gameState.blue.skippedCount;
    if (blueTimeout) blueTimeout.textContent = gameState.blue.timeoutCount;

    const redCorrect = document.getElementById('red-stat-correct');
    const redIncorrect = document.getElementById('red-stat-incorrect');
    const redSkipped = document.getElementById('red-stat-skipped');
    const redTimeout = document.getElementById('red-stat-timeout');
    if (redCorrect) redCorrect.textContent = gameState.red.correctCount;
    if (redIncorrect) redIncorrect.textContent = gameState.red.incorrectCount;
    if (redSkipped) redSkipped.textContent = gameState.red.skippedCount;
    if (redTimeout) redTimeout.textContent = gameState.red.timeoutCount;

    updateTugOfWarVisual();
  }

  // --- Modals & Pause Flow ---
  function openModal(modal) {
    if (gameState.status === 'playing') {
      gameState.pausedBeforeModalStatus = 'playing';
      holdMatch();
    } else if (gameState.status === 'countdown') {
      gameState.pausedBeforeModalStatus = 'countdown';
    }
    modal.classList.add('open');
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    if (gameState.pausedBeforeModalStatus === 'playing') {
      gameState.pausedBeforeModalStatus = null;
    }
  }

  function openResultsModal(winnerText, isPerfect = false, winnerTeam = null) {
    document.getElementById('results-winner-text').textContent = winnerText;
    const bluePhoto = getTeamPhotoUrl('blue');
    const redPhoto = getTeamPhotoUrl('red');
    document.getElementById('th-blue-name').innerHTML = `<img src="${bluePhoto}" class="table-team-thumb" alt="${config.blueName} avatar" /> ${config.blueName}`;
    document.getElementById('th-red-name').innerHTML = `<img src="${redPhoto}" class="table-team-thumb" alt="${config.redName} avatar" /> ${config.redName}`;

    const resultsPerfectBadge = document.getElementById('results-perfect-badge');
    if (resultsPerfectBadge) {
      if (isPerfect && winnerTeam) {
        const wName = winnerTeam === 'blue' ? config.blueName : config.redName;
        resultsPerfectBadge.innerHTML = `⚡ <strong>PERFECT RUN — INSTANT VICTORY:</strong> ${wName} answered all ${config.questionCount} questions 100% correct with NO skips! ⚡`;
        resultsPerfectBadge.style.display = 'inline-flex';
      } else {
        resultsPerfectBadge.style.display = 'none';
      }
    }

    document.getElementById('res-blue-score').textContent = gameState.blue.score;
    document.getElementById('res-red-score').textContent = gameState.red.score;

    document.getElementById('res-blue-correct').textContent = gameState.blue.correctCount;
    document.getElementById('res-red-correct').textContent = gameState.red.correctCount;

    document.getElementById('res-blue-incorrect').textContent = gameState.blue.incorrectCount;
    document.getElementById('res-red-incorrect').textContent = gameState.red.incorrectCount;

    document.getElementById('res-blue-skipped').textContent = gameState.blue.skippedCount;
    document.getElementById('res-red-skipped').textContent = gameState.red.skippedCount;

    document.getElementById('res-blue-timeout').textContent = gameState.blue.timeoutCount;
    document.getElementById('res-red-timeout').textContent = gameState.red.timeoutCount;

    const blueAnswered = gameState.blue.correctCount + gameState.blue.incorrectCount;
    const redAnswered = gameState.red.correctCount + gameState.red.incorrectCount;

    const blueAcc = blueAnswered > 0 ? Math.round((gameState.blue.correctCount / blueAnswered) * 100) : 0;
    const redAcc = redAnswered > 0 ? Math.round((gameState.red.correctCount / redAnswered) * 100) : 0;
    document.getElementById('res-blue-accuracy').textContent = `${blueAcc}%`;
    document.getElementById('res-red-accuracy').textContent = `${redAcc}%`;

    const calcAvgTime = (times) => {
      if (!times.length) return '0.0s';
      const sum = times.reduce((a, b) => a + b, 0);
      return `${(sum / times.length).toFixed(1)}s`;
    };
    document.getElementById('res-blue-avg-time').textContent = calcAvgTime(gameState.blue.responseTimes);
    document.getElementById('res-red-avg-time').textContent = calcAvgTime(gameState.red.responseTimes);

    const mins = Math.floor(gameState.elapsedSeconds / 60);
    const secs = gameState.elapsedSeconds % 60;
    document.getElementById('res-total-time').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const diff = gameState.blue.score - gameState.red.score;
    let summaryStr = 'Final Rope Position: perfectly centered.';
    if (diff > 0) summaryStr = `Final Rope Position: pulled towards ${config.blueName} by ${diff} points.`;
    if (diff < 0) summaryStr = `Final Rope Position: pulled towards ${config.redName} by ${Math.abs(diff)} points.`;
    document.getElementById('results-rope-summary').textContent = summaryStr;

    openModal(modalResults);
  }

  // --- Configuration Form Validation & Summary ---
  function updateConfigSummary() {
    const count = document.getElementById('cfg-question-count').value || 15;
    const op = document.getElementById('cfg-operation').value;
    const digits = document.getElementById('cfg-digits').value;
    const timing = document.getElementById('cfg-timing-mode').value;
    const seconds = document.getElementById('cfg-timer-seconds').value || 15;
    const cor = document.getElementById('cfg-score-correct').value;
    const skip = document.getElementById('cfg-score-skip').value;

    let opText = op;
    if (op === 'mixed') opText = 'mixed operations';

    const timingText = timing === 'timed' ? `timed mode (${seconds}s)` : 'untimed mode';
    const summaryElem = document.getElementById('cfg-summary-text');
    if (summaryElem) {
      summaryElem.textContent =
        `${count} questions per team, ${opText}, ${digits} digit${digits > 1 ? 's' : ''}, ${timingText}, correct +${cor}, skip ${skip}.`;
    }
  }

  function validateAndApplyConfig() {
    const errBanner = document.getElementById('cfg-error-banner');
    errBanner.classList.remove('visible');
    errBanner.textContent = '';

    const bName = document.getElementById('cfg-blue-name').value.trim() || 'Blue Team';
    const rName = document.getElementById('cfg-red-name').value.trim() || 'Red Team';
    const qCount = parseInt(document.getElementById('cfg-question-count').value, 10);
    const op = document.getElementById('cfg-operation').value;
    const digits = parseInt(document.getElementById('cfg-digits').value, 10);
    const carrying = document.getElementById('cfg-carrying').value;
    const borrowing = document.getElementById('cfg-borrowing').value;
    const allowNeg = document.getElementById('cfg-allow-negative').checked;

    const mulMin = parseInt(document.getElementById('cfg-mul-min').value, 10);
    const mulMax = parseInt(document.getElementById('cfg-mul-max').value, 10);
    const divMin = parseInt(document.getElementById('cfg-div-min').value, 10);
    const divMax = parseInt(document.getElementById('cfg-div-max').value, 10);

    const timingMode = document.getElementById('cfg-timing-mode').value;
    const timerSecs = parseInt(document.getElementById('cfg-timer-seconds').value, 10);

    const sCorrect = parseInt(document.getElementById('cfg-score-correct').value, 10);
    const sSkip = parseInt(document.getElementById('cfg-score-skip').value, 10);
    const sIncorrect = parseInt(document.getElementById('cfg-score-incorrect').value, 10);
    const sTimeout = parseInt(document.getElementById('cfg-score-timeout').value, 10);
    const negScoring = document.getElementById('cfg-negative-scoring').checked;
    const ansFeedback = document.getElementById('cfg-answer-feedback').checked;

    if (isNaN(qCount) || qCount < 1 || qCount > 100) {
      showConfigError('Please enter a question count between 1 and 100.');
      switchConfigTab('game');
      return false;
    }
    if (op === 'mixed') {
      const selectedOps = [];
      if (document.getElementById('mix-add').checked) selectedOps.push('addition');
      if (document.getElementById('mix-sub').checked) selectedOps.push('subtraction');
      if (document.getElementById('mix-mul').checked) selectedOps.push('multiplication');
      if (document.getElementById('mix-div').checked) selectedOps.push('division');
      if (selectedOps.length === 0) {
        showConfigError('Please select at least one operation for Mixed mode.');
        switchConfigTab('game');
        return false;
      }
      config.mixedOps = selectedOps;
    }
    if (mulMin > mulMax) {
      showConfigError('Multiplication Min Factor cannot exceed Max Factor.');
      switchConfigTab('game');
      return false;
    }
    if (divMin > divMax) {
      showConfigError('Division Min Divisor cannot exceed Max Divisor.');
      switchConfigTab('game');
      return false;
    }
    if (timingMode === 'timed' && (isNaN(timerSecs) || timerSecs < 5 || timerSecs > 120)) {
      showConfigError('Seconds per question must be between 5 and 120.');
      switchConfigTab('game');
      return false;
    }

    config.blueName = bName;
    config.redName = rName;
    config.questionCount = qCount;
    config.operation = op;
    config.digits = digits;
    config.carrying = carrying;
    config.borrowing = borrowing;
    config.allowNegative = allowNeg;
    config.mulMin = mulMin;
    config.mulMax = mulMax;
    config.divMin = divMin;
    config.divMax = divMax;
    config.timingMode = timingMode;
    config.timerSeconds = timerSecs;
    config.scoreCorrect = isNaN(sCorrect) ? 1 : sCorrect;
    config.scoreSkip = isNaN(sSkip) ? -1 : sSkip;
    config.scoreIncorrect = isNaN(sIncorrect) ? 0 : sIncorrect;
    config.scoreTimeout = isNaN(sTimeout) ? 0 : sTimeout;
    config.negativeScoring = negScoring;
    config.answerFeedback = ansFeedback;

    return true;
  }

  function showConfigError(msg) {
    const errBanner = document.getElementById('cfg-error-banner');
    if (errBanner) {
      errBanner.textContent = msg;
      errBanner.classList.add('visible');
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Header Buttons
    document.getElementById('btn-options').addEventListener('click', () => {
      initAudio();
      openModal(modalConfig);
    });
    document.getElementById('btn-rules').addEventListener('click', () => {
      initAudio();
      openModal(modalRules);
    });
    document.getElementById('btn-sound').addEventListener('click', (e) => {
      initAudio();
      soundEnabled = !soundEnabled;
      const icon = document.getElementById('sound-icon');
      const label = document.getElementById('sound-label');
      if (soundEnabled) {
        icon.textContent = '🔊';
        label.textContent = 'Sound On';
        e.currentTarget.setAttribute('aria-pressed', 'true');
      } else {
        icon.textContent = '🔇';
        label.textContent = 'Sound Off';
        e.currentTarget.setAttribute('aria-pressed', 'false');
      }
    });
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
    if (btnHoldGame) {
      btnHoldGame.addEventListener('click', () => {
        initAudio();
        toggleHoldMatch();
      });
    }
    document.getElementById('btn-reset-game').addEventListener('click', () => {
      initAudio();
      prepareMatch(false);
    });

    // Options Modal Tabs
    if (tabBtnTeam) {
      tabBtnTeam.addEventListener('click', () => switchConfigTab('team'));
    }
    if (tabBtnGame) {
      tabBtnGame.addEventListener('click', () => switchConfigTab('game'));
    }

    // Arena Start & Hold Overlay Buttons
    if (btnArenaStart) {
      btnArenaStart.addEventListener('click', () => {
        initAudio();
        startMatchCountdown();
      });
    }
    if (btnArenaOptions) {
      btnArenaOptions.addEventListener('click', () => {
        initAudio();
        openModal(modalConfig);
      });
    }
    if (btnArenaResume) {
      btnArenaResume.addEventListener('click', () => {
        initAudio();
        resumeMatch();
      });
    }
    if (btnArenaStop) {
      btnArenaStop.addEventListener('click', () => {
        initAudio();
        finishMatch();
      });
    }
    if (btnArenaReset) {
      btnArenaReset.addEventListener('click', () => {
        initAudio();
        prepareMatch(false);
      });
    }

    // Keypad Click Delegation
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const team = e.currentTarget.dataset.team;
        const val = e.currentTarget.dataset.val;
        const action = e.currentTarget.dataset.action;
        if (val !== undefined) {
          handleKeypadInput(team, val);
        } else if (action !== undefined) {
          handleKeypadInput(team, action);
        }
      });
    });

    // Submit & Skip Buttons
    blueBtnSubmit.addEventListener('click', () => submitAnswer('blue'));
    redBtnSubmit.addEventListener('click', () => submitAnswer('red'));
    blueBtnSkip.addEventListener('click', () => skipQuestion('blue'));
    redBtnSkip.addEventListener('click', () => skipQuestion('red'));

    // Team Photos Handlers (Options Modal only)
    function setupPhotoInputHandlers(team, btnId, inputId, resetBtnId) {
      const btn = document.getElementById(btnId);
      const input = document.getElementById(inputId);
      const resetBtn = document.getElementById(resetBtnId);

      if (btn && input) {
        btn.addEventListener('click', () => {
          initAudio();
          input.click();
        });
      }
      if (input) {
        input.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            processImageFile(file, (dataUrl) => {
              setTeamPhoto(team, dataUrl);
            });
            input.value = '';
          }
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          initAudio();
          resetTeamPhoto(team);
        });
      }
    }

    setupPhotoInputHandlers('blue', 'cfg-blue-photo-btn', 'cfg-blue-photo-file', 'cfg-blue-photo-reset');
    setupPhotoInputHandlers('red', 'cfg-red-photo-btn', 'cfg-red-photo-file', 'cfg-red-photo-reset');

    // Dynamic team name display in photo section
    const cfgBlueNameInput = document.getElementById('cfg-blue-name');
    const cfgRedNameInput = document.getElementById('cfg-red-name');
    if (cfgBlueNameInput) {
      cfgBlueNameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Blue Team';
        const display = document.getElementById('cfg-blue-photo-name-display');
        if (display) display.textContent = val;
      });
    }
    if (cfgRedNameInput) {
      cfgRedNameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Red Team';
        const display = document.getElementById('cfg-red-photo-name-display');
        if (display) display.textContent = val;
      });
    }

    // Drag & Drop on Modal Cards
    function setupCardDragDrop(team, cardId) {
      const card = document.getElementById(cardId);
      if (!card) return;
      ['dragenter', 'dragover'].forEach(evt => {
        card.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          card.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(evt => {
        card.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          card.classList.remove('drag-over');
        });
      });
      card.addEventListener('drop', (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          processImageFile(files[0], (dataUrl) => {
            setTeamPhoto(team, dataUrl);
          });
        }
      });
    }

    setupCardDragDrop('blue', 'modal-blue-photo-card');
    setupCardDragDrop('red', 'modal-red-photo-card');

    // Config Form Interactive Visibility
    const opSelect = document.getElementById('cfg-operation');
    const mixedGroup = document.getElementById('mixed-ops-group');
    const digitsSection = document.getElementById('cfg-section-digits');
    const subSection = document.getElementById('cfg-section-sub');
    const mulSection = document.getElementById('cfg-section-mul');
    const divSection = document.getElementById('cfg-section-div');
    const timingSelect = document.getElementById('cfg-timing-mode');
    const timerGroup = document.getElementById('cfg-timer-group');

    function syncConfigFormVisibility() {
      const val = opSelect.value;
      mixedGroup.style.display = val === 'mixed' ? 'block' : 'none';
      digitsSection.style.display = (val === 'addition' || val === 'subtraction' || val === 'mixed') ? 'grid' : 'none';
      subSection.style.display = (val === 'subtraction' || val === 'mixed') ? 'grid' : 'none';
      mulSection.style.display = (val === 'multiplication' || val === 'mixed') ? 'grid' : 'none';
      divSection.style.display = (val === 'division' || val === 'mixed') ? 'grid' : 'none';

      timerGroup.style.display = timingSelect.value === 'timed' ? 'flex' : 'none';
      updateConfigSummary();
    }

    opSelect.addEventListener('change', syncConfigFormVisibility);
    timingSelect.addEventListener('change', syncConfigFormVisibility);
    modalConfig.querySelectorAll('input, select').forEach(elem => {
      elem.addEventListener('input', updateConfigSummary);
    });

    // Config Modal Actions
    document.getElementById('btn-close-config').addEventListener('click', () => closeModal(modalConfig));
    document.getElementById('btn-cancel-config').addEventListener('click', () => closeModal(modalConfig));
    document.getElementById('btn-start-game').addEventListener('click', () => {
      if (validateAndApplyConfig()) {
        closeModal(modalConfig);
        prepareMatch(true);
      }
    });

    // Rules Modal Actions
    document.getElementById('btn-close-rules').addEventListener('click', () => closeModal(modalRules));
    document.getElementById('btn-ok-rules').addEventListener('click', () => closeModal(modalRules));

    // Results Modal Actions
    document.getElementById('btn-res-playagain').addEventListener('click', () => {
      closeModal(modalResults);
      prepareMatch(false);
    });
    document.getElementById('btn-res-options').addEventListener('click', () => {
      closeModal(modalResults);
      openModal(modalConfig);
    });
    document.getElementById('btn-res-reset').addEventListener('click', () => {
      closeModal(modalResults);
      prepareMatch(false);
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalRules.classList.contains('open')) closeModal(modalRules);
        if (modalConfig.classList.contains('open')) closeModal(modalConfig);
        return;
      }

      if ((e.code === 'Space' || e.key === 'p' || e.key === 'P') &&
          !modalRules.classList.contains('open') &&
          !modalConfig.classList.contains('open') &&
          !modalResults.classList.contains('open')) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'select' && activeTag !== 'textarea') {
          if (gameState.status === 'playing' || gameState.status === 'paused') {
            e.preventDefault();
            initAudio();
            toggleHoldMatch();
          }
        }
      }
    });
  }

  function syncFormValuesFromConfig() {
    document.getElementById('cfg-blue-name').value = config.blueName;
    document.getElementById('cfg-red-name').value = config.redName;
    document.getElementById('cfg-question-count').value = config.questionCount;
    document.getElementById('cfg-operation').value = config.operation;
    document.getElementById('cfg-digits').value = config.digits;
    document.getElementById('cfg-carrying').value = config.carrying;
    document.getElementById('cfg-borrowing').value = config.borrowing;
    document.getElementById('cfg-allow-negative').checked = config.allowNegative;
    document.getElementById('cfg-mul-min').value = config.mulMin;
    document.getElementById('cfg-mul-max').value = config.mulMax;
    document.getElementById('cfg-div-min').value = config.divMin;
    document.getElementById('cfg-div-max').value = config.divMax;
    document.getElementById('cfg-timing-mode').value = config.timingMode;
    document.getElementById('cfg-timer-seconds').value = config.timerSeconds;
    document.getElementById('cfg-score-correct').value = config.scoreCorrect;
    document.getElementById('cfg-score-skip').value = config.scoreSkip;
    document.getElementById('cfg-score-incorrect').value = config.scoreIncorrect;
    document.getElementById('cfg-score-timeout').value = config.scoreTimeout;
    document.getElementById('cfg-negative-scoring').checked = config.negativeScoring;
    document.getElementById('cfg-answer-feedback').checked = config.answerFeedback;
    updateTeamPhotoVisuals();
  }

  // --- Init on Window Load ---
  window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    syncFormValuesFromConfig();
    updateConfigSummary();
    prepareMatch(false);
  });

})();
