/**
 * FUSION v10.8.1 - gallery.js
 * --------------------------------
 * Simple Lightbox / Image Gallery Module
 * Features:
 * - Click image to open in overlay
 * - Close overlay on click
 * - Supports multiple images on page
 */

(function () {

  const GalleryModule = {
    init() {
      document.querySelectorAll('[data-lightbox]').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => this.open(img.src));
      });
    },

    open(src) {
      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'lightbox-backdrop';
      Object.assign(backdrop.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        cursor: 'pointer'
      });

      // Create image element
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.className = 'lightbox-img';
      Object.assign(img.style, {
        maxWidth: '90%',
        maxHeight: '90%',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        cursor: 'default'
      });

      backdrop.appendChild(img);

      // Close when clicking backdrop
      backdrop.addEventListener('click', () => backdrop.remove());

      document.body.appendChild(backdrop);
    }
  };

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => GalleryModule.init());
  window.GalleryModule = GalleryModule;

})();
