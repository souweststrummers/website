(function() {
  function initMobileMenu() {
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    if (!menuIcon || !navLinks) return;

    const setState = (open) => {
      navLinks.classList.toggle('active', open);
      menuIcon.setAttribute('aria-expanded', String(open));
      menuIcon.innerHTML = open ? '&#10005;' : '&#9776;';
    };

    setState(false);

    menuIcon.addEventListener('click', (event) => {
      event.stopPropagation();
      setState(!navLinks.classList.contains('active'));
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('active')) return;
      if (event.target.closest('.nav-links') || event.target.closest('.menu-icon')) return;
      setState(false);
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        setState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 600) {
        setState(false);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initMobileMenu);
})();
