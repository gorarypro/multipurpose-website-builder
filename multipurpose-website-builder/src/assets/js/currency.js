/**
 * Currency formatting helper
 */
window.Currency = {
  format(value, settings) {
    const symbol = (settings && settings.currency_symbol) || '$';
    const num = parseFloat(value || 0);
    if (isNaN(num)) return symbol + '0.00';
    return symbol + num.toFixed(2);
  }
};
