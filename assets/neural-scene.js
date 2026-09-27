import * as THREE from './vendor/three-0.186.0/three.module.min.js';

export function createNeuralScene(host, motionEnabled) {
  const canvas = host.querySelector('canvas');
  // Check support before constructing the renderer to avoid noisy WebGL errors.
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 50);
  camera.position.set(0, 0, 7.7);
  const sculpture = new THREE.Group();
  sculpture.rotation.set(.2, -.35, -.3);
  scene.add(sculpture);

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = -mvPosition.xyz;
        vPosition = position;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPosition;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 view = normalize(vView);
        float rim = pow(1.0 - abs(dot(n, view)), 2.0);
        float light = pow(max(dot(reflect(-normalize(vec3(-2.0, 3.0, 4.0)), n), view), 0.0), 22.0);
        float stripes = pow(0.5 + 0.5 * sin(vPosition.y * 8.0 + vPosition.x * 3.0 + uTime * 0.15), 12.0);
        float hue = smoothstep(-0.8, 0.9, n.x + vPosition.y * 0.2);
        vec3 tint = mix(vec3(0.20, 1.0, 0.78), vec3(0.63, 0.38, 1.0), hue);
        vec3 color = tint * (0.08 + rim * 1.3 + stripes * 0.13);
        color += vec3(0.8, 1.0, 0.96) * light * 0.85;
        gl_FragColor = vec4(color, 0.96);
      }
    `,
    transparent: true
  });
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.13, .37, 192, 24, 2, 3), material);
  sculpture.add(knot);
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.35, 1), new THREE.MeshBasicMaterial({ color: 0x81ffe3, wireframe: true, transparent: true, opacity: .4 }));
  sculpture.add(inner);
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.85 + i * .12, .007, 6, 160),
      new THREE.MeshBasicMaterial({ color: i === 1 ? 0xbc9bff : 0x7bffe0, transparent: true, opacity: .3 + i * .12 })
    );
    ring.rotation.set(.75 + i * .7, .4 + i * .4, i * .85);
    orbitGroup.add(ring);
    rings.push(ring);
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(.027, 10, 8), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xbc9bff : 0x94ffeb }));
    satellite.position.x = 1.85 + i * .12;
    ring.add(satellite);
  }
  // A deterministic field keeps repeat views visually consistent.
  const positions = [];
  for (let i = 0; i < 70; i++) {
    const angle = i * 2.39996;
    const radius = 1.8 + (i % 13) * .1;
    positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius * .8, Math.sin(i * 1.3) * .8 - 1);
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0x8fa7b9, size: .014, transparent: true, opacity: .7 }));
  scene.add(particles);

  let visible = true;
  let lost = false;
  let disposed = false;
  let lastTime = 0;
  let phase = 0;
  let orientation = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  const rotateButton = host.querySelector('.rotate-core');
  const render = () => {
    if (!lost && !disposed) renderer.render(scene, camera);
  };
  function animate(now) {
    const delta = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
    lastTime = now;
    phase += delta;
    pointerX += (targetX - pointerX) * Math.min(1, delta * 4);
    pointerY += (targetY - pointerY) * Math.min(1, delta * 4);
    sculpture.rotation.y = -.35 + orientation + phase * .10 + pointerX * .5;
    sculpture.rotation.x = .2 + pointerY * .25 + Math.sin(phase * .3) * .05;
    sculpture.position.y = Math.sin(phase * .7) * .045;
    material.uniforms.uTime.value = phase;
    orbitGroup.rotation.y = -phase * .035;
    render();
  }
  function syncLoop() {
    if (disposed || lost) return;
    lastTime = 0;
    const active = motionEnabled() && visible && !document.hidden;
    renderer.setAnimationLoop(active ? animate : null);
    if (!active && visible && !document.hidden) render();
  }
  function resize() {
    if (disposed || lost) return;
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 420 ? 8.8 : 7.7;
    camera.updateProjectionMatrix();
    render();
  }
  function pointerMove(event) {
    if (!motionEnabled() || event.pointerType === 'touch') return;
    const box = host.getBoundingClientRect();
    targetX = (event.clientX - box.left) / box.width - .5;
    targetY = (event.clientY - box.top) / box.height - .5;
  }
  function pointerLeave() { targetX = 0; targetY = 0; }
  function rotate() {
    orientation += Math.PI / 3;
    sculpture.rotation.y += Math.PI / 3;
    render();
  }
  function contextLost(event) {
    event.preventDefault();
    lost = true;
    renderer.setAnimationLoop(null);
    host.classList.remove('is-ready');
    rotateButton.hidden = true;
  }
  function contextRestored() {
    lost = false;
    host.classList.add('is-ready');
    rotateButton.hidden = false;
    resize();
    syncLoop();
  }
  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncLoop();
  }, { threshold: .01 });
  resizeObserver.observe(host);
  intersectionObserver.observe(host);
  host.addEventListener('pointermove', pointerMove);
  host.addEventListener('pointerleave', pointerLeave);
  rotateButton.addEventListener('click', rotate);
  document.addEventListener('visibilitychange', syncLoop);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  resize();
  host.classList.add('is-ready');
  rotateButton.hidden = false;
  host.querySelector('.scene-hint').textContent = 'MOVE TO EXPLORE';
  syncLoop();

  return {
    setMotion: syncLoop,
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener('pointermove', pointerMove);
      host.removeEventListener('pointerleave', pointerLeave);
      rotateButton.removeEventListener('click', rotate);
      document.removeEventListener('visibilitychange', syncLoop);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      scene.traverse(object => {
        object.geometry?.dispose();
        if (object.material) object.material.dispose();
      });
      renderer.dispose();
    }
  };
}
