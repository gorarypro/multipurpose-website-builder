/**
 * FUSION ENGINE v12.0.0 - runtime.js
 * Core Orchestrator & Handshake
 * -----------------------------------------------------
 * Responsibilities:
 * - Bootstrapping the Headless CMS Pipeline
 * - Synchronizing Data (Feed) with UI (Modules)
 * - Handling Multi-language & Global Branding
 * - Event Bus Management
 */

const FusionRuntime = (function() {

    const state = {
        isDataReady: false,
        config: window.FUSION_SETTINGS || null
    };

    /**
     * Entry Point: Triggered on DOMContentLoaded
     */
    async function boot() {
        console.group("Fusion Engine: System Boot");
        
        if (!validateConfig()) {
            console.error("Fusion: Critical initialization failure.");
            console.groupEnd();
            return;
        }

        applyBranding();
        await initializeCore();
        await bootModules();

        console.log("Fusion: System is fully operational.");
        console.groupEnd();
        
        // Final Ready Event
        window.dispatchEvent(new CustomEvent('fusion:ready'));
    }

    /**
     * Validate Settings from Google Sheets
     */
    function validateConfig() {
        if (!state.config) {
            console.error("Fusion: FUSION_SETTINGS not found. Verify Code.gs and ThemeTemplate.html.");
            return false;
        }
        return true;
    }

    /**
     * Inject Branding from Builder settings
     */
    function applyBranding() {
        const primary = state.config.primary_color || '#4f46e5';
        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--fusion-primary', primary);
        console.log("Fusion: Branding applied (" + primary + ")");
    }

    /**
     * Initialize non-blocking core utilities (I18N, Currency)
     */
    async function initializeCore() {
        // Initialize I18n if present
        if (window.FusionI18n) {
            await FusionI18n.init(state.config.default_language);
            console.log("Fusion: I18n Ready");
        }

        // Initialize Currency formatting
        if (window.FusionCurrency) {
            FusionCurrency.init(state.config.currency_symbol);
            console.log("Fusion: Currency Engine Ready");
        }
    }

    /**
     * Fetch Blogger Feed and boot enabled modules
     */
    async function bootModules() {
        // 1. Fetch Products (The Source of Truth)
        if (window.FusionProducts && state.config.blogger_feed_url) {
            const feedUrl = state.config.blogger_feed_url;
            console.log("Fusion: Fetching feed from " + feedUrl);
            await FusionProducts.fetchFeed(feedUrl);
            state.isDataReady = true;
        }

        // 2. Initialize Shopping Cart
        if (state.config.cart_included && window.FusionCart) {
            FusionCart.init ? FusionCart.init() : null;
            // Update UI count immediately
            const cart = FusionCart.load();
            window.dispatchEvent(new CustomEvent('fusion:cart_updated', { detail: cart }));
            console.log("Fusion: Cart Module Active");
        }

        // 3. Initialize QuickView
        if (state.config.quickview_included && window.FusionQuickView) {
            FusionQuickView.init();
            console.log("Fusion: QuickView Module Active");
        }

        // 4. Initialize Marketing Popup
        if (state.config.popup_enabled) {
            initPopupTrigger();
        }

        // 5. Initialize Wishlist
        if (state.config.wishlist_included && window.FusionWishlist) {
            FusionWishlist.init();
            console.log("Fusion: Wishlist Module Active");
        }
    }

    /**
     * Handles the Timed Popup trigger
     */
    function initPopupTrigger() {
        const delay = (parseInt(state.config.popup_delay) || 5) * 1000;
        setTimeout(() => {
            const modalEl = document.getElementById('timedPopup');
            if (modalEl && window.bootstrap) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
                console.log("Fusion: Marketing Popup Triggered");
            }
        }, delay);
    }

    return {
        boot: boot,
        getState: () => ({ ...state })
    };

})();

// Global Safety Hook
document.addEventListener('DOMContentLoaded', () => FusionRuntime.boot());
