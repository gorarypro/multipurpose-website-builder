/**
 * FUSION v10.9.9 - runtime.js
 * Core Initialization & Handshake
 */

const Fusion = {
    boot: function() {
        console.log("Fusion: System check initiated...");
        this.verifyEnvironment();
    },

    verifyEnvironment: function() {
        // Guard against missing configuration
        if (!window.FUSION_CONFIG || !window.FUSION_CONFIG.settings) {
            console.error("Fusion: Critical Error - FUSION_CONFIG not found.");
            return;
        }

        const settings = window.FUSION_CONFIG.settings;
        console.log("Fusion: Configuration loaded for " + (settings.site_title || "Site"));

        // Initialize Global Branding
        if (document.documentElement) {
            const primary = settings.primary_color || '#0d6efd';
            document.documentElement.style.setProperty('--fusion-primary', primary);
        }

        // Sequential Module Load
        this.loadModules(settings);
    },

    loadModules: function(settings) {
        // Initialize Products
        if (typeof ProductsModule !== 'undefined') {
            ProductsModule.init(settings);
        }

        // Initialize Cart
        if (typeof CartModule !== 'undefined') {
            CartModule.init(settings);
        }

        // Initialize QuickView
        if (typeof QuickView !== 'undefined') {
            QuickView.init(settings);
        }

        window.FUSION_CONFIG.isReady = true;
        console.log("Fusion: Site is fully operational.");
    }
};

// Start when document is ready
document.addEventListener('DOMContentLoaded', () => Fusion.boot());
