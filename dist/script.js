const body = document.body;
const progressBar = document.querySelector('.progress__bar');
const menuButton = document.querySelector('.toc-toggle');
const scrim = document.querySelector('.toc-scrim');
const tocLinks = [...document.querySelectorAll('.toc a')];
const sections = [...document.querySelectorAll('[data-section]')];
const fontButton = document.querySelector('[data-font]');
const shareButtons = [...document.querySelectorAll('[data-share]')];
const topButton = document.querySelector('[data-top]');

function updateProgress() {
  const top = window.scrollY;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${available > 0 ? Math.min(100, (top / available) * 100) : 0}%`;
}

function toggleMenu(force) {
  const next = typeof force === 'boolean' ? force : !body.classList.contains('menu-open');
  body.classList.toggle('menu-open', next);
  menuButton.setAttribute('aria-expanded', String(next));
}

menuButton.addEventListener('click', () => toggleMenu());
scrim.addEventListener('click', () => toggleMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') toggleMenu(false);
});

tocLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

const activeObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  tocLinks.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
  });
}, { rootMargin: '-18% 0px -64% 0px', threshold: [0, .05, .2] });

sections.forEach(section => activeObserver.observe(section));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

const sizes = [17, 19, 21];
let fontIndex = Number(localStorage.getItem('wc-font-index') || 1);

function applyFontSize() {
  fontIndex = (fontIndex + sizes.length) % sizes.length;
  document.documentElement.style.setProperty('--reading-size', `${sizes[fontIndex]}px`);
  fontButton.textContent = sizes[fontIndex] === 17 ? '小字' : sizes[fontIndex] === 19 ? '中字' : '大字';
  localStorage.setItem('wc-font-index', String(fontIndex));
}

applyFontSize();
fontButton.addEventListener('click', () => { fontIndex += 1; applyFontSize(); });
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

async function sharePage(event) {
  const shareButton = event.currentTarget;
  const payload = {
    title: '诸神黄昏，王冠新生｜2026美加墨世界杯长文',
    text: '写给2026美加墨世界杯，也写给那些在盛夏里告别与重生的人。',
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(payload);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      const original = shareButton.textContent;
      shareButton.textContent = '链接已复制';
      setTimeout(() => { shareButton.textContent = original; }, 1800);
    }
  } catch (error) {
    if (error.name !== 'AbortError') window.prompt('复制链接分享：', window.location.href);
  }
}

shareButtons.forEach(button => button.addEventListener('click', sharePage));

window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();