(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('.motion-toggle');
  const motionListeners = new Set();
  let userPaused = false;
  let motionContext;
  let entrancePlayed = false;
  let sceneController;
  let heroVisible = true;
  let ambientTweens = [];
  const motionEnabled = () => !reducedMotion.matches && !userPaused;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // The data explorer is independent of either animation library.
  async function initializeComparison() {
    const controls = document.querySelector('.metric-switch');
    try {
      const response = await fetch('index.json');
      if (!response.ok) return;
      const episodes = await response.json();
      const episode = episodes.find(item => item.slug === '01-karpathy-vs-bare');
      const runs = ['bare', 'karpathy'].map(variant => episode?.runs.find(run => run.wariant === variant));
      if (runs.some(run => !run || ['sekundy', 'tokeny', 'tok_s'].some(key => !Number.isFinite(run[key]) || run[key] <= 0))) return;
      const metrics = {
        time: { key: 'sekundy', format: value => `${Math.floor(Math.round(value) / 60)} min ${Math.round(value) % 60} s`, less: 'less time', more: 'more time', verb: 'took' },
        tokens: { key: 'tokeny', format: value => value.toLocaleString('en-US'), less: 'fewer tokens', more: 'more tokens', verb: 'used' },
        throughput: { key: 'tok_s', format: value => `${value.toFixed(2)} tok/s`, less: 'lower throughput', more: 'higher throughput', verb: 'had' }
      };
      function selectMetric(key) {
        const metric = metrics[key];
        const values = runs.map(run => run[metric.key]);
        const maximum = Math.max(...values);
        controls.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.metric === key)));
        document.querySelectorAll('.compare-value').forEach((element, i) => { element.textContent = metric.format(values[i]); });
        document.querySelectorAll('.bar-fill').forEach((bar, i) => {
          const width = `${values[i] / maximum * 100}%`;
          if (gsap && motionEnabled()) gsap.to(bar, { width, duration: .55, ease: 'power3.out', overwrite: true });
          else {
            gsap?.killTweensOf(bar);
            bar.style.width = width;
          }
        });
        const difference = (values[1] / values[0] - 1) * 100;
        document.querySelector('.compare-summary').textContent = Math.abs(difference) < .05
          ? 'Both variants recorded the same value in this run.'
          : `Karpathy ${metric.verb} ${Math.abs(difference).toFixed(1)}% ${difference < 0 ? metric.less : metric.more} in this run.`;
      }
      controls.addEventListener('click', event => {
        const button = event.target.closest('button[data-metric]');
        if (button) selectMetric(button.dataset.metric);
      });
      controls.hidden = false;
      selectMetric('time');
    } catch {
      // Static run metrics and the default time comparison remain available.
    }
  }

  function setupMotion() {
    if (!gsap) return;
    motionContext?.revert();
    motionContext = undefined;
    ambientTweens = [];
    gsap.getTweensOf('.bar-fill').forEach(tween => tween.progress(1).kill());
    if (!motionEnabled()) return;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    motionContext = gsap.context(() => {
      if (!entrancePlayed) {
        gsap.from('.title-line', { y: 48, opacity: 0, duration: 1.05, stagger: .13, ease: 'power3.out' });
        gsap.from('.hero .lead, .hero-copy .actions', { y: 20, opacity: 0, delay: .45, duration: .8, stagger: .1, ease: 'power2.out' });
        entrancePlayed = true;
      }
      if (ScrollTrigger) {
        document.querySelectorAll('.reveal').forEach(element => {
          gsap.from(element, {
            y: 36, duration: .9, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 92%', once: true }
          });
        });
        gsap.to('.scene-grid', { y: 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      }
      ambientTweens.push(gsap.to('.telemetry-hardware', { y: -9, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: !heroVisible }));
      ambientTweens.push(gsap.to('.telemetry-run', { y: 9, duration: 4.1, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: !heroVisible }));
    });
    if (document.hidden) gsap.globalTimeline.pause();
  }

  function updateMotion() {
    const enabled = motionEnabled();
    document.documentElement.dataset.motion = enabled ? 'active' : 'paused';
    motionButton.setAttribute('aria-pressed', String(!enabled));
    motionButton.disabled = reducedMotion.matches;
    motionButton.innerHTML = reducedMotion.matches
      ? '<span aria-hidden="true">○</span> Motion reduced'
      : enabled ? '<span aria-hidden="true">Ⅱ</span> Pause motion' : '<span aria-hidden="true">▷</span> Resume motion';
    setupMotion();
    motionListeners.forEach(listener => listener(enabled));
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', () => {
    if (gsap) document.hidden ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
  });
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    ambientTweens.forEach(tween => tween.paused(!heroVisible));
  }).observe(document.querySelector('.hero'));
  updateMotion();
  initializeComparison();

  document.querySelectorAll('.spotlight').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || !motionEnabled()) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
    });
  });
  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (!gsap || !finePointer.matches || !motionEnabled()) return;
      const box = button.getBoundingClientRect();
      gsap.to(button, { x: (event.clientX - box.left - box.width / 2) * .12, y: (event.clientY - box.top - box.height / 2) * .18, duration: .35, overwrite: true });
    });
    button.addEventListener('pointerleave', () => { if (gsap) gsap.to(button, { x: 0, y: 0, duration: motionEnabled() ? .45 : 0, overwrite: true }); });
    motionListeners.add(enabled => {
      if (!enabled && gsap) { gsap.killTweensOf(button); gsap.set(button, { clearProps: 'transform' }); }
    });
  });

  let scrollPending = false;
  const progress = document.querySelector('.reading-progress');
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // Lazy loading keeps the benchmark controls usable if WebGL or Three.js fails.
  import('./neural-scene.js').then(({ createNeuralScene }) => {
    sceneController = createNeuralScene(document.querySelector('.scene'), motionEnabled);
    if (sceneController) motionListeners.add(sceneController.setMotion);
  }).catch(() => {
    // The CSS sculpture remains visible when the optional renderer is unavailable.
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) sceneController?.dispose();
  });
})();
