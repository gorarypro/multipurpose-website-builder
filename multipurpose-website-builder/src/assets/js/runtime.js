/**
 * Core runtime engine.
 * JSONP-based (no CORS issues) and DOM binding for settings.
 *
 * NOTE: Set BASE_SCRIPT_URL to your deployed Apps Script web app URL.
 */
const BASE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyzCNs3LoUus8PpPCz8Zko-7PWN0-ivzTTLvXwxDs47wAyDi2w8NVJv_PrJqq3kFRGyA/exec';

window.Runtime = {
  settings: null,
  textMap: null,
  products: [],

  init: async function () {
    try {
      // 1) Load data from Apps Script (via JSONP)
      await this.loadSettings();
      await this.loadTextMap();
      await this.loadProducts();

      // 2) Initialize i18n & components
      if (typeof I18n !== 'undefined') {
        I18n.init(this.textMap, this.settings);
      }
      if (typeof Products !== 'undefined') {
        Products.renderGrid(this.products, this.settings);
      }
      if (typeof Cart !== 'undefined') {
        Cart.init();
      }
      if (typeof Wishlist !== 'undefined') {
        Wishlist.init();
      }
      if (typeof Popup !== 'undefined') {
        Popup.init(this.settings);
      }
      if (typeof LazyLoad !== 'undefined') {
        LazyLoad.init();
      }
      if (typeof Analytics !== 'undefined') {
        Analytics.init(this.settings);
      }
      if (typeof SEO !== 'undefined') {
        SEO.applyBasic(this.settings);
      }

      // 3) Apply SETTINGS into HTML placeholders
      this.applySettingsToDOM();

      // 4) Optional event for extra hooks
      document.dispatchEvent(new Event('runtime_ready'));

    } catch (err) {
      console.error('Runtime init error', err);
    }
  },

  /**
   * JSONP fetch to bypass CORS.
   * Calls GAS with ?action=...&callback=Runtime.__jsonp_cb_XYZ
   */
  fetchJson: function (action, extraParams) {
    return new Promise((resolve, reject) => {
      // Unique callback name on the Runtime object
      const cbName = '__jsonp_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const callbackFullName = 'Runtime.' + cbName;

      const params = new URLSearchParams(
        Object.assign(
          { action: action, callback: callbackFullName },
          extraParams || {}
        )
      );

      const url = BASE_SCRIPT_URL + '?' + params.toString();

      // Define the callback that GAS will call
      window.Runtime[cbName] = function (data) {
        try {
          resolve(data);
        } finally {
          cleanup();
        }
      };

      function cleanup() {
        try {
          delete window.Runtime[cbName];
        } catch (e) { /* ignore */ }
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onerror = function () {
        cleanup();
        reject(new Error('JSONP request failed: ' + url));
      };

      document.body.appendChild(script);
    });
  },

  loadSettings: async function () {
    const res = await this.fetchJson('getSettings');
    this.settings = (res && res.settings) ? res.settings : {};
  },

  loadTextMap: async function () {
    const res = await this.fetchJson('getTextMap');
    this.textMap = (res && res.map) ? res.map : {};
  },

  loadProducts: async function () {
    const res = await this.fetchJson('getProducts');
    this.products = (res && res.items) ? res.items : [];
  },

  saveEntry: async function (entry) {
    const res = await this.fetchJson('saveEntry', {
      entry: JSON.stringify(entry)
    });
    return res;
  },

  /**
   * Apply settings into DOM using data-setting attributes.
   *
   * Example HTML:
   *   <span data-setting="contact_phone"></span>
   *   <span data-setting="contact_email"></span>
   *   <span data-setting="contact_whatsapp"></span>
   *   <span data-setting="site_title"></span>
   *   <span data-setting="currency_symbol"></span>
   */
  applySettingsToDOM: function () {
    const s = this.settings || {};

    function setText(selector, value) {
      document.querySelectorAll(selector).forEach(el => {
        el.textContent = (value != null) ? String(value) : '';
      });
    }

    // Contact info
    setText('[data-setting="contact_phone"]', s.contact_phone || '');
    setText('[data-setting="contact_email"]', s.contact_email || '');
    setText('[data-setting="contact_whatsapp"]', s.contact_whatsapp || s.contact_whatsapp || '');

    // Site title
    setText('[data-setting="site_title"]', s.site_title || 'My Website');

    // Currency symbol
    setText('[data-setting="currency_symbol"]', s.currency_symbol || '$');
  }
};

document.addEventListener('DOMContentLoaded', function () {
  if (typeof window.Runtime !== 'undefined') {
    window.Runtime.init();
  }
});
