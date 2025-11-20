/**
 * Simple text mapping + RTL helper
 */
window.I18n = {
  map: {},
  settings: {},
  activeLang: 'default',
  init(map, settings) {
    this.map = map || {};
    this.settings = settings || {};
    this.activeLang = settings.default_language || 'en';
    this.applyDir();
    this.replaceText();
  },
  t(key) {
    const entry = this.map[key];
    if (!entry) return key;
    return entry[this.activeLang] || entry.default || key;
  },
  applyDir() {
    const rtlLangs = ['ar', 'he', 'fa', 'ur'];
    const dir = rtlLangs.includes(this.activeLang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  },
  replaceText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
  }
};
