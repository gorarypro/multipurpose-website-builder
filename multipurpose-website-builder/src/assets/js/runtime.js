/**
 * FUSION v10.8.0 - runtime.js
 * Core Handshake & Global Initialization Engine
 * Role: Connects the browser to the GAS API and boots all modules.
 */

const Fusion = {
  settings: {},
  isReady: false,

  /**
   * Start the engine on DOM load.
   */
  boot: function() {
    console.log("Fusion Hub: Initializing System...");
    this.fetchSettings();
  },

  /**
   * Request data from Google Apps Script via JSONP to bypass CORS.
   * Uses the API URL provided by the ThemeTemplate scriptlets.
   */
  fetchSettings: function() {
    // Priority: window.FUSION_CONFIG.apiUrl, then fallback to BASE_SCRIPT_URL
    const apiBase = (window.FUSION_CONFIG && window.FUSION_CONFIG.apiUrl) || window.BASE_SCRIPT_URL;
    
    if (!apiBase) {
      console.error("Fusion Error: API Entry Point is undefined. Handshake aborted.");
      return;
    }

    const script = document.createElement('script');
    // Using the 'init_site' action defined in Code.gs
    script.src = `${apiBase}?action=init_site&callback=Fusion.onSettingsLoaded`;
    
    script.onerror = () => {
      console.error("Fusion Error: Failed to reach the API. Check Deployment URL or Permissions.");
    };
    
    document.body.appendChild(script);
  },

  /**
   * Processes the JSONP response and distributes data to the UI.
   */
  onSettingsLoaded: function(response) {
    if (response.status !== 'success') {
      console.error("Fusion Error: Server rejected handshake.", response);
      return;
    }

    // Map settings to the local state and global config
    this.settings = response.settings;
    if (window.FUSION_CONFIG) window.FUSION_CONFIG.settings = response.settings;
    
    console.log("Fusion Hub: Handshake Successful. Settings synchronized.");

    // 1. Apply visual identity
    this.applyGlobalStyles();
    
    // 2. Map data to static HTML elements
    this.applyDataBinding();

    // 3. Initialize Modular Asset Pipeline (From Screenshot list)
    this.initializeModules();

    // 4. Finalize state
    this.isReady = true;
    document.dispatchEvent(new CustomEvent('runtime_ready', { 
      detail: this.settings 
    }));
  },

  /**
   * Injects dynamic CSS variables into the document root.
   */
  applyGlobalStyles: function() {
    const primary = this.settings.primary_color || '#0d6efd';
    document.documentElement.style.setProperty('--fusion-primary', primary);
    document.documentElement.style.setProperty('--bs-primary', primary);

    // Create a dynamic style block for components that don't support CSS variables
    const style = document.createElement('style');
    style.id = "fusion-dynamic-branding";
    style.innerHTML = `
      .btn-primary { background-color: ${primary} !important; border-color: ${primary} !important; }
      .text-primary { color: ${primary} !important; }
      .border-primary { border-color: ${primary} !important; }
      .bg-primary { background-color: ${primary} !important; }
    `;
    document.head.appendChild(style);
  },

  /**
   * Searches the DOM for elements with [data-setting] and fills them.
   */
  applyDataBinding: function() {
    document.querySelectorAll('[data-setting]').forEach(el => {
      const key = el.getAttribute('data-setting');
      const value = this.settings[key];
      
      if (value) {
        if (el.tagName === 'IMG') {
          el.src = value;
        } else if (el.tagName === 'A') {
          el.href = value;
        } else {
          el.textContent = value;
        }
      }
    });
  },

  /**
   * Boots up specific logic modules if their files are present in the pipeline.
   */
  initializeModules: function() {
    // Core Modules
    if (window.ProductsModule) ProductsModule.init(this.settings);
    if (window.CartModule) CartModule.init(this.settings);
    if (window.I18nModule) I18nModule.init(this.settings);

    // Feature Modules (Based on your screenshot assets)
    if (this.settings.search_included === 'yes' && window.SearchModule) {
      SearchModule.init();
    }
    
    if (this.settings.analytics_included === 'yes' && window.AnalyticsModule) {
      AnalyticsModule.init();
    }

    if (window.CurrencyModule) CurrencyModule.init(this.settings.currency_symbol);
    if (window.WishlistModule) WishlistModule.init();
    
    console.log("Fusion Hub: All modules initialized.");
  }
};

/**
 * Global Boot Trigger
 */
document.addEventListener('DOMContentLoaded', () => {
  Fusion.boot();
});
