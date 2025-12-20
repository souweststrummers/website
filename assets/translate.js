(function () {
  const STORAGE_KEY = 'sws-language';
  const DEFAULT_LANGUAGE = 'en';
  const TRANSLATE_ENDPOINT = 'https://libretranslate.com/translate';
  const API_KEY = '';
  const EXCLUDED_TAGS = new Set(['CODE', 'IFRAME', 'NOSCRIPT', 'PRE', 'SCRIPT', 'STYLE', 'SVG']);
  const TEXT_NODES = [];

  const getStoredLanguage = () => localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  const setStoredLanguage = (language) => localStorage.setItem(STORAGE_KEY, language);

  const collectTextNodes = (root) => {
    if (TEXT_NODES.length) return TEXT_NODES;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        if (EXCLUDED_TAGS.has(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest('[data-translate-skip]')) return NodeFilter.FILTER_REJECT;
        if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.__originalText) {
        node.__originalText = node.textContent;
      }
      TEXT_NODES.push(node);
    }

    return TEXT_NODES;
  };

  const setHtmlLanguage = (language) => {
    document.documentElement.setAttribute('lang', language);
  };

  const getTranslationPayload = (texts, targetLanguage) => {
    const payload = {
      q: texts,
      source: DEFAULT_LANGUAGE,
      target: targetLanguage,
      format: 'text'
    };

    if (API_KEY) {
      payload.api_key = API_KEY;
    }

    return payload;
  };

  const fetchTranslations = async (texts, targetLanguage) => {
    const response = await fetch(TRANSLATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getTranslationPayload(texts, targetLanguage))
    });

    if (!response.ok) {
      throw new Error('Translation service unavailable.');
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data.map((item) => item.translatedText || item);
    }

    if (Array.isArray(data.translatedText)) {
      return data.translatedText;
    }

    if (typeof data.translatedText === 'string') {
      return [data.translatedText];
    }

    return texts;
  };

  const translateNodes = async (nodes, targetLanguage) => {
    const chunkSize = 20;
    const originals = nodes.map((node) => node.__originalText || node.textContent);

    for (let i = 0; i < originals.length; i += chunkSize) {
      const chunk = originals.slice(i, i + chunkSize);
      const translatedChunk = await fetchTranslations(chunk, targetLanguage);

      translatedChunk.forEach((translatedText, index) => {
        const node = nodes[i + index];
        if (!node) return;
        node.textContent = translatedText;
      });
    }
  };

  const restoreOriginalText = (nodes) => {
    nodes.forEach((node) => {
      if (node.__originalText) {
        node.textContent = node.__originalText;
      }
    });
  };

  const applyLanguage = async (language) => {
    const nodes = collectTextNodes(document.body);
    setHtmlLanguage(language);

    if (language === DEFAULT_LANGUAGE) {
      restoreOriginalText(nodes);
      return;
    }

    try {
      await translateNodes(nodes, language);
    } catch (error) {
      console.error(error);
    }
  };

  const initTranslationControls = () => {
    const languageSelect = document.querySelector('#language-select');
    const translateButton = document.querySelector('[data-translate-button]');

    const currentLanguage = getStoredLanguage();
    if (languageSelect) {
      languageSelect.value = currentLanguage;
      languageSelect.addEventListener('change', () => {
        const nextLanguage = languageSelect.value || DEFAULT_LANGUAGE;
        setStoredLanguage(nextLanguage);
        applyLanguage(nextLanguage);
      });
    }

    if (translateButton && languageSelect) {
      translateButton.addEventListener('click', () => {
        languageSelect.focus();
      });
    }

    applyLanguage(currentLanguage);
  };

  document.addEventListener('DOMContentLoaded', initTranslationControls);
})();
