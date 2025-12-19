/**
 * FUSION v5.11 - currency.js
 * Handles price formatting and currency symbol injection.
 */

const CurrencyModule = {
    symbol: '$',
    position: 'suffix', // 'prefix' or 'suffix'

    /**
     * Initializes the currency settings from Runtime
     */
    init: function() {
        console.log("Currency: Initializing Price Engine...");
        this.symbol = Runtime.settings.currency_symbol || '$';
        
        // Detect position (optional logic: common for AR/FR to use suffix)
        const lang = I18nModule.activeLang || 'en';
        this.position = (lang === 'ar' || lang === 'fr') ? 'suffix' : 'prefix';
        
        this.applyToStatic();
    },

    /**
     * Formats a raw number into a currency string
     * @param {number|string} amount 
     * @returns {string} e.g., "100.00 DH" or "$ 100"
     */
    format: function(amount) {
        const num = parseFloat(amount).toFixed(2);
        if (this.position === 'prefix') {
            return `${this.symbol} ${num}`;
        } else {
            return `${num} ${this.symbol}`;
        }
    },

    /**
     * Finds any elements with data-price attribute and formats them
     */
    applyToStatic: function() {
        document.querySelectorAll('[data-price]').forEach(el => {
            const val = el.getAttribute('data-price');
            if (val) el.textContent = this.format(val);
        });
    }
};
