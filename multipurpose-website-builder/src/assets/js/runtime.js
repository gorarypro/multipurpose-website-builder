/**
 * FUSION v5.10 - runtime.js
 * Core orchestrator for Headless Blogger initialization.
 */

const Runtime = {
    settings: {},
    translations: {},

    /**
     * Entry point: Triggered on DOM Load
     */
    init: function() {
        console.log("Runtime: Initializing Fusion Engine...");
        this.fetchConfiguration();
    },

    /**
     * Step 1: Request settings from GAS Backend
     */
    fetchConfiguration: function() {
        const script = document.createElement('script');
        const apiUrl = window.BASE_SCRIPT_URL || '';
        
        if (!apiUrl) {
            console.error("Runtime: BASE_SCRIPT_URL not found. Handshake aborted.");
            return;
        }

        // Action 'init_site' triggers the doGet router in Code.gs
        script.src = `${apiUrl}?action=init_site&callback=Runtime.onDataHandshake`;
        document.body.appendChild(script);
    },

    /**
     * Step 2: Handle settings received from GAS
     */
    onDataHandshake: function(response) {
        if (response.status !== 'success' && response.status !== 'online') {
            console.error("Runtime: API Error", response);
            return;
        }

        console.log("Runtime: Handshake Successful.");
        this.settings = response.settings;

        // 1. Map data-setting attributes (Site Title, etc.)
        this.applyDataBinding();

        // 2. Initialize secondary modules
        if (typeof ProductsModule !== 'undefined') ProductsModule.init();
        if (typeof CartModule !== 'undefined') CartModule.init();
        if (typeof I18nModule !== 'undefined') I18nModule.init();

        // 3. Handle Timed Popup
        this.initPopup();

        // 4. Fire ready event to hide loader in ThemeTemplate
        document.dispatchEvent(new CustomEvent('runtime_ready'));
    },

    /**
     * Inject settings into elements with data-setting attributes
     */
    applyDataBinding: function() {
        document.querySelectorAll('[data-setting]').forEach(el => {
            const key = el.getAttribute('data-setting');
            if (this.settings[key]) {
                el.textContent = this.settings[key];
            }
        });
    },

    /**
     * Logic for the timed marketing popup
     */
    initPopup: function() {
        if (this.settings.popup_included === 'yes') {
            const delay = (parseInt(this.settings.popup_delay_seconds) || 5) * 1000;
            setTimeout(() => {
                const popupEl = document.getElementById('timedPopup');
                if (popupEl) {
                    const bsModal = new bootstrap.Modal(popupEl);
                    bsModal.show();
                }
            }, delay);
        }
    }
};

// Start Runtime
document.addEventListener('DOMContentLoaded', () => Runtime.init());
