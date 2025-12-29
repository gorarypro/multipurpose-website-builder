/**
 * FUSION ENGINE v12.0.0 - currency.js
 * Price Formatting & Localization Engine
 */

window.FusionCurrency = (function() {
  
  const state = {
    symbol: 'DH',
    precision: 2
  };

  /**
   * Initialization called by runtime.js
   */
  function init(symbol) {
    state.symbol = symbol || 'DH';
    updatePagePrices();
  }

  /**
   * Formats a number into a localized string
   * Handles RTL symbol placement automatically.
   */
  function format(amount) {
    const num = parseFloat(amount || 0);
    const value = num.toLocaleString(undefined, { 
      minimumFractionDigits: state.precision, 
      maximumFractionDigits: state.precision 
    });
    
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    return isRtl ? `${value} ${state.symbol}` : `${state.symbol} ${value}`;
  }

  /**
   * Re-scans the page for [data-price] and [data-total]
   */
  function updatePagePrices() {
    // Standard product prices
    document.querySelectorAll('[data-price]').forEach(el => {
      const p = el.getAttribute('data-price');
      if (p) el.textContent = format(p);
    });

    // Cart and Order totals
    document.querySelectorAll('[data-total]').forEach(el => {
      const t = el.getAttribute('data-total');
      if (t) el.textContent = format(t);
    });
  }

  return {
    init,
    format,
    updatePagePrices
  };

})();
