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

  // Metric panels are generated from the feed; controls only change visibility.
  function initializeComparison() {
    document.querySelectorAll('[data-comparison]').forEach(comparison => {
      const controls = comparison.querySelector('.metric-switch');
      controls.addEventListener('click', event => {
        const button = event.target.closest('button[data-metric]');
        if (!button) return;
        controls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        const previous = [...comparison.querySelectorAll('[data-metric-panel]:not([hidden]) .bar-fill')].map(bar => bar.style.width);
        comparison.querySelectorAll('[data-metric-panel]').forEach(panel => {
          panel.hidden = panel.dataset.metricPanel !== button.dataset.metric;
          if (!panel.hidden && gsap && motionEnabled()) panel.querySelectorAll('.bar-fill').forEach((bar, i) => {
            const width = bar.dataset.targetWidth || bar.style.width;
            bar.dataset.targetWidth = width;
            gsap.fromTo(bar, { width: previous[i] || '0%' }, { width, duration: .55, ease: 'power3.out', overwrite: true });
          });
        });
      });
      controls.hidden = false;
    });
  }

  function setupMotion() {
    if (!gsap || !motionButton) return;
    motionContext?.revert();
    motionContext = undefined;
    ambientTweens = [];
    gsap.getTweensOf('.bar-fill').forEach(tween => tween.progress(1).kill());
    if (!motionEnabled() || !document.querySelector('.hero')) return;
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
    if (!motionButton) return;
    motionButton.setAttribute('aria-pressed', String(!enabled));
    motionButton.disabled = reducedMotion.matches;
    motionButton.innerHTML = reducedMotion.matches
      ? '<span aria-hidden="true">○</span> Motion reduced'
      : enabled ? '<span aria-hidden="true">Ⅱ</span> Pause motion' : '<span aria-hidden="true">▷</span> Resume motion';
    setupMotion();
    motionListeners.forEach(listener => listener(enabled));
  }
  if (motionButton) motionButton.hidden = false;
  motionButton?.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', () => {
    if (gsap) document.hidden ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
  });
  if (document.querySelector('.hero')) new IntersectionObserver(entries => {
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


  function openMaterial(hash) {
    const target = document.getElementById(hash.replace(/^#/, ''));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.querySelector('.mobile-nav');
      if (menu) menu.open = false;
      openMaterial(link.hash);
    });
  });
  window.addEventListener('hashchange', () => openMaterial(location.hash));
  openMaterial(location.hash);
  document.querySelectorAll('.material-details, .archive-details').forEach(details => {
    details.addEventListener('toggle', () => ScrollTrigger?.refresh());
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

  // Keep the decorative flow independent from benchmark controls.
  if (document.querySelector('.scene')) import('./model-flow.js').then(({ createModelFlow }) => {
    sceneController = createModelFlow(document.querySelector('.scene'), motionEnabled);
    if (sceneController) motionListeners.add(sceneController.setMotion);
  }).catch(() => {
    // The CSS sculpture remains visible when the optional renderer is unavailable.
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) sceneController?.dispose();
  });
})();
