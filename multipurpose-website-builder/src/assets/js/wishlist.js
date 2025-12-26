/**
 * FUSION v10.8.1 - wishlist.js
 * --------------------------------
 * Wishlist Module
 * Features:
 * - Add / remove products
 * - Tracks quantity & variants
 * - Syncs with floating wishlist UI
 * - Works with quickview & product grid
 */

(function () {

  const WishlistModule = {
    items: [],
    wishlistCountEl: null,
    wishlistBodyEl: null,

    init() {
      this.wishlistCountEl = document.getElementById('wishlistCount');
      this.wishlistBodyEl = document.getElementById('wishlistBody');

      this.bindFloatingWishlist();
      this.render();
    },

    add(id, title, price, variants = {}) {
      // Avoid duplicates
      const exists = this.items.find(item =>
        item.id === id && JSON.stringify(item.variants) === JSON.stringify(variants)
      );

      if (!exists) {
        this.items.push({ id, title, price, variants });
        this.render();
      }
    },

    remove(index) {
      if (index < 0 || index >= this.items.length) return;
      this.items.splice(index, 1);
      this.render();
    },

    render() {
      this.wishlistBodyEl.innerHTML = '';

      if (this.items.length === 0) {
        document.getElementById('emptyWishlistMessage').style.display = 'block';
        this.updateFloatingCount();
        return;
      }

      document.getElementById('emptyWishlistMessage').style.display = 'none';

      this.items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'd-flex justify-content-between align-items-center mb-3';
        row.innerHTML = `
          <div>
            <strong>${item.title}</strong>
            ${this.renderVariants(item.variants)}
            <div class="text-muted small">Price: ${item.price} ${window.FUSION_CONFIG.settings.currency_symbol}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger remove-item"><i class="bi bi-trash"></i></button>
        `;

        row.querySelector('.remove-item').addEventListener('click', () => this.remove(idx));

        this.wishlistBodyEl.appendChild(row);
      });

      this.updateFloatingCount();
    },

    renderVariants(variants) {
      if (!variants || Object.keys(variants).length === 0) return '';
      return `<div class="text-muted small">
        ${Object.entries(variants).map(([k,v]) => `${k}: ${v}`).join(', ')}
      </div>`;
    },

    updateFloatingCount() {
      const count = this.items.length;
      const el = document.getElementById('floatingWishlistCount');
      if (el) el.textContent = count;
      if (this.wishlistCountEl) this.wishlistCountEl.textContent = count;
    },

    bindFloatingWishlist() {
      const wishlistIcon = document.getElementById('wishlistIcon');
      const sidebar = document.getElementById('wishlistSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      const closeBtn = document.getElementById('closeWishlist');

      const toggleSidebar = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      };

      if (wishlistIcon) wishlistIcon.addEventListener('click', toggleSidebar);
      if (overlay) overlay.addEventListener('click', toggleSidebar);
      if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

      const floatingBtn = document.getElementById('floatingWishlist');
      if (floatingBtn) floatingBtn.addEventListener('click', toggleSidebar);
    }
  };

  // Expose globally
  window.WishlistModule = WishlistModule;

  document.addEventListener('runtime_ready', () => WishlistModule.init());

})();
  // Expose globally
  window.WishlistModule = WishlistModule;
