/**
 * FUSION v6.7.1 - runtime.js
 * Core Handshake & Initialization Engine
 */

const Fusion = {
  settings: {},
  isReady: false,

  /**
   * Start the engine
   */
  boot: function() {
    console.log("Fusion: Initializing System...");
    this.fetchSettings();
  },

  /**
   * Request data from Google Apps Script via JSONP
   */
  fetchSettings: function() {
    const apiBase = window.BASE_SCRIPT_URL;
    if (!apiBase) {
      console.error("Fusion Error: BASE_SCRIPT_URL is undefined. Handshake aborted.");
      return;
    }

    const script = document.createElement('script');
    // The action 'init_site' is defined in your Code.gs
    script.src = `${apiBase}?action=init_site&callback=Fusion.onSettingsLoaded`;
    script.onerror = () => {
      console.error("Fusion Error: Failed to reach the API. Check Deployment URL.");
    };
    document.body.appendChild(script);
  },

  /**
   * Handle the response from the server
   */
  onSettingsLoaded: function(response) {
    if (response.status !== 'success') {
      console.error("Fusion Error: Server rejected handshake.", response);
      return;
    }

    this.settings = response.settings;
    console.log("Fusion: Handshake Successful. Settings mapped.");

    // Apply Styles & Branding
    this.applyGlobalStyles();
    this.applyDataBinding();

    // Trigger Ready Events for other modules
    if (window.ProductsModule) ProductsModule.init();
    if (window.CartModule) CartModule.init();
    if (window.I18nModule) I18nModule.init();

    // Finalize
    this.isReady = true;
    document.dispatchEvent(new CustomEvent('runtime_ready', { detail: this.settings }));
  },

  /**
   * Inject primary color and other CSS variables
   */
  applyGlobalStyles: function() {
    const primary = this.settings.primary_color || '#0d6efd';
    document.documentElement.style.setProperty('--bs-primary', primary);
    
    // Create a dynamic style block for hover effects
    const style = document.createElement('style');
    style.innerHTML = `
      .btn-primary { background-color: ${primary} !important; border-color: ${primary} !important; }
      .text-primary { color: ${primary} !important; }
    `;
    document.head.appendChild(style);
  },

  /**
   * Automatically fill elements with [data-setting] attributes
   */
  applyDataBinding: function() {
    document.querySelectorAll('[data-setting]').forEach(el => {
      const key = el.getAttribute('data-setting');
      if (this.settings[key]) {
        if (el.tagName === 'IMG') el.src = this.settings[key];
        else el.textContent = this.settings[key];
      }
    });
  }
};

// Auto-initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => Fusion.boot());
