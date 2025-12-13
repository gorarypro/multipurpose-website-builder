/**
 * Core runtime engine for Multipurpose Website Builder
 * ----------------------------------------------------
 * - Loads settings, text map, and products from Apps Script via JSONP
 * - Initializes i18n, products grid, cart, wishlist, popup, etc.
 * - Applies settings to DOM using [data-setting="..."]
 * - Dispatches `runtime_ready` event when everything is loaded
 * * NOTE: BASE_SCRIPT_URL is now expected to be injected globally before this script runs.
 */

// Global variable defined in ThemeTemplate.html is used here.
window.BASE_SCRIPT_URL = window.BASE_SCRIPT_URL || ''; 

window.Runtime = {
  settings: null,
  textMap: null,
  products: [],

  /**
   * Main entry point.
   */
  init: async function () {
    try {
      if (!window.BASE_SCRIPT_URL) {
          console.error("Runtime init error: BASE_SCRIPT_URL not defined.");
          return;
      }
      
      // 1) Load data from Apps Script (via JSONP)
      await this.loadSettings();
      await this.loadTextMap();
      await this.loadProducts();

      // 2) Initialize modules
      if (typeof I18n !== "undefined") {
        I18n.init(this.textMap, this.settings);
      }
      if (typeof Products !== "undefined") {
        Products.renderGrid(this.products, this.settings);
      }
      if (typeof Cart !== "undefined") {
        Cart.init();
      }
      if (typeof Wishlist !== "undefined") {
        Wishlist.init();
      }
      if (typeof Popup !== "undefined") {
        Popup.init(this.settings);
      }
      if (typeof LazyLoad !== "undefined") {
        LazyLoad.init();
      }
      if (typeof Analytics !== "undefined") {
        Analytics.init(this.settings);
      }
      if (typeof SEO !== "undefined") {
        SEO.applyBasic(this.settings);
      }

      // 3) Apply SETTINGS into HTML via data-setting attributes
      this.applySettingsToDOM();

      // 4) Global event for inline scripts
      document.dispatchEvent(new Event("runtime_ready"));

      console.log("Runtime initialized successfully.");
    } catch (err) {
      console.error("Runtime init error", err);
    }
  },

  /**
   * JSONP fetch helper.
   */
  fetchJson: function (action, extraParams) {
    return new Promise((resolve, reject) => {
      const cbName = "__jsonp_cb_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const callbackFullName = "Runtime." + cbName;

      const params = new URLSearchParams(
        Object.assign({ action: action, callback: callbackFullName }, extraParams || {})
      );

      const url = window.BASE_SCRIPT_URL + "?" + params.toString();

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
        } catch (e) {}
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onerror = function () {
        cleanup();
        reject(new Error("JSONP request failed: " + url));
      };

      document.body.appendChild(script);
    });
  },

  // Data loaders
  loadSettings: async function () {
    const res = await this.fetchJson("getSettings");
    this.settings = (res && res.settings) ? res.settings : {};
  },

  loadTextMap: async function () {
    const res = await this.fetchJson("getTextMap");
    this.textMap = (res && res.map) ? res.map : {};
  },

  loadProducts: async function () {
    const res = await this.fetchJson("getProducts");
    this.products = (res && res.items) ? res.items : [];
  },

  saveEntry: async function (entry) {
    const res = await this.fetchJson("saveEntry", {
      entry: JSON.stringify(entry)
    });
    return res;
  },

  /**
   * Apply settings into DOM using data-setting attributes.
   */
  applySettingsToDOM: function () {
    const s = this.settings || {};

    function setText(selector, value) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = (value != null) ? String(value) : "";
      });
    }

    setText('[data-setting="contact_phone"]', s.contact_phone || "");
    setText('[data-setting="contact_email"]', s.contact_email || "");
    setText('[data-setting="contact_whatsapp"]', s.contact_whatsapp || "");
    setText('[data-setting="site_title"]', s.site_title || "My Website");
    setText('[data-setting="currency_symbol"]', s.currency_symbol || "$");
  }
};

document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.Runtime !== "undefined") {
    window.Runtime.init();
  }
});
