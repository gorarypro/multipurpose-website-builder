/**
 * FUSION v10.8.1 - cart.js
 * --------------------------------
 * Shopping Cart Module
 * Features:
 * - Add / remove / update items
 * - Tracks quantity & variant selection
 * - Computes totals
 * - Syncs with floating cart UI
 * - WhatsApp-ready checkout
 */

(function () {

  const CartModule = {
    items: [],
    cartCountEl: null,
    cartBodyEl: null,
    cartFooterEl: null,
    cartTotalEl: null,

    init() {
      this.cartCountEl = document.getElementById('cartCount');
      this.cartBodyEl = document.getElementById('cartBody');
      this.cartFooterEl = document.getElementById('cartFooter');
      this.cartTotalEl = document.getElementById('cartTotal');

      this.bindFloatingCart();
      this.render();
    },

    add(id, title, price, variants = {}) {
      let existing = this.items.find(item =>
        item.id === id && JSON.stringify(item.variants) === JSON.stringify(variants)
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({
          id,
          title,
          price,
          variants,
          quantity: 1
        });
      }

      this.render();
    },

    remove(index) {
      if (index < 0 || index >= this.items.length) return;
      this.items.splice(index, 1);
      this.render();
    },

    updateQuantity(index, qty) {
      if (index < 0 || index >= this.items.length) return;
      this.items[index].quantity = qty;
      if (qty <= 0) this.remove(index);
      else this.render();
    },

    getTotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    render() {
      // Empty the body first
      this.cartBodyEl.innerHTML = '';

      if (this.items.length === 0) {
        document.getElementById('emptyCartMessage').style.display = 'block';
        this.cartFooterEl.style.display = 'none';
        this.updateFloatingCount();
        return;
      }

      document.getElementById('emptyCartMessage').style.display = 'none';
      this.cartFooterEl.style.display = 'block';

      this.items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'd-flex justify-content-between align-items-center mb-3';
        row.innerHTML = `
          <div>
            <strong>${item.title}</strong>
            ${this.renderVariants(item.variants)}
            <div class="text-muted">Price: ${item.price} ${window.FUSION_CONFIG.settings.currency_symbol}</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary qty-decrease">-</button>
            <span>${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary qty-increase">+</button>
            <button class="btn btn-sm btn-outline-danger remove-item"><i class="bi bi-trash"></i></button>
          </div>
        `;

        // Bind actions
        row.querySelector('.qty-increase').addEventListener('click', () => {
          this.updateQuantity(idx, item.quantity + 1);
        });
        row.querySelector('.qty-decrease').addEventListener('click', () => {
          this.updateQuantity(idx, item.quantity - 1);
        });
        row.querySelector('.remove-item').addEventListener('click', () => {
          this.remove(idx);
        });

        this.cartBodyEl.appendChild(row);
      });

      // Update total
      this.cartTotalEl.textContent = `${this.getTotal()} ${window.FUSION_CONFIG.settings.currency_symbol}`;
      this.updateFloatingCount();
    },

    renderVariants(variants) {
      if (!variants || Object.keys(variants).length === 0) return '';
      return `<div class="text-muted small">
        ${Object.entries(variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
      </div>`;
    },

    updateFloatingCount() {
      const count = this.items.reduce((sum, i) => sum + i.quantity, 0);
      const el = document.getElementById('floatingCartCount');
      if (el) el.textContent = count;
      if (this.cartCountEl) this.cartCountEl.textContent = count;
    },

    /**
     * WhatsApp Checkout
     */
    checkout() {
      if (this.items.length === 0) return alert('Cart is empty');

      const phone = document.getElementById('customerPhone')?.value || window.FUSION_CONFIG.settings.contact_whatsapp;
      const name = document.getElementById('customerName')?.value || '';
      const address = document.getElementById('customerAddress')?.value || '';

      let msg = `Hello, I want to place an order:%0A`;
      this.items.forEach(item => {
        msg += `- ${item.title}`;
        if (item.variants) {
          msg += ` (${Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(', ')})`;
        }
        msg += ` x${item.quantity} => ${item.price * item.quantity} ${window.FUSION_CONFIG.settings.currency_symbol}%0A`;
      });
      msg += `%0ATotal: ${this.getTotal()} ${window.FUSION_CONFIG.settings.currency_symbol}%0A`;
      if (name) msg += `Name: ${name}%0A`;
      if (address) msg += `Address: ${address}%0A`;
      msg += `Phone: ${phone}`;

      const waUrl = `https://wa.me/${window.FUSION_CONFIG.settings.contact_whatsapp}?text=${msg}`;
      window.open(waUrl, '_blank');
    },

    bindFloatingCart() {
      const checkoutBtn = document.getElementById('confirmCheckout');
      if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.checkout());

      const cartIcon = document.getElementById('cartIcon');
      const sidebar = document.getElementById('cartSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      const closeBtn = document.getElementById('closeCart');

      const toggleSidebar = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      };

      if (cartIcon) cartIcon.addEventListener('click', toggleSidebar);
      if (overlay) overlay.addEventListener('click', toggleSidebar);
      if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

      const floatingBtn = document.getElementById('floatingCart');
      if (floatingBtn) floatingBtn.addEventListener('click', toggleSidebar);
    }
  };

  // Expose globally
  window.CartModule = CartModule;

  document.addEventListener('runtime_ready', () => CartModule.init());

})();
