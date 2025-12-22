/**
 * FUSION v10.9.9 - runtime.js
 * Core Handshake & Defensive Initializer
 */

const Fusion = {
    boot: function() {
        console.log("Fusion: Starting handshake...");
        this.init();
    },

    init: function() {
        // 1. Check if Config was injected by ThemeTemplate
        if (!window.FUSION_CONFIG) {
            console.error("Fusion Critical: FUSION_CONFIG is missing. Handshake failed.");
            return;
        }

        const settings = window.FUSION_CONFIG.settings;

        // 2. Apply Global Styles with Null-Guards
        if (document.documentElement) {
            const primary = settings.primary_color || '#0d6efd';
            document.documentElement.style.setProperty('--bs-primary', primary);
        }

        // 3. Initialize Sub-Modules if they exist
        if (window.ProductsModule) {
            console.log("Fusion: Booting Product Engine...");
            ProductsModule.init(settings);
        }

        if (window.CartModule) {
            console.log("Fusion: Booting Cart Engine...");
            CartModule.init(settings);
        }

        window.FUSION_CONFIG.isReady = true;
        console.log("Fusion: System fully operational.");
    }
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => Fusion.boot());
