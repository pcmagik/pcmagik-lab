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

  // Animation failures must not affect the measured range explorer.
  async function initializeComparison() {
    const controls = document.querySelector('.metric-switch');
    try {
      const response = await fetch('assets/homepage-benchmarks.json');
      if (!response.ok) return;
      const data = await response.json();
      const cohorts = ['bare', 'karpathy'].map(variant => data.cohorts?.[variant]);
      const keys = ['seconds', 'output_tokens', 'tok_s', 'effects'];
      if (cohorts.some(cohort => cohort?.n !== 5 || cohort.runs?.length !== 5 || cohort.runs.some(run => keys.some(key => !Number.isFinite(run[key]) || run[key] <= 0)))) return;
      const metrics = {
        effects: { key: 'effects', unit: 'effects', format: value => String(value), caveat: 'Effects counts CSS/JS constructs in the code, not visual quality. You judge the appearance.' },
        time: { key: 'seconds', unit: 's', format: value => String(Math.round(value)), caveat: 'Minimum–maximum across five runs per variant, rounded to the nearest second. This open-ended task does not compare the cost of equivalent work.' },
        tokens: { key: 'output_tokens', unit: 'output tokens', format: value => value.toLocaleString('en-US'), caveat: 'output = thinking + final code. The model chooses the scope of this open-ended task; fewer output tokens do not establish equivalent-work savings.' },
        throughput: { key: 'tok_s', unit: 'tok/s', format: value => value.toFixed(2), caveat: 'Output tokens divided by run time. Compare ranges within this model; requested reasoning effort is not comparable across models.' }
      };
      function selectMetric(key) {
        const metric = metrics[key];
        const values = cohorts.map(cohort => cohort.runs.map(run => run[metric.key]));
        const ranges = values.map(runs => [Math.min(...runs), Math.max(...runs)]);
        const maximum = Math.max(...ranges.map(range => range[1]));
        const overlap = Math.max(...ranges.map(range => range[0])) <= Math.min(...ranges.map(range => range[1]));
        controls.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.metric === key)));
        document.querySelectorAll('.compare-value').forEach((element, i) => {
          element.replaceChildren(document.createTextNode(`${metric.format(ranges[i][0])}–${metric.format(ranges[i][1])} `));
          const unit = document.createElement('small');
          unit.textContent = metric.unit;
          element.append(unit);
        });
        document.querySelectorAll('.bar-fill').forEach((bar, i) => {
          const left = `${ranges[i][0] / maximum * 100}%`;
          const width = `${(ranges[i][1] - ranges[i][0]) / maximum * 100}%`;
          if (gsap && motionEnabled()) gsap.to(bar, { left, width, duration: .55, ease: 'power3.out', overwrite: true });
          else { gsap?.killTweensOf(bar); Object.assign(bar.style, { left, width }); }
        });
        let summary = `On Qwen3.8 27B, the ${key === 'tokens' ? 'output-token' : key === 'time' ? 'time' : 'tok/s'} ranges overlap. No clear difference across five runs per variant.`;
        if (key === 'effects') {
          const mean = runs => runs.reduce((sum, value) => sum + value, 0) / runs.length;
          const reduction = Math.round((1 - mean(values[1]) / mean(values[0])) * 100);
          summary = !overlap && ranges[1][1] < ranges[0][0]
            ? `On Qwen3.8 27B, Karpathy has ${reduction}% fewer counted effects on average. Every Karpathy run is below every bare run; the ranges do not overlap.`
            : 'On Qwen3.8 27B, the effect-count ranges overlap. No clear difference across five runs per variant.';
        } else if (!overlap) {
          summary = `On Qwen3.8 27B, the measured ${metric.unit} ranges do not overlap. Inspect all five runs per variant below.`;
        }
        document.querySelector('.compare-summary').textContent = summary;
        document.querySelector('.metric-caveat').textContent = metric.caveat;
      }
      controls.addEventListener('click', event => {
        const button = event.target.closest('button[data-metric]');
        if (button) selectMetric(button.dataset.metric);
      });
      controls.hidden = false;
      selectMetric('effects');
    } catch {
      // The verified static five-run comparison and all materials stay readable.
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


  function openMaterial(hash) {
    const target = document.getElementById(hash.replace(/^#/, ''));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.mobile-nav').open = false;
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
