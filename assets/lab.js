(() => {
  // Keep contact details readable without JavaScript; enable mail links locally.
  document.querySelectorAll('a[data-email]').forEach(link => {
    const address = [link.dataset.user, link.dataset.domain].join('@');
    link.href = `mailto:${address}`;
    link.textContent = address;
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('.motion-toggle');
  const motionListeners = new Set();
  let userPaused = false;
  try { userPaused = localStorage.getItem('lab-motion-paused') === 'true'; } catch (_) { /* Storage may be unavailable. */ }
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
            y: 36, duration: .9, ease: 'power3.out', clearProps: 'transform',
            scrollTrigger: { trigger: element, start: 'top 92%', once: true }
          });
        });
        gsap.to('.scene-grid', { y: 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      }
      if (finePointer.matches) ambientTweens.push(gsap.to('.telemetry-hardware', { y: -9, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: !heroVisible }));
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
  motionButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('lab-motion-paused', String(userPaused)); } catch (_) { /* Keep the session control working. */ }
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);
  finePointer.addEventListener('change', setupMotion);
  document.addEventListener('visibilitychange', () => {
    if (gsap) document.hidden ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
  });
  if (document.querySelector('.hero')) new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    ambientTweens.forEach(tween => tween.paused(!heroVisible));
  }).observe(document.querySelector('.hero'));
  updateMotion();
  // Preserve the full evidence table when JavaScript is unavailable.
  document.querySelectorAll('[data-model-toggle]').forEach(button => {
    const table = document.getElementById(button.getAttribute('aria-controls'));
    const rows = table.querySelectorAll('tbody tr:not(.result-separated)');
    const setExpanded = expanded => {
      rows.forEach(row => { row.hidden = !expanded; });
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Show fewer models ▾' : `Show all ${button.dataset.modelCount} models ▸`;
    };
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
    setExpanded(false);
    button.hidden = false;
  });

  initializeComparison();

  // Only visible decorations consume animation work; hidden tabs stay static.
  document.querySelectorAll('[data-fx]').forEach(card => card.classList.add(...card.dataset.fx.split(' ')));
  // Separate opacity layer keeps the shadow static and outside the border mask.
  document.querySelectorAll('.ep.fx-border, .fx-glass').forEach(card => {
    const glow = document.createElement('span');
    glow.className = 'fx-glow';
    glow.setAttribute('aria-hidden', 'true');
    card.append(glow);
  });
  // A single centre-band owner replaces hover on touch devices.
  const touchCards = [...document.querySelectorAll('.ep.fx-border')];
  const centreCandidates = new Set();
  function selectCentreCard() {
    const active = finePointer.matches ? null : [...centreCandidates].sort((a, b) => {
      const distance = el => { const r = el.getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - innerHeight / 2); };
      return distance(a) - distance(b);
    })[0];
    touchCards.forEach(card => card.classList.toggle('fx-engaged', card === active));
  }
  const centreObserver = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => isIntersecting ? centreCandidates.add(target) : centreCandidates.delete(target));
    selectCentreCard();
  }, {rootMargin: '-40% 0px -40% 0px'});
  touchCards.forEach(card => centreObserver.observe(card));
  finePointer.addEventListener('change', selectCentreCard);
  let centreFrame = 0;
  window.addEventListener('scroll', () => {
    if (finePointer.matches || centreFrame) return;
    centreFrame = requestAnimationFrame(() => { centreFrame = 0; selectCentreCard(); });
  }, {passive: true});
  const effectCards = document.querySelectorAll('.fx-comet, .fx-glass, .fx-pulse, .fx-aurora');
  const effectObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => target.classList.toggle('fx-visible', isIntersecting));
  });
  effectCards.forEach(card => effectObserver.observe(card));
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('fx-hidden', document.hidden);
  });

  document.querySelectorAll('.spotlight, .run .shot').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
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


  const mobileMenu = document.querySelector('.mobile-nav');
  function dismissMobileMenu() {
    if (!mobileMenu?.open) return;
    mobileMenu.open = false;
    mobileMenu.querySelector('summary').focus({ preventScroll: true });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu?.open) {
      event.preventDefault();
      dismissMobileMenu();
    }
  });
  document.addEventListener('click', event => {
    if (mobileMenu?.open && !mobileMenu.contains(event.target)) {
      event.preventDefault();
      dismissMobileMenu();
    }
  }, true);

  function openMaterial(hash) {
    const target = document.getElementById(hash.replace(/^#/, ''));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      dismissMobileMenu();
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
