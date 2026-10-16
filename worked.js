/* Chapter-based observation and reasoning for the first four worked examples. */
(function () {
  'use strict';
  const predictions = new Map();
  let root, dispose = () => {}, currentTopic = null, currentVideo = null, stopCurrent = () => {};

  function element(tag, text, parent, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    if (parent) parent.append(node);
    return node;
  }

  function pauseVideo() {
    stopCurrent();
  }

  function render(id) {
    if (!root || id === currentTopic) return;
    dispose();
    stopCurrent = () => {};
    currentTopic = id;
    currentVideo = null;
    root.replaceChildren();
    const shortcut = document.getElementById('workedShortcut');
    // The opening six lessons use live SVG reasoning instead of video players.
    const example = ['motion','displacement','projectile','vectors','newton','momentum'].includes(id) ? null : window.WORKED_SOLUTIONS && window.WORKED_SOLUTIONS[id];
    root.hidden = !example || !Array.isArray(example.steps) || !example.steps.length;
    if (shortcut) shortcut.hidden = root.hidden;
    if (root.hidden) return;

    const section = element('section', null, root, 'worked-card');
    section.setAttribute('aria-labelledby', 'workedHeading');
    element('p', 'WATCH · PREDICT · EXPLAIN', section, 'worked-kicker');
    const heading = element('h3', 'Observe a worked solution', section);
    heading.id = 'workedHeading';
    element('p', 'Choose a step, make a prediction, then play the animation and reveal the reasoning.', section, 'worked-intro');
    element('p', example.question, section, 'worked-question');

    const video = element('video', null, section, 'worked-video');
    currentVideo = video;
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('aria-label', 'Animated worked solution. Each step has a written observation prompt and reasoning below.');
    if (example.poster) video.poster = example.poster;
    element('p', 'Use the written steps below if your browser cannot play the animation.', video);
    const status = element('p', 'Preparing the animation…', section, 'worked-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const chapters = element('div', null, section, 'worked-chapters');
    chapters.setAttribute('role', 'group');
    chapters.setAttribute('aria-label', 'Worked solution steps');
    const buttons = example.steps.map((step, index) => {
      const button = element('button', null, chapters, 'worked-chapter');
      button.type = 'button';
      button.disabled = true;
      element('span', String(index + 1).padStart(2, '0'), button, 'worked-number');
      element('span', step.title, button);
      button.setAttribute('aria-controls', 'workedObservation');
      return button;
    });

    const transport = element('div', null, section, 'worked-transport');
    const playStep = element('button', 'Play this step', transport, 'worked-play');
    playStep.type = 'button';
    playStep.disabled = true;
    const pause = element('button', 'Pause', transport);
    pause.type = 'button';
    pause.disabled = true;
    const speedLabel = element('label', 'Playback speed ', transport, 'worked-speed');
    const speed = element('select', null, speedLabel);
    speed.disabled = true;
    for (const rate of [0.5, 1, 1.5]) {
      const option = element('option', rate + '×', speed);
      option.value = String(rate);
      option.selected = rate === 1;
    }
    element('p', 'Step playback stops before the next step. Native video controls play continuously.', section, 'worked-help');

    const observation = element('div', null, section, 'worked-observation');
    observation.id = 'workedObservation';
    const stepHeading = element('h4', '', observation);
    const prompt = element('p', '', observation);
    const predictionLabel = element('label', 'Your prediction or observation (optional)', observation, 'worked-prediction-label');
    predictionLabel.htmlFor = 'workedPrediction';
    const prediction = element('textarea', null, observation);
    prediction.id = 'workedPrediction';
    prediction.rows = 3;
    prediction.placeholder = 'Describe what you expect to see and explain why.';
    prediction.setAttribute('aria-describedby', 'workedPredictionHelp');
    const predictionHelp = element('p', 'Your notes stay in this page session and clear when the page is reloaded.', observation, 'worked-help');
    predictionHelp.id = 'workedPredictionHelp';
    const reveal = element('button', 'Reveal reasoning', observation, 'worked-reveal');
    reveal.type = 'button';
    reveal.setAttribute('aria-expanded', 'false');
    reveal.setAttribute('aria-controls', 'workedReasoning');
    const reasoning = element('div', null, observation, 'worked-reasoning');
    reasoning.id = 'workedReasoning';
    reasoning.hidden = true;
    const answer = element('p', '', reasoning);
    const math = element('div', '', reasoning, 'worked-math');
    if (example.pitfall) {
      const detail = element('details', null, section, 'worked-assumptions');
      element('summary', 'Scenario and assumptions', detail);
      element('p', example.pitfall, detail);
    }

    let activeStep = 0, stopAt = null, frame = 0, timer = 0, disposed = false;
    let expectedSeek = null, playRequest = 0, stepPlayPending = false;
    let mediaReady = false, objectUrl = null;
    const sourceRequest = new AbortController();
    stopCurrent = () => {
      playRequest++;
      stepPlayPending = false;
      stopAt = null;
      video.pause();
    };
    const stepStart = index => Math.max(0, Number(example.steps[index].time) || 0);
    const noteKey = () => id + ':' + activeStep;

    function hideReasoning() {
      reasoning.hidden = true;
      reveal.textContent = 'Reveal reasoning';
      reveal.setAttribute('aria-expanded', 'false');
    }

    function displayStep(index) {
      activeStep = index;
      const step = example.steps[index];
      buttons.forEach((button, i) => {
        button.setAttribute('aria-pressed', String(i === index));
      });
      stepHeading.textContent = 'Step ' + (index + 1) + ' — ' + step.title;
      prompt.textContent = step.prompt;
      prediction.value = predictions.get(noteKey()) || '';
      answer.textContent = step.answer;
      math.replaceChildren();
      if (step.tex && window.katex) {
        try {
          window.katex.render(step.tex, math, { displayMode: true, throwOnError: true, trust: false });
        } catch (_) {
          math.textContent = step.tex;
        }
      } else if (step.tex) {
        math.textContent = step.tex;
      }
      hideReasoning();
    }

    function clearMonitor() {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      timer = 0;
    }

    function stepAt(time) {
      let index = 0;
      example.steps.forEach((_, i) => { if (time >= stepStart(i)) index = i; });
      return index;
    }

    function seek(time) {
      expectedSeek = time;
      try { video.currentTime = time; } catch (_) { expectedSeek = null; }
    }

    function observeTime() {
      if (disposed || !mediaReady) return;
      if (stopAt !== null && video.currentTime >= stopAt - 0.015) {
        const boundary = stopAt;
        stopAt = null;
        video.pause();
        seek(boundary);
        status.textContent = 'Step complete. Record your observation, then reveal the reasoning.';
        return;
      }
      const index = stepAt(video.currentTime);
      if (index !== activeStep) displayStep(index);
    }

    function monitor() {
      clearMonitor();
      if (disposed || video.paused) return;
      observeTime();
      if (video.paused) return;
      frame = requestAnimationFrame(monitor);
      if (stopAt !== null) {
        const delay = Math.max(0, (stopAt - video.currentTime) / video.playbackRate * 1000);
        timer = setTimeout(() => {
          observeTime();
          if (!video.paused) monitor();
        }, Math.min(delay, 200));
      }
    }

    function chapterEnd(index) {
      const suppliedEnd = Number(example.steps[index].end);
      const nextStart = index + 1 < example.steps.length ? stepStart(index + 1) : Infinity;
      const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
      const end = Math.min(Number.isFinite(suppliedEnd) ? suppliedEnd : Infinity, nextStart, duration);
      return Number.isFinite(end) ? Math.max(stepStart(index), end - 0.08) : null;
    }

    function selectStep(index) {
      if (!mediaReady || disposed) return;
      playRequest++;
      stepPlayPending = false;
      stopAt = null;
      video.pause();
      displayStep(index);
      seek(stepStart(index));
      status.textContent = 'Step ' + (index + 1) + ' selected. Make a prediction before playing.';
    }

    buttons.forEach((button, i) => { button.onclick = () => selectStep(i); });
    prediction.oninput = () => { predictions.set(noteKey(), prediction.value); };
    reveal.onclick = () => {
      reasoning.hidden = !reasoning.hidden;
      reveal.textContent = reasoning.hidden ? 'Reveal reasoning' : 'Hide reasoning';
      reveal.setAttribute('aria-expanded', String(!reasoning.hidden));
    };
    playStep.onclick = async () => {
      if (!mediaReady || disposed) return;
      const request = ++playRequest;
      video.pause();
      seek(stepStart(activeStep));
      stopAt = chapterEnd(activeStep);
      stepPlayPending = true;
      status.textContent = 'Playing step ' + (activeStep + 1) + '.';
      try {
        await video.play();
        if (disposed || request !== playRequest) video.pause();
      } catch (_) {
        if (!disposed && request === playRequest) {
          stepPlayPending = false;
          stopAt = null;
          status.textContent = 'The video could not start. Try the native play control, or use the written steps below.';
        }
      }
    };
    pause.onclick = stopCurrent;
    speed.onchange = () => { video.playbackRate = Number(speed.value); };
    video.addEventListener('play', () => {
      if (!stepPlayPending) {
        stopAt = null;
        status.textContent = 'Playing the complete animation. Choose a step to focus on one part.';
      }
      stepPlayPending = false;
      pause.disabled = false;
      monitor();
    });
    video.addEventListener('pause', () => { pause.disabled = true; clearMonitor(); });
    video.addEventListener('ratechange', () => { speed.value = String(video.playbackRate); monitor(); });
    video.addEventListener('timeupdate', observeTime);
    video.addEventListener('seeking', () => {
      if (expectedSeek === null || Math.abs(video.currentTime - expectedSeek) > 0.15) stopAt = null;
    });
    video.addEventListener('seeked', () => { expectedSeek = null; observeTime(); monitor(); });
    video.addEventListener('loadedmetadata', () => {
      if (disposed) return;
      mediaReady = true;
      buttons.forEach(button => { button.disabled = false; });
      playStep.disabled = false;
      speed.disabled = false;
      seek(stepStart(activeStep));
      status.textContent = 'Ready. Choose a step and make a prediction before playing.';
      if (stopAt !== null) stopAt = chapterEnd(activeStep);
    });
    video.addEventListener('ended', () => {
      stopAt = null;
      clearMonitor();
      status.textContent = 'Animation complete. Revisit any step to test your explanation.';
    });
    video.addEventListener('error', () => {
      if (!disposed) {
        mediaReady = false;
        buttons.forEach(button => { button.disabled = true; });
        playStep.disabled = true;
        speed.disabled = true;
        status.textContent = 'The animation is unavailable. The question and written reasoning for the selected step remain available below.';
      }
    });
    displayStep(0);

    dispose = () => {
      disposed = true;
      playRequest++;
      sourceRequest.abort();
      clearMonitor();
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    async function prepareSource() {
      if (!example.src) {
        status.textContent = 'No animation file is available for this example.';
        return;
      }
      const assetUrl = new URL(example.src, document.baseURI);
      let sourceUrl = assetUrl.href;
      if (assetUrl.protocol === 'http:' || assetUrl.protocol === 'https:') {
        try {
          // Small local clips are loaded as blobs so seeking also works on servers
          // that serve the whole MP4 without HTTP Range support.
          const response = await fetch(assetUrl.href, { signal: sourceRequest.signal });
          if (!response.ok) throw new Error('Video response ' + response.status);
          const blob = await response.blob();
          if (disposed || sourceRequest.signal.aborted) return;
          objectUrl = URL.createObjectURL(blob.type.startsWith('video/') ? blob : new Blob([blob], { type: 'video/mp4' }));
          sourceUrl = objectUrl;
        } catch (_) {
          if (disposed || sourceRequest.signal.aborted) return;
          status.textContent = 'Preparing the animation from its original file…';
        }
      }
      if (disposed || sourceRequest.signal.aborted) return;
      video.src = sourceUrl;
      video.load();
    }
    prepareSource();
  }

  function initialise() {
    root = document.getElementById('workedSolution');
    if (!root) return;
    root.classList.add('worked-solutions');
    const shortcut = document.getElementById('workedShortcut');
    if (shortcut) {
      shortcut.textContent = 'Explore this question step by step ↓';
      shortcut.onclick = () => {
        const tab = document.getElementById('tab-practice');
        if (tab) tab.click();
        root.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      };
    }
    document.addEventListener('physics-topic-change', event => { render(event.detail && event.detail.id); });
    document.addEventListener('physics-tab-change', event => {
      if (!event.detail || event.detail.id !== 'practice') pauseVideo();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pauseVideo(); });
    window.addEventListener('pagehide', pauseVideo);
    const state = window.labDebug && window.labDebug.getState();
    render(state ? state.id : location.hash.slice(1) || 'motion');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
