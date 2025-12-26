/**
 * FUSION v10.8.1 - currency.js
 * --------------------------------
 * Price Formatting & Localization Engine
 * Features:
 * - Standardizes price display
 * - Updates DOM elements dynamically
 */

const CurrencyModule = {
  symbol: 'DH',
  precision: 2,
  settings: {},

  /**
   * Initialize with settings from FUSION_CONFIG
   */
  init: function(syncedSettings) {
    console.log("Currency: Initializing formatting engine...");
    this.settings = syncedSettings || (window.FUSION_CONFIG ? window.FUSION_CONFIG.settings : {});
    this.symbol = this.settings.currency_symbol || 'DH';
    this.updatePagePrices();
  },

  /**
   * Format number into currency string
   */
  format: function(amount) {
    const value = parseFloat(amount || 0).toFixed(this.precision);
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    return isRtl ? `${value} ${this.symbol}` : `${this.symbol} ${value}`;
  },

  /**
   * Update all elements with data-price attribute
   */
  updatePagePrices: function() {
    document.querySelectorAll('[data-price]').forEach(el => {
      const rawPrice = el.getAttribute('data-price');
      if (rawPrice !== null) {
        el.textContent = this.format(rawPrice);
      }
    });

    // Update quickview price if exists
    const quickviewPrice = document.getElementById('quickViewPrice');
    if (quickviewPrice && quickviewPrice.getAttribute('data-price')) {
      quickviewPrice.textContent = this.format(quickviewPrice.getAttribute('data-price'));
    }

    // Update cart totals
    const cartTotalEl = document.getElementById('cartTotal');
    if (cartTotalEl && cartTotalEl.getAttribute('data-total')) {
      cartTotalEl.textContent = this.format(cartTotalEl.getAttribute('data-total'));
    }
  }
};

// Auto-init on runtime_ready event
document.addEventListener('runtime_ready', function(e) {
  CurrencyModule.init(e.detail);
});

// Fallback if loaded directly
if (document.readyState === 'complete') {
  setTimeout(() => { if (!CurrencyModule.isReady) CurrencyModule.init(); }, 1000);
}
