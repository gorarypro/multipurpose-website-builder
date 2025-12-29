/**
 * FUSION ENGINE v12.0.0 - i18n.js
 * Multi-Language & Translation Engine
 * -----------------------------------------------------
 * Role: Manages UI localization and RTL layout switching.
 */

window.FusionI18n = (function() {
  
  const state = {
    currentLang: 'en',
    dictionary: {
      'fr': {
        'HOME': 'Accueil',
        'PRODUCTS': 'Produits',
        'CONTACT': 'Contact',
        'TEXT_CART': 'Votre Panier',
        'CART_EMPTY': 'Votre panier est vide',
        'CHECKOUT': 'Passer la commande',
        'TEXT_TOTAL': 'Total',
        'TEXT_QUICKVIEW': 'Aperçu Rapide',
        'TEXT_ADD_TO_CART': 'Ajouter au Panier',
        'TEXT_BROWSE_PRODUCTS': 'Voir les produits'
      },
      'en': {
        'HOME': 'Home',
        'PRODUCTS': 'Products',
        'CONTACT': 'Contact',
        'TEXT_CART': 'Your Cart',
        'CART_EMPTY': 'Your cart is empty',
        'CHECKOUT': 'Checkout',
        'TEXT_TOTAL': 'Total',
        'TEXT_QUICKVIEW': 'Quick View',
        'TEXT_ADD_TO_CART': 'Add to Cart',
        'TEXT_BROWSE_PRODUCTS': 'Browse Products'
      },
      'ar': {
        'HOME': 'الرئيسية',
        'PRODUCTS': 'المنتجات',
        'CONTACT': 'اتصل بنا',
        'TEXT_CART': 'سلة التسوق',
        'CART_EMPTY': 'سلتك فارغة',
        'CHECKOUT': 'إتمام الطلب',
        'TEXT_TOTAL': 'المجموع',
        'TEXT_QUICKVIEW': 'عرض سريع',
        'TEXT_ADD_TO_CART': 'إضافة للسلة',
        'TEXT_BROWSE_PRODUCTS': 'تصفح المنتجات'
      }
    }
  };

  /**
   * Initialization called by runtime.js
   */
  async function init(langCode) {
    state.currentLang = langCode || 'en';
    applyDirection();
    translateAll();
    console.log(`FusionI18n: Language set to [${state.currentLang.toUpperCase()}]`);
  }

  /**
   * Handle RTL logic and Document lang attribute
   */
  function applyDirection() {
    const isRtl = (state.currentLang === 'ar');
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', state.currentLang);
    
    if (isRtl) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }

  /**
   * Scan DOM for [data-i18n]
   */
  function translateAll() {
    const langDict = state.dictionary[state.currentLang] || state.dictionary['en'];
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = langDict[key];

      if (translation) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.innerHTML = translation; // Allow for HTML in translations
        }
      }
    });
  }

  return {
    init,
    get: (key) => (state.dictionary[state.currentLang] || {})[key] || key,
    translateAll
  };

})();
