(function () {
  const LANGUAGE_STORAGE_KEY = 'copypaste:language';
  const DEFAULT_LANGUAGE = 'en';
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.songs': 'Songs',
      'nav.events': 'Events',
      'nav.library': 'Library',
      'translate.label': 'Translate',
      'translate.select': 'Select language'
    },
    es: {
      'nav.home': 'Inicio',
      'nav.songs': 'Canciones',
      'nav.events': 'Eventos',
      'nav.library': 'Biblioteca',
      'translate.label': 'Traducir',
      'translate.select': 'Seleccionar idioma'
    },
    fr: {
      'nav.home': 'Accueil',
      'nav.songs': 'Chansons',
      'nav.events': 'Événements',
      'nav.library': 'Bibliothèque',
      'translate.label': 'Traduire',
      'translate.select': 'Choisir la langue'
    },
    de: {
      'nav.home': 'Startseite',
      'nav.songs': 'Lieder',
      'nav.events': 'Veranstaltungen',
      'nav.library': 'Bibliothek',
      'translate.label': 'Übersetzen',
      'translate.select': 'Sprache auswählen'
    }
  };

  const languageNames = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  };

  const supportedLanguages = Object.keys(translations);

  const t = (language, key) => {
    const languageMap = translations[language] || translations[DEFAULT_LANGUAGE];
    return languageMap[key] || translations[DEFAULT_LANGUAGE][key] || key;
  };

  const applyLanguage = (language) => {
    document.documentElement.setAttribute('lang', language);

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      element.textContent = t(language, key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.setAttribute('placeholder', t(language, key));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      const key = element.getAttribute('data-i18n-aria');
      element.setAttribute('aria-label', t(language, key));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      const key = element.getAttribute('data-i18n-title');
      element.setAttribute('title', t(language, key));
    });
  };

  const buildLanguageOptions = (select) => {
    if (!select) return;
    select.innerHTML = '';
    supportedLanguages.forEach((language) => {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = languageNames[language] || language;
      select.appendChild(option);
    });
  };

  const loadPreferredLanguage = (select) => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE;
    const language = supportedLanguages.includes(stored) ? stored : DEFAULT_LANGUAGE;
    if (select) {
      select.value = language;
    }
    applyLanguage(language);
  };

  const initLanguageControls = () => {
    const languageSelect = document.querySelector('#languageSelect');
    const translateButton = document.querySelector('[data-translate-button]');
    buildLanguageOptions(languageSelect);
    loadPreferredLanguage(languageSelect);

    if (languageSelect) {
      languageSelect.addEventListener('change', () => {
        const nextLanguage = languageSelect.value || DEFAULT_LANGUAGE;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
        applyLanguage(nextLanguage);
      });
    }

    if (translateButton && languageSelect) {
      translateButton.addEventListener('click', () => {
        languageSelect.focus();
      });
    }
  };

  document.addEventListener('DOMContentLoaded', initLanguageControls);
})();
