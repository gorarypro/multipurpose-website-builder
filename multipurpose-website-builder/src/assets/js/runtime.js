/**
 * Core runtime engine.
 * NOTE: Set BASE_SCRIPT_URL to your deployed Apps Script web app URL.
 */
const BASE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyzCNs3LoUus8PpPCz8Zko-7PWN0-ivzTTLvXwxDs47wAyDi2w8NVJv_PrJqq3kFRGyA/exec';

window.Runtime = {
  settings: null,
  textMap: null,
  products: [],
  init: async function() {
    try {
      await this.loadSettings();
      await this.loadTextMap();
      await this.loadProducts();
      I18n.init(this.textMap, this.settings);
      Products.renderGrid(this.products, this.settings);
      Cart.init();
      Wishlist.init();
      Popup.init(this.settings);
      LazyLoad.init();
      Analytics.init(this.settings);
      SEO.applyBasic(this.settings);
    } catch (err) {
      console.error('Runtime init error', err);
    }
  },
  fetchJson: async function(action, extraParams) {
    const params = new URLSearchParams({ action, ...(extraParams || {}) });
    const url = BASE_SCRIPT_URL + '?' + params.toString();
    const res = await fetch(url, { method: 'GET' });
    return res.json();
  },
  loadSettings: async function() {
    const res = await this.fetchJson('getSettings');
    this.settings = res.settings || {};
  },
  loadTextMap: async function() {
    const res = await this.fetchJson('getTextMap');
    this.textMap = res.map || {};
  },
  loadProducts: async function() {
    const res = await this.fetchJson('getProducts');
    this.products = res.items || [];
  },
  saveEntry: async function(entry) {
    const res = await this.fetchJson('saveEntry', { entry: JSON.stringify(entry) });
    return res;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.Runtime !== 'undefined') {
    window.Runtime.init();
  }
});
