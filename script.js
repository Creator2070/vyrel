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

/* ===== 3D Food-Morph Globe (Three.js) ===== */
(function initFoodMorph() {
  const canvas = document.getElementById('earthCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.4, 7.4);

  /* ---- Mouse-drag camera orbit ---- */
  const camTarget = new THREE.Vector3(0, 0.5, 0);
  const camRadius = camera.position.distanceTo(camTarget);
  let camTheta = Math.atan2(camera.position.x - camTarget.x, camera.position.z - camTarget.z);
  let camPhi = Math.acos((camera.position.y - camTarget.y) / camRadius);

  function updateCameraPosition() {
    const sinPhi = Math.sin(camPhi);
    camera.position.x = camTarget.x + camRadius * sinPhi * Math.sin(camTheta);
    camera.position.y = camTarget.y + camRadius * Math.cos(camPhi);
    camera.position.z = camTarget.z + camRadius * sinPhi * Math.cos(camTheta);
    camera.lookAt(camTarget);
  }
  updateCameraPosition();

  let dragging = false, lastX = 0, lastY = 0;
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    camTheta -= dx * 0.005;
    camPhi = Math.max(0.5, Math.min(Math.PI - 0.5, camPhi - dy * 0.005));
    updateCameraPosition();
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  scene.add(new THREE.AmbientLight(0xfff1e0, 0.9));
  const keyLight = new THREE.DirectionalLight(0xffd9a0, 1.4);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xff7a3c, 0.6);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  // Master group: centered on screen so the morphing food shape sits
  // in the middle of the viewport, just clear of the headline below it.
  const stage = new THREE.Group();
  stage.position.y = 1.3;
  scene.add(stage);

  /* ---- Food shapes ---- */
  const FOOD_SCALE = 1.4 * 0.7;
  function makeFood(builder) {
    const g = new THREE.Group();
    builder(g);
    g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0; } });
    g.scale.setScalar(0.001);
    stage.add(g);
    return g;
  }

  const foods = {
    donut: makeFood(g => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.55, 24, 48), new THREE.MeshStandardMaterial({ color: 0xc97a4a, roughness: 0.6 }));
      g.add(m);
      // Glaze sits flush on the same ring as the dough, just slightly larger
      // and pulled forward — no extra rotation, so it doesn't read as a second donut.
      const glaze = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.57, 16, 48), new THREE.MeshStandardMaterial({ color: 0xff6f9c, roughness: 0.3 }));
      glaze.position.z = 0.06;
      g.add(glaze);
      // Sprinkles scattered across the glaze's front-facing surface
      const sprinkleColors = [0xfff2c2, 0x7fd3e8, 0x9be564, 0xffffff, 0xffd23f];
      const R = 1.1, r = 0.6;
      for (let i = 0; i < 36; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = 0.3 + Math.random() * 2.5;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        const sprinkle = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.025, 0.1, 4, 8),
          new THREE.MeshStandardMaterial({ color: sprinkleColors[i % sprinkleColors.length], roughness: 0.5 })
        );
        sprinkle.position.set(x, y, z);
        sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        g.add(sprinkle);
      }
    }),
    burger: makeFood(g => {
      const bunTop = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd99a4e, roughness: 0.7 }));
      bunTop.position.y = 0.55;
      g.add(bunTop);
      const lettuce = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0x6fae3f, roughness: 0.8 }));
      lettuce.position.y = 0.32;
      g.add(lettuce);
      const patty = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.34, 24), new THREE.MeshStandardMaterial({ color: 0x5a3420, roughness: 0.9 }));
      patty.position.y = 0.05;
      g.add(patty);
      const cheese = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 2.1), new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.5 }));
      cheese.rotation.y = Math.PI / 4;
      cheese.position.y = 0.22;
      g.add(cheese);
      const bunBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.0, 0.4, 24), new THREE.MeshStandardMaterial({ color: 0xcf8d44, roughness: 0.7 }));
      bunBottom.position.y = -0.32;
      g.add(bunBottom);
    }),
    curry: makeFood(g => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.12, 48), new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: 0.4 }));
      g.add(plate);
      const rice = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.28, 16, 32), new THREE.MeshStandardMaterial({ color: 0xf3e6b8, roughness: 0.8 }));
      rice.rotation.x = Math.PI / 2;
      rice.position.y = 0.1;
      g.add(rice);
      const curry = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd9722b, roughness: 0.6 }));
      curry.position.y = 0.12;
      g.add(curry);
    }),
    pizza: makeFood(g => {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.16, 48), new THREE.MeshStandardMaterial({ color: 0xe8b563, roughness: 0.7 }));
      g.add(base);
      const sauce = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 0.04, 48), new THREE.MeshStandardMaterial({ color: 0xb5402a, roughness: 0.6 }));
      sauce.position.y = 0.1;
      g.add(sauce);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const topping = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: 0xb5402a, roughness: 0.5 }));
        topping.position.set(Math.cos(a) * 0.9, 0.18, Math.sin(a) * 0.9);
        g.add(topping);
      }
    }),
    salad: makeFood(g => {
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xfaf3e6, roughness: 0.5, side: THREE.DoubleSide }));
      bowl.rotation.x = Math.PI;
      bowl.position.y = -0.2;
      g.add(bowl);
      for (let i = 0; i < 14; i++) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x7fb24a : 0xe0594a, roughness: 0.7 }));
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.85;
        leaf.position.set(Math.cos(a) * r, Math.random() * 0.3, Math.sin(a) * r);
        g.add(leaf);
      }
    }),
    sushi: makeFood(g => {
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * 0.62;
        const rice = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 24), new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.7 }));
        rice.position.set(x, 0, 0);
        g.add(rice);
        const nori = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0x2c2f1f, roughness: 0.6 }));
        nori.position.set(x, 0.24, 0);
        g.add(nori);
        const topping = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xe8633f : 0xf4a93c, roughness: 0.5 }));
        topping.position.set(x, 0.34, 0);
        g.add(topping);
      }
    }),
    soup: makeFood(g => {
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe7e1d4, roughness: 0.5, side: THREE.DoubleSide }));
      bowl.rotation.x = Math.PI;
      bowl.position.y = -0.25;
      g.add(bowl);
      const broth = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.06, 40), new THREE.MeshStandardMaterial({ color: 0xd9852f, roughness: 0.3 }));
      broth.position.y = -0.05;
      g.add(broth);
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.7;
        const garnish = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 16), new THREE.MeshStandardMaterial({ color: 0x6fae3f, roughness: 0.7 }));
        garnish.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        garnish.rotation.x = Math.PI / 2;
        g.add(garnish);
      }
    })
  };

  const order = ['donut', 'burger', 'curry', 'pizza', 'salad', 'sushi', 'soup', 'burger'];
  let idx = 0;
  let phase = 0; // 0..1 within current hold+transition cycle
  const HOLD = 1.6;
  const TRANSITION = 1.1;
  const CYCLE = HOLD + TRANSITION;

  function setFoodState(name, opacity, scale) {
    const g = foods[name];
    g.scale.setScalar(Math.max(scale, 0.001) * FOOD_SCALE);
    g.traverse(o => { if (o.isMesh) o.material.opacity = opacity; });
  }

  Object.keys(foods).forEach(k => setFoodState(k, 0, 0.001));
  setFoodState(order[0], 1, 1);

  const clock = new THREE.Clock();
  let cycleT = 0;

  let rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    cycleT += dt;

    const currentName = order[idx];
    const nextName = order[(idx + 1) % order.length];

    if (cycleT < HOLD) {
      setFoodState(currentName, 1, 1);
      foods[currentName].rotation.y += dt * 0.4;
    } else {
      const t = Math.min((cycleT - HOLD) / TRANSITION, 1);
      const ease = t * t * (3 - 2 * t);
      setFoodState(currentName, 1 - ease, 1 - ease * 0.85);
      setFoodState(nextName, ease, 0.15 + ease * 0.85);
      foods[currentName].rotation.y += dt * 0.4;
      foods[nextName].rotation.y += dt * 0.4;
      if (t >= 1) {
        cycleT = 0;
        idx = (idx + 1) % order.length;
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  window.__stopEarth = () => { if (rafId) cancelAnimationFrame(rafId); };
  window.__camera = camera;
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
}, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  if (!el.style.getPropertyValue('--d')) {
    el.style.setProperty('--d', `${(i % 5) * 0.08}s`);
  }
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    el.classList.add('in-view');
  } else {
    revealObserver.observe(el);
  }
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
