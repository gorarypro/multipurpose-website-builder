/**
 * FUSION ENGINE v15.7.0 - Announcement Popup Logic
 * Features: Time-delay trigger, Session-based persistence, Dynamic content.
 */

const FusionPopup = (function() {
    // 1. Internal State
    const settings = window.FUSION_SETTINGS || {};
    const POPUP_KEY = 'fusion_popup_dismissed';
    
    // Configuration from Settings Sheet
    const config = {
        enabled: settings.popupIncluded === true || settings.popupIncluded === "yes",
        delay: parseInt(settings.popup_delay) || 3000, // Default 3 seconds
        expiryDays: parseInt(settings.popup_expiry_days) || 1 // Hide for 24h after close
    };

    /**
     * Entry Point
     */
    function init() {
        if (!config.enabled) return;
        
        // Check if user has already dismissed this recently
        if (isDismissed()) {
            console.log("FusionPopup: User already saw this today.");
            return;
        }

        // Trigger the popup after the specified delay
        setTimeout(() => {
            show();
        }, config.delay);
    }

    /**
     * Trigger the Modal
     */
    function show() {
        const modalEl = document.getElementById('popupModal');
        if (!modalEl) return;

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        console.log("FusionPopup: Announcement triggered.");
    }

    /**
     * Dismiss and Persist
     */
    function dismiss() {
        const expiryDate = new Date().getTime() + (config.expiryDays * 24 * 60 * 60 * 1000);
        localStorage.setItem(POPUP_KEY, expiryDate);
    }

    /**
     * Check Expiry
     */
    function isDismissed() {
        const dismissedAt = localStorage.getItem(POPUP_KEY);
        if (!dismissedAt) return false;

        // If current time is past the expiry date, reset it
        if (new Date().getTime() > parseInt(dismissedAt)) {
            localStorage.removeItem(POPUP_KEY);
            return false;
        }

        return true;
    }

    return { init, dismiss, reset: () => localStorage.removeItem(POPUP_KEY) };
})();

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    FusionPopup.init();
    
    // Listen for the close button to save the dismissal state
    const closeBtn = document.querySelector('#popupModal .btn-close, #popupModal [data-bs-dismiss="modal"]');
    if (closeBtn) {
        closeBtn.addEventListener('click', FusionPopup.dismiss);
    }
});
