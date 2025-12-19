/**
 * FUSION v5.0 - runtime.js
 * Manages the initial handshake between Blogger and the GAS Backend.
 */

const Runtime = {
    init: () => {
        console.log("Runtime: Initializing Fusion Engine...");
        
        // 1. Show the skeleton loaders (handled by CSS in ThemeTemplate)
        
        // 2. Perform the JSONP handshake with GAS
        const script = document.createElement('script');
        // action=init_site matches the router logic in your Code.gs
        script.src = `${window.FUSION_CONFIG.api}?action=init_site&callback=Runtime.onDataHandshake`;
        script.onerror = () => {
            console.error("Runtime: Failed to connect to GAS API.");
            document.getElementById('loader').innerHTML = '<div class="alert alert-danger">Critical Connection Error: Check SCRIPT_URL.</div>';
        };
        document.body.appendChild(script);
    },

    onDataHandshake: (payload) => {
        console.log("Runtime: Handshake successful.", payload);
        
        if (payload.status !== 'success' && payload.status !== 'online') {
            console.error("Runtime: API returned an error status.");
            return;
        }

        // Store settings globally for other modules
        window.SiteSettings = payload.settings;
        window.Translations = payload.translations || {};

        // 3. Initialize other modules
        ProductsModule.init();
        CartModule.init();
        
        // If search is included in the template, init it
        if (document.getElementById('shop-search')) {
            SearchModule.init();
        }

        // 4. Reveal the app and hide global loader
        const appShell = document.getElementById('app');
        if (appShell) appShell.classList.add('loaded');
        
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
};

// Start the engine
document.addEventListener('DOMContentLoaded', Runtime.init);
