/**
 * FUSION v5.10 - i18n.js
 * Advanced Localization & RTL Orchestrator.
 */

const I18nModule = {
    map: {},
    activeLang: 'en',

    /**
     * Initializes the module with data from the GAS Handshake
     */
    init: function() {
        console.log("I18n: Initializing Localization...");
        
        // 1. Fetch map from Runtime (which got it from TextMapping sheet)
        this.fetchMap();
        
        // 2. Set Active Language (Priority: LocalStorage > Settings > Default)
        const savedLang = localStorage.getItem('fusion_lang');
        this.activeLang = savedLang || Runtime.settings.default_language || 'en';

        this.apply();
        this.renderSwitcher();
    },

    /**
     * Fetch translations from the GAS Backend
     */
    fetchMap: function() {
        const script = document.createElement('script');
        script.src = `${window.BASE_SCRIPT_URL}?action=getTextMap&callback=I18nModule.onMapLoaded`;
        document.body.appendChild(script);
    },

    onMapLoaded: function(response) {
        if (response.status === 'ok') {
            this.map = response.map;
            this.apply();
        }
    },

    /**
     * Core Translation Engine
     */
    t: function(key) {
        const entry = this.map[key];
        if (!entry) return key;
        // Fallback sequence: Chosen Lang > Default Sheet Value > Key Name
        return entry[this.activeLang] || entry.default || key;
    },

    /**
     * Updates DOM elements and document direction
     */
    apply: function() {
        // 1. Set RTL/LTR Direction
        const rtlLangs = ['ar', 'he', 'fa', 'ur'];
        const dir = rtlLangs.includes(this.activeLang) ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', this.activeLang);

        // 2. Translate Text Content: <span data-i18n="KEY"></span>
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // 3. Translate Attributes: <input data-i18n-attr="placeholder:KEY">
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const attrData = el.getAttribute('data-i18n-attr').split(':');
            if (attrData.length === 2) {
                el.setAttribute(attrData[0], this.t(attrData[1]));
            }
        });
    },

    /**
     * Switch language and persist choice
     */
    setLanguage: function(lang) {
        this.activeLang = lang;
        localStorage.setItem('fusion_lang', lang);
        this.apply();
        // Optional: Re-render products to update prices/titles if they have translations
        if (typeof ProductsModule !== 'undefined') ProductsModule.render(); 
    },

    /**
     * Injects a language switcher into the Navbar placeholder
     */
    renderSwitcher: function() {
        const container = document.getElementById('langSwitcher');
        if (!container) return;

        container.classList.remove('d-none');
        container.innerHTML = `
            <select class="form-select form-select-sm" onchange="I18nModule.setLanguage(this.value)">
                <option value="en" ${this.activeLang === 'en' ? 'selected' : ''}>EN</option>
                <option value="fr" ${this.activeLang === 'fr' ? 'selected' : ''}>FR</option>
                <option value="ar" ${this.activeLang === 'ar' ? 'selected' : ''}>AR</option>
            </select>
        `;
    }
};
