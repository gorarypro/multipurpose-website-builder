/**
 * FUSION v6.7.1 - i18n.js
 * Multi-Language & Translation Engine
 */

const I18nModule = {
  map: {},

  init: function() {
    const lang = Fusion.settings.default_language || 'fr';
    if (lang === 'ar') document.body.setAttribute('dir', 'rtl');
    this.translateAll(lang);
  },

  translateAll: function(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      this.translateElement(el, key, lang);
    });
  },

  translateElement: function(el, key, lang) {
    // These are common fallback translations
    const library = {
      HOME: { en: "Home", fr: "Accueil", ar: "الرئيسية" },
      PRODUCTS: { en: "Products", fr: "Produits", ar: "منتجاتنا" },
      CONTACT: { en: "Contact", fr: "Contact", ar: "اتصل بنا" },
      CHECKOUT: { en: "Checkout", fr: "Commander", ar: "إتمام الطلب" },
      TEXT_TOTAL: { en: "Total", fr: "Total", ar: "المجموع" }
    };

    if (library[key] && library[key][lang]) {
      el.textContent = library[key][lang];
    }
  }
};
