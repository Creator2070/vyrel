document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Intro stars (DOM) ===== */
const starField = document.getElementById('introStars');
const starCount = 90;
for (let i = 0; i < starCount; i++) {
  const s = document.createElement('span');
  s.style.left = `${Math.random() * 100}%`;
  s.style.top = `${Math.random() * 100}%`;
  s.style.animationDelay = `${Math.random() * 3}s`;
  s.style.width = s.style.height = `${1 + Math.random() * 1.5}px`;
  starField.appendChild(s);
}

/* ===== 3D Earth (Three.js) ===== */
(function initEarth() {
  const canvas = document.getElementById('earthCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.3, 6.2);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // Wireframe globe
  const radius = 2;
  const wireGeo = new THREE.IcosahedronGeometry(radius, 3);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x2fd6e0, wireframe: true, transparent: true, opacity: 0.18 });
  group.add(new THREE.Mesh(wireGeo, wireMat));

  // Solid faint core
  const coreGeo = new THREE.SphereGeometry(radius * 0.985, 64, 64);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x060814, transparent: true, opacity: 0.85 });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  // Network dots (random points on sphere surface)
  const dotCount = 160;
  const dotPositions = new Float32Array(dotCount * 3);
  const dotPoints = [];
  for (let i = 0; i < dotCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const r = radius * 1.01;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    dotPositions[i * 3] = x;
    dotPositions[i * 3 + 1] = y;
    dotPositions[i * 3 + 2] = z;
    dotPoints.push(new THREE.Vector3(x, y, z));
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
  const dotMat = new THREE.PointsMaterial({ color: 0x6fe9ef, size: 0.045, transparent: true, opacity: 0.95 });
  group.add(new THREE.Points(dotGeo, dotMat));

  // Connection lines between nearby points
  const linePositions = [];
  for (let i = 0; i < dotPoints.length; i++) {
    let connected = 0;
    for (let j = i + 1; j < dotPoints.length && connected < 2; j++) {
      if (dotPoints[i].distanceTo(dotPoints[j]) < 0.9) {
        linePositions.push(dotPoints[i].x, dotPoints[i].y, dotPoints[i].z);
        linePositions.push(dotPoints[j].x, dotPoints[j].y, dotPoints[j].z);
        connected++;
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x2fd6e0, transparent: true, opacity: 0.25 });
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  // Outer glow ring
  const glowGeo = new THREE.SphereGeometry(radius * 1.18, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x3b6cff, transparent: true, opacity: 0.06 });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  // Background particles (stars in 3D space)
  const starGeo = new THREE.BufferGeometry();
  const starCount3D = 600;
  const starPos = new Float32Array(starCount3D * 3);
  for (let i = 0; i < starCount3D; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 40;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(starGeo, starMat));

  let rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    group.rotation.y += 0.0022;
    group.rotation.x = Math.sin(Date.now() * 0.0001) * 0.05;
    renderer.render(scene, camera);
  }
  animate();

  window.__stopEarth = () => { if (rafId) cancelAnimationFrame(rafId); };
})();

/* ===== Intro -> Site transition ===== */
const intro = document.getElementById('intro');
const site = document.getElementById('site');
const enterBtn = document.getElementById('enterBtn');

document.body.style.overflow = 'hidden';

enterBtn.addEventListener('click', () => {
  intro.classList.add('hidden');
  site.classList.add('visible');
  document.body.style.overflow = '';
  if (window.__stopEarth) setTimeout(window.__stopEarth, 1100);
  setTimeout(() => { intro.style.display = 'none'; }, 1100);
});

/* ===== Nav toggle ===== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ===== Contact form ===== */
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  note.textContent = 'Danke! Ich melde mich innerhalb von 24 Stunden bei dir.';
  form.reset();
});

/* ===== Scroll reveal ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  if (!el.style.getPropertyValue('--d')) {
    el.style.setProperty('--d', `${(i % 5) * 0.08}s`);
  }
  revealObserver.observe(el);
});

/* ===== Parallax background glows ===== */
const glow1 = document.querySelector('.bg-glow-1');
const glow2 = document.querySelector('.bg-glow-2');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (glow1) glow1.style.transform = `translateY(${y * 0.08}px)`;
  if (glow2) glow2.style.transform = `translateY(${-y * 0.06}px)`;
}, { passive: true });

/* ===== Header background on scroll ===== */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 40 ? 'rgba(6,8,13,0.92)' : 'rgba(6,8,13,0.7)';
}, { passive: true });
