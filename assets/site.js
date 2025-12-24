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

  const SITE_FIRST_VISIT_KEY = 'site-first-visit';
  const EVENTS_LAST_VISIT_KEY = 'events-last-visit';

  function ensureSiteFirstVisit(now) {
    const storedFirstVisit = Number(localStorage.getItem(SITE_FIRST_VISIT_KEY));
    if (storedFirstVisit) return storedFirstVisit;

    const legacyFirstVisit = Number(localStorage.getItem('events-first-visit'));
    const firstVisit = legacyFirstVisit || now;
    localStorage.setItem(SITE_FIRST_VISIT_KEY, firstVisit.toString());
    return firstVisit;
  }

  function initEventsNavAlert(now = Date.now()) {
    const alert = document.querySelector('#events-nav .nav-alert');
    const updateDateElement = document.querySelector('#events-update-date');
    if (!alert || !updateDateElement) return;

    const updateDate = updateDateElement.dataset.date;
    const delayHours = Number(updateDateElement.dataset.delayHours || '0');
    if (!updateDate) return;

    const updateTimestamp = Date.parse(updateDate);
    if (Number.isNaN(updateTimestamp)) return;

    const delayMs = Math.max(0, delayHours) * 60 * 60 * 1000;
    const firstVisit = ensureSiteFirstVisit(now);
    const lastEventsVisit = Number(localStorage.getItem(EVENTS_LAST_VISIT_KEY));
    const hasNeverVisitedEvents = !lastEventsVisit;

    const today = new Date(now);
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const hasNewEventsUpdate = updateDate !== todayString && (hasNeverVisitedEvents || lastEventsVisit < updateTimestamp);
    const withinDelayWindow = now - firstVisit < delayMs;

    if (hasNewEventsUpdate && (!withinDelayWindow || hasNeverVisitedEvents)) {
      alert.classList.add('is-visible');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureSiteFirstVisit(Date.now());
    initMobileMenu();
    initEventsNavAlert();
  });
})();
