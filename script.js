document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  note.textContent = 'Danke! Wir melden uns innerhalb von 24 Stunden bei Ihnen.';
  form.reset();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 0.08}s`;
  revealObserver.observe(el);
});

const heroImg = document.getElementById('heroImg');
window.addEventListener('scroll', () => {
  const offset = window.scrollY;
  if (heroImg && offset < window.innerHeight) {
    heroImg.style.transform = `scale(1.08) translateY(${offset * 0.15}px)`;
  }
}, { passive: true });
