// Decorative vocabulary, not measured model output or an architecture diagram.
const TERMS = [
  'inference', 'embeddings', 'reasoning', 'attention', 'transformer', 'tokenizer',
  'context', 'neural network', 'fine-tuning', 'quantization', 'RAG', 'AI agents',
  'multimodal', 'vector search', 'training', 'alignment', 'distillation', 'LoRA',
  'KV cache', 'tool calling', 'prompt', 'tokens', 'weights', 'latent space',
  'LLM', 'deep learning', 'pre-training', 'decoding', 'sampling', 'temperature',
  'retrieval', 'MoE', 'instruct', 'in-context', 'memory', 'evaluation',
  'RLHF', 'DPO', 'backpropagation', 'loss function', 'neural nets', 'GPU inference'
];

export function createModelFlow(host, motionEnabled) {
  const art = document.createElement('div');
  art.className = 'model-flow';
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML = '<div class="mf-beam"></div><div class="mf-space"><div class="mf-stack"></div></div><div class="mf-stream"></div>';
  const stack = art.querySelector('.mf-stack');
  const stream = art.querySelector('.mf-stream');
  const plates = [];
  const inputs = [];
  const outputs = [];
  for (let i = 0; i < 5; i++) {
    const plate = document.createElement('div');
    plate.className = 'mf-plate';
    const scan = document.createElement('div');
    scan.className = 'mf-scan';
    plate.append(scan);
    if (i === 4) {
      const label = document.createElement('span');
      label.className = 'mf-label';
      label.textContent = 'LLM';
      plate.append(label);
    }
    stack.append(plate);
    plates.push({ plate, scan });
  }
  for (let i = 0; i < 9; i++) {
    const token = document.createElement('span');
    token.className = 'mf-binary';
    token.textContent = ['0101', '1100', '0010', '1011', '0110', '1001'][i % 6];
    stream.append(token);
    inputs.push(token);
  }
  for (let i = 0; i < 3; i++) {
    const word = document.createElement('span');
    word.className = 'mf-word';
    stream.append(word);
    outputs.push({ word, term: '', width: 0 });
  }
  const rotateButton = host.querySelector('.rotate-core');
  const hint = host.querySelector('.scene-hint');
  const original = {
    label: host.getAttribute('aria-label'),
    button: rotateButton.innerHTML,
    hint: hint.textContent
  };
  host.append(art);
  host.classList.add('has-model-flow', 'is-ready');
  host.setAttribute('aria-label', 'Dekoracyjny przepływ: kod binarny przechodzi przez szklane warstwy, na wyjściu pojawiają się pojęcia AI i LLM.');
  rotateButton.innerHTML = 'Obróć warstwy <span aria-hidden="true">⤾</span>';
  rotateButton.hidden = false;
  hint.textContent = 'PRZEPŁYW AI / ILUSTRACJA';

  let width = host.clientWidth;
  let height = host.clientHeight;
  let phase = 2.4;
  let previous = 0;
  let frameId = 0;
  let visible = false;
  let disposed = false;
  let orientation = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  function draw() {
    if (disposed || !width || !height) return;
    const compact = width < 440;
    const depth = compact ? 28 : 43;
    // Both sides follow the same three straight lanes through the glass.
    const laneOrigin = compact ? (height < 380 ? .12 : .23) : .365;
    const flowY = (x, lane) => height * (laneOrigin + lane * (compact ? .085 : .073))
      - (x - width * .46) * Math.tan(Math.PI / 18);
    art.querySelector('.mf-beam').style.top = `${flowY(width * .505, 1) + 15}px`;
    stack.style.transform = `rotateX(${-13 + Math.sin(phase * .23) * 3 + pointerY * 5}deg) rotateY(${-30 + orientation + Math.sin(phase * .19) * 5 + pointerX * 9}deg) rotateZ(-13deg)`;
    plates.forEach(({ plate, scan }, i) => {
      plate.style.transform = `translateZ(${(i - 2) * depth}px) translateY(${Math.sin(phase * .7 - i * .6) * 5}px)`;
      scan.style.opacity = .12 + .6 * Math.pow((Math.sin(phase * 1.6 - i * .8) + 1) / 2, 3);
    });
    inputs.forEach((token, i) => {
      const lane = i % 3;
      const progress = (phase / 6 + Math.floor(i / 3) / 3 + lane * .13) % 1;
      const x = width * (.025 + progress * .405);
      const y = flowY(x, lane);
      token.style.transform = `translate3d(${x}px,${y}px,0) rotate(-10deg)`;
      token.style.opacity = Math.min(1, progress * 5, (1 - progress) * 5) * .85;
    });
    outputs.forEach((output, i) => {
      const cycle = phase / 7 + i * .24;
      const progress = cycle % 1;
      const term = TERMS[(Math.floor(cycle) * 3 + i) % TERMS.length];
      if (term !== output.term) {
        output.word.textContent = term;
        output.term = term;
        output.width = output.word.offsetWidth;
      }
      const end = Math.max(0, width - output.width - 8);
      const start = Math.min(width * (compact ? .58 : .48), end);
      const x = start + (end - start) * progress;
      const y = flowY(x, i);
      output.word.style.transform = `translate3d(${x}px,${y}px,0) rotate(-10deg)`;
      output.word.style.opacity = Math.min(1, progress * 5, (1 - progress) * 5);
    });
  }
  function frame(now) {
    if (disposed) return;
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    phase += delta;
    pointerX += (targetX - pointerX) * Math.min(1, delta * 4);
    pointerY += (targetY - pointerY) * Math.min(1, delta * 4);
    draw();
    frameId = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(frameId);
    previous = 0;
    if (disposed) return;
    draw();
    if (motionEnabled() && visible && !document.hidden) frameId = requestAnimationFrame(frame);
  }
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    outputs.forEach(output => { output.width = output.word.offsetWidth; });
    draw();
  }
  function pointerMove(event) {
    if (!motionEnabled() || event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - .5;
    targetY = (event.clientY - rect.top) / rect.height - .5;
  }
  function pointerLeave() { targetX = 0; targetY = 0; }
  function rotate() {
    orientation = orientation === 0 ? 18 : orientation === 18 ? -18 : 0;
    draw();
  }
  const resizer = new ResizeObserver(resize);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: .01 });
  resizer.observe(host);
  observer.observe(host);
  host.addEventListener('pointermove', pointerMove);
  host.addEventListener('pointerleave', pointerLeave);
  rotateButton.addEventListener('click', rotate);
  document.addEventListener('visibilitychange', sync);
  draw();
  sync();

  return {
    setMotion: sync,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizer.disconnect();
      observer.disconnect();
      host.removeEventListener('pointermove', pointerMove);
      host.removeEventListener('pointerleave', pointerLeave);
      rotateButton.removeEventListener('click', rotate);
      document.removeEventListener('visibilitychange', sync);
      art.remove();
      host.classList.remove('has-model-flow', 'is-ready');
      if (original.label === null) host.removeAttribute('aria-label');
      else host.setAttribute('aria-label', original.label);
      rotateButton.innerHTML = original.button;
      rotateButton.hidden = true;
      hint.textContent = original.hint;
    }
  };
}
