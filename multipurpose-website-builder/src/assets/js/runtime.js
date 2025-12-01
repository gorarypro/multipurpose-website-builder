/**
 * Core runtime engine for Multipurpose Website Builder
 * ----------------------------------------------------
 * - Loads settings, text map, and products from Apps Script via JSONP
 * - Initializes i18n, products grid, cart, wishlist, popup, etc.
 * - Applies settings to DOM using [data-setting="..."]
 * - Dispatches `runtime_ready` event when everything is loaded
 *
 * IMPORTANT:
 *   Set BASE_SCRIPT_URL to your deployed Apps Script Web App URL
 *   (the one ending with /exec).
 */

const BASE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyzCNs3LoUus8PpPCz8Zko-7PWN0-ivzTTLvXwxDs47wAyDi2w8NVJv_PrJqq3kFRGyA/exec";

window.Runtime = {
  settings: null,
  textMap: null,
  products: [],

  /**
   * Main entry point.
   * Called on DOMContentLoaded (see bottom of file).
   */
  init: async function () {
    try {
      // 1) Load data from Apps Script (via JSONP)
      await this.loadSettings();
      await this.loadTextMap();
      await this.loadProducts();

      // 2) Initialize i18n & components (if present)
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

      // 4) Fire global event so inline theme scripts can run
      document.dispatchEvent(new Event("runtime_ready"));

      console.log("Runtime initialized successfully.");

    } catch (err) {
      console.error("Runtime init error", err);
    }
  },

  /**
   * JSONP fetch to bypass CORS.
   * Calls GAS with ?action=...&callback=Runtime.__jsonp_cb_XYZ
   */
  fetchJson: function (action, extraParams) {
    return new Promise((resolve, reject) => {
      // Unique callback name
      const cbName = "__jsonp_cb_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const callbackFullName = "Runtime." + cbName;

      const params = new URLSearchParams(
        Object.assign(
          { action: action, callback: callbackFullName },
          extraParams || {}
        )
      );

      const url = BASE_SCRIPT_URL + "?" + params.toString();

      // Define callback that GAS will call
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
        } catch (e) {
          // ignore
        }
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

  // --------------------
  // Data loading helpers
  // --------------------

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

  // --------------------
  // DOM helpers
  // --------------------

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
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = (value != null) ? String(value) : "";
      });
    }

    // Contact info
    setText('[data-setting="contact_phone"]', s.contact_phone || "");
    setText('[data-setting="contact_email"]', s.contact_email || "");
    setText('[data-setting="contact_whatsapp"]', s.contact_whatsapp || "");

    // Site title
    setText('[data-setting="site_title"]', s.site_title || "My Website");

    // Currency symbol
    setText('[data-setting="currency_symbol"]', s.currency_symbol || "$");
  }
};

// Kick things off once DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.Runtime !== "undefined") {
    window.Runtime.init();
  }
});
