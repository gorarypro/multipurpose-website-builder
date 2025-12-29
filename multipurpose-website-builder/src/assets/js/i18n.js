/**
 * FUSION ENGINE v12.0.0 - i18n.js
 * Dynamic Localization Engine
 * -----------------------------------------------------
 * Role: Maps UI keys to sheet-based translations.
 */

window.FusionI18n = (function() {
  
  const state = {
    currentLang: 'en',
    // Source translation from Google Sheet (FUSION_TEXTMAPPING)
    dictionary: window.FUSION_TEXTMAPPING || {}
  };

  /**
   * Boot the engine
   */
  async function init(langCode) {
    state.currentLang = langCode || 'en';
    applyDirection();
    translateAll();
    console.log(`FusionI18n: Active Language [${state.currentLang.toUpperCase()}]`);
  }

  /**
   * Set Document Direction (RTL Support)
   */
  function applyDirection() {
    const isRtl = (state.currentLang === 'ar');
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', state.currentLang);
    
    if (isRtl) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }

  /**
   * Scan DOM for [data-i18n] keys
   */
  function translateAll() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const entry = state.dictionary[key];
      const translation = entry ? entry[state.currentLang] : null;

      if (translation) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.innerHTML = translation;
        }
      }
    });
  }

  /**
   * Functional helper to get a string
   */
  function get(key) {
    const entry = state.dictionary[key];
    return (entry && entry[state.currentLang]) ? entry[state.currentLang] : key;
  }

  return {
    init,
    get,
    translateAll
  };

})();
