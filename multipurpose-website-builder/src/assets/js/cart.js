/**
 * FUSION v6.7.1 - cart.js
 * Shopping Cart Logic & Spreadsheet Tunneling
 */

const CartModule = {
  items: [],

  init: function() {
    const saved = localStorage.getItem('fusion_cart_v6');
    if (saved) this.items = JSON.parse(saved);
    this.refreshUI();
  },

  add: function(id, title, price) {
    const existing = this.items.find(i => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ id, title, price, qty: 1 });
    }
    this.saveAndSync();
  },

  remove: function(index) {
    this.items.splice(index, 1);
    this.saveAndSync();
  },

  saveAndSync: function() {
    localStorage.setItem('fusion_cart_v6', JSON.stringify(this.items));
    this.refreshUI();
  },

  refreshUI: function() {
    const count = this.items.reduce((acc, i) => acc + i.qty, 0);
    const total = this.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const currency = Fusion.settings.currency_symbol || 'DH';

    // Update Badges
    ['cartCount', 'floatingCartCount'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    });

    // Update Total
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `${total} ${currency}`;

    this.renderModal();
  },

  renderModal: function() {
    const container = document.getElementById('cartContent');
    const fields = document.getElementById('checkoutFields');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `<div class="text-center p-4 text-muted">Votre panier est vide.</div>`;
      if (fields) fields.style.display = 'none';
      return;
    }

    if (fields) fields.style.display = 'block';
    container.innerHTML = this.items.map((item, idx) => `
      <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <div>
          <div class="fw-bold">${item.title}</div>
          <small class="text-muted">${item.qty} x ${item.price}</small>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="CartModule.remove(${idx})">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `).join('');
  },

  /**
   * Final Submission to Google Apps Script
   */
  submitOrder: function() {
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const msg = document.getElementById('checkoutMessage').value;

    if (!name || !phone) {
      alert("Veuillez remplir votre nom et votre numéro de téléphone.");
      return;
    }

    const payload = {
      type: 'order',
      name: name,
      phone: phone,
      message: msg,
      items: this.items,
      total: this.items.reduce((acc, i) => acc + (i.price * i.qty), 0)
    };

    const apiBase = window.BASE_SCRIPT_URL;
    const script = document.createElement('script');
    // Using saveEntry action from Code.gs
    script.src = `${apiBase}?action=saveEntry&entry=${encodeURIComponent(JSON.stringify(payload))}&callback=CartModule.onOrderSuccess`;
    document.body.appendChild(script);
  },

  onOrderSuccess: function(res) {
    if (res.status === 'success') {
      alert(Fusion.settings.order_success_msg || "Commande reçue !");
      CartModule.items = [];
      CartModule.saveAndSync();
      location.reload();
    } else {
      alert("Erreur: " + res.message);
    }
  }
};

// Global Listener for Checkout Button
document.addEventListener('click', e => {
  if (e.target && e.target.id === 'checkoutButton') CartModule.submitOrder();
});
