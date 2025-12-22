/**
 * FUSION v10.8.0 - analytics.js
 * Behavior Tracking & Conversion Monitoring
 * Role: Tracks clicks, views, and successful checkouts.
 */

const AnalyticsModule = {
  settings: {},

  init: function(syncedSettings) {
    console.log("Analytics: Booting conversion tracker...");
    this.settings = syncedSettings || window.FUSION_CONFIG.settings;
    
    if (this.settings.analytics_included !== 'yes') {
      console.log("Analytics: Tracking is disabled in Builder.");
      return;
    }

    this.trackPageView();
    this.observeInteractions();
  },

  /**
   * Simple page view counter logged to console
   */
  trackPageView: function() {
    console.log(`Analytics Event: [PageView] - ${window.location.pathname}`);
  },

  /**
   * Uses event delegation to track global interactions
   */
  observeInteractions: function() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a');
      if (!target) return;

      // Track "Add to Cart" Clicks
      if (target.getAttribute('onclick') && target.getAttribute('onclick').includes('CartModule.add')) {
        this.logEvent('AddToCart', target.innerText.trim());
      }

      // Track WhatsApp Clicks
      if (target.href && target.href.includes('wa.me')) {
        this.logEvent('ContactClick', 'WhatsApp');
      }

      // Track QuickView clicks
      if (target.classList.contains('btn-quickview')) {
        this.logEvent('QuickView', 'OpenModal');
      }
    });
  },

  /**
   * General event logger
   */
  logEvent: function(category, label) {
    console.log(`Analytics Event: [${category}] - ${label}`);
    
    // Future expansion: Send these specific events to a 'Behavior' sheet in GAS
  }
};
