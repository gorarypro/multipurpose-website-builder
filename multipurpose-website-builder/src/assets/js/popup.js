/**
 * FUSION v10.8.1 - popup.js
 * --------------------------------
 * Marketing Popup Module
 * Features:
 * - Display marketing content dynamically
 * - Close popup via close button or overlay click
 * - Compatible with other FUSION UI components
 */

(function () {

  const PopupModule = {
    popupEl: null,
    contentEl: null,
    closeBtn: null,

    init() {
      this.popupEl = document.getElementById('marketingPopup');
      this.contentEl = document.getElementById('popupContentArea');

      if (!this.popupEl || !this.contentEl) return;

      // Bind close button
      this.closeBtn = this.popupEl.querySelector('div[onclick]');
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.hide());
      }

      // Hide popup when clicking outside
      this.popupEl.addEventListener('click', (e) => {
        if (e.target === this.popupEl) this.hide();
      });

      // Expose show function globally
      window.showMarketingPopup = (htmlContent) => {
        this.show(htmlContent);
      };
    },

    show(htmlContent) {
      if (!this.popupEl || !this.contentEl) return;
      this.contentEl.innerHTML = htmlContent || '';
      this.popupEl.style.display = 'block';
    },

    hide() {
      if (!this.popupEl) return;
      this.popupEl.style.display = 'none';
    }
  };

  document.addEventListener('runtime_ready', () => PopupModule.init());

})();
