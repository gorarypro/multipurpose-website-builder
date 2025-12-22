/**
 * FUSION v10.8.0 - currency.js
 * Price Formatting & Localization Engine
 * Role: Standardizes price displays across all modules.
 */

const CurrencyModule = {
  symbol: 'DH',
  precision: 2,
  settings: {},

  /**
   * Initialize with settings from the Hub
   */
  init: function(syncedSettings) {
    console.log("Currency: Initializing Formatting Engine...");
    this.settings = syncedSettings || (window.FUSION_CONFIG ? window.FUSION_CONFIG.settings : {});
    this.symbol = this.settings.currency_symbol || 'DH';
  },

  /**
   * Formats a raw number into a currency string
   */
  format: function(amount) {
    const value = parseFloat(amount || 0);
    
    // Handle RTL vs LTR symbol placement based on language
    const isRtl = (document.documentElement.getAttribute('dir') === 'rtl');
    const formattedNum = value.toFixed(this.precision);

    return isRtl ? `${formattedNum} ${this.symbol}` : `${this.symbol} ${formattedNum}`;
  },

  /**
   * Utility to update all price displays in the DOM
   */
  updatePagePrices: function() {
    document.querySelectorAll('[data-price]').forEach(el => {
      const rawPrice = el.getAttribute('data-price');
      el.textContent = this.format(rawPrice);
    });
  }
};
