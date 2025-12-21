(function() {
  const STORAGE_KEY = 'sws-font-size';
  const SIZES = new Set(['small', 'medium', 'large']);
  const DEFAULT_SIZE = 'small';

  function getStoredSize() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SIZES.has(stored) ? stored : DEFAULT_SIZE;
  }

  function applySize(size) {
    const html = document.documentElement;
    const sizeMap = {
      small: '100%',
      medium: '112.5%',
      large: '125%',
    };
    html.setAttribute('data-font-size', size);
    html.style.fontSize = sizeMap[size] || sizeMap[DEFAULT_SIZE];
  }

  applySize(getStoredSize());

  function initControls() {
    const buttons = Array.from(document.querySelectorAll('[data-font-size-option]'));
    if (!buttons.length) return;

    const updateActive = (size) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.fontSizeOption === size;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    };

    const initial = getStoredSize();
    updateActive(initial);

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const size = button.dataset.fontSizeOption;
        if (!SIZES.has(size)) return;
        localStorage.setItem(STORAGE_KEY, size);
        applySize(size);
        updateActive(size);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initControls);
})();
