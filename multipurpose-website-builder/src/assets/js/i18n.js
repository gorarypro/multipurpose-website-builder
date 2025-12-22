/**
 * FUSION v10.8.0 - i18n.js
 * Multi-Language & Translation Engine
 * Role: Manages UI localization and RTL layout switching.
 */

const I18nModule = {
  currentLang: 'fr',
  settings: {},
  /**
   * Hardcoded fallback translations for core UI elements.
   * In a production environment, these can also be extended by a "TextMapping" sheet.
   */
  dictionary: {
    'fr': {
      'NAV_HOME': 'Accueil',
      'NAV_MENU': 'Menu',
      'NAV_ABOUT': 'À Propos',
      'NAV_CONTACT': 'Contact',
      'CART_TITLE': 'Votre Panier',
      'CART_EMPTY': 'Votre panier est vide',
      'CHECKOUT_PROCEED': 'Passer la commande',
      'ORDER_CONFIRM': 'Confirmer la commande',
      'LABEL_PHONE': 'Numéro de téléphone',
      'LABEL_NAME': 'Nom complet',
      'LABEL_ADDRESS': 'Adresse de livraison',
      'BTN_ADD': 'AJOUTER',
      'SEARCH_PLACEHOLDER': 'Rechercher un produit...'
    },
    'en': {
      'NAV_HOME': 'Home',
      'NAV_MENU': 'Menu',
      'NAV_ABOUT': 'About',
      'NAV_CONTACT': 'Contact',
      'CART_TITLE': 'Your Cart',
      'CART_EMPTY': 'Your cart is empty',
      'CHECKOUT_PROCEED': 'Proceed to Checkout',
      'ORDER_CONFIRM': 'Place Order',
      'LABEL_PHONE': 'Phone Number',
      'LABEL_NAME': 'Full Name',
      'LABEL_ADDRESS': 'Delivery Address',
      'BTN_ADD': 'ADD TO CART',
      'SEARCH_PLACEHOLDER': 'Search for products...'
    },
    'ar': {
      'NAV_HOME': 'الرئيسية',
      'NAV_MENU': 'القائمة',
      'NAV_ABOUT': 'من نحن',
      'NAV_CONTACT': 'اتصل بنا',
      'CART_TITLE': 'سلة التسوق',
      'CART_EMPTY': 'سلتك فارغة',
      'CHECKOUT_PROCEED': 'إتمام الطلب',
      'ORDER_CONFIRM': 'تأكيد الطلب',
      'LABEL_PHONE': 'رقم الهاتف',
      'LABEL_NAME': 'الاسم الكامل',
      'LABEL_ADDRESS': 'عنوان التوصيل',
      'BTN_ADD': 'إضافة',
      'SEARCH_PLACEHOLDER': 'بحث عن منتج...'
    }
  },

  /**
   * Initialize the localization engine
   */
  init: function(syncedSettings) {
    console.log("i18n: Initializing Localization Engine...");
    this.settings = syncedSettings || window.FUSION_CONFIG.settings;
    
    // 1. Determine target language from Google Sheets config
    this.currentLang = this.settings.default_language || 'fr';
    
    // 2. Handle RTL (Right-to-Left) layout logic
    this.applyDirection();
    
    // 3. Translate all marked elements in the DOM
    this.translateAll();
    
    console.log(`i18n: System set to [${this.currentLang.toUpperCase()}]`);
  },

  /**
   * Sets the document direction and loads the RTL CSS if necessary
   */
  applyDirection: function() {
    const isRtl = (this.currentLang === 'ar');
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', this.currentLang);
    
    if (isRtl) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  },

  /**
   * Scans the document for [data-i18n] attributes and replaces text
   */
  translateAll: function() {
    const elements = document.querySelectorAll('[data-i18n]');
    const langDict = this.dictionary[this.currentLang] || this.dictionary['fr'];

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = langDict[key];

      if (translation) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
  },

  /**
   * Helper function to get a specific translation string via code
   */
  get: function(key) {
    const langDict = this.dictionary[this.currentLang] || this.dictionary['fr'];
    return langDict[key] || key;
  },

  /**
   * Allows the user to switch languages dynamically
   */
  switchLanguage: function(newLang) {
    if (this.dictionary[newLang]) {
      this.currentLang = newLang;
      this.applyDirection();
      this.translateAll();
      
      // Re-render other modules that rely on localized text
      if (window.ProductsModule) window.ProductsModule.renderGrid();
      if (window.CartModule) window.CartModule.refreshUI();
    }
  }
};
