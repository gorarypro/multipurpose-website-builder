/**
 * FUSION v10.8.0 - cart.js
 * Shopping Cart Logic & Spreadsheet Integration Engine
 * Role: Manages persistent state and order submission to GAS API.
 */

const CartModule = {
  items: [],
  storageKey: 'fusion_cart_v10',
  settings: {},

  /**
   * Initialize the cart on page load
   */
  init: function(syncedSettings) {
    console.log("Cart: Initializing Commerce Engine...");
    this.settings = syncedSettings || window.FUSION_CONFIG.settings;
    
    // Load existing items from browser memory
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        console.error("Cart: Error parsing storage. Resetting.");
        this.items = [];
      }
    }
    
    this.refreshUI();
    this.bindEvents();
  },

  /**
   * Add a product to the selection
   */
  add: function(id, title, price) {
    const existing = this.items.find(i => i.id === id);
    
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({
        id: id,
        title: title,
        price: parseFloat(price),
        qty: 1
      });
    }
    
    this.save();
    this.showToast(`${title} ajouté au panier !`);
  },

  /**
   * Remove or decrement an item
   */
  remove: function(index) {
    this.items.splice(index, 1);
    this.save();
  },

  updateQty: function(index, delta) {
    this.items[index].qty += delta;
    if (this.items[index].qty <= 0) {
      this.remove(index);
    } else {
      this.save();
    }
  },

  /**
   * Commit state to LocalStorage and update visuals
   */
  save: function() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    this.refreshUI();
  },

  /**
   * Master UI Sync: Updates counters and sidebar content
   */
  refreshUI: function() {
    const totalCount = this.items.reduce((acc, i) => acc + i.qty, 0);
    const totalPrice = this.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const currency = this.settings.currency_symbol || 'DH';

    // 1. Update Badge Counters
    const badges = ['cartCount', 'floatingCartCount'];
    badges.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = totalCount;
    });

    // 2. Render Sidebar/Modal Content
    const body = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const totalDisplay = document.getElementById('cartTotal');

    if (!body) return;

    if (this.items.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (footer) footer.style.display = 'none';
      body.innerHTML = '';
    } else {
      if (emptyMsg) emptyMsg.style.display = 'none';
      if (footer) footer.style.display = 'block';
      if (totalDisplay) totalDisplay.textContent = `${totalPrice} ${currency}`;

      body.innerHTML = this.items.map((item, idx) => `
        <div class="cart-item d-flex align-items-center mb-3 pb-3 border-bottom">
          <div class="flex-grow-1">
            <div class="fw-bold small text-truncate" style="max-width: 150px;">${item.title}</div>
            <div class="text-muted small">${item.price} ${currency}</div>
          </div>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary px-2" onclick="CartModule.updateQty(${idx}, -1)">-</button>
            <span class="mx-2 fw-bold">${item.qty}</span>
            <button class="btn btn-sm btn-outline-secondary px-2" onclick="CartModule.updateQty(${idx}, 1)">+</button>
            <button class="btn btn-sm text-danger ms-2" onclick="CartModule.remove(${idx})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  },

  /**
   * Order Submission Phase
   */
  openCheckout: function() {
    const modal = document.getElementById('phoneModal');
    if (modal) {
      // Logic for Bootstrap 5 Modal toggle
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  },

  submitOrder: function() {
    const phone = document.getElementById('customerPhone').value;
    const name = document.getElementById('customerName').value;
    const addr = document.getElementById('customerAddress').value;

    if (!phone) {
      alert("Le numéro de téléphone est obligatoire.");
      return;
    }

    const payload = {
      type: 'Blogger Order',
      name: name || 'Client Anonyme',
      phone: phone,
      address: addr || 'Non fournie',
      items: this.items,
      total: this.items.reduce((acc, i) => acc + (i.price * i.qty), 0)
    };

    const btnText = document.getElementById('checkoutButtonText');
    const loader = document.getElementById('checkoutLoading');
    if (btnText) btnText.style.display = 'none';
    if (loader) loader.style.display = 'inline-block';

    // Using JSONP to tunnel data to Google Apps Script
    const apiBase = (window.FUSION_CONFIG && window.FUSION_CONFIG.apiUrl) || window.BASE_SCRIPT_URL;
    const script = document.createElement('script');
    script.src = `${apiBase}?action=saveEntry&entry=${encodeURIComponent(JSON.stringify(payload))}&callback=CartModule.onOrderSuccess`;
    document.body.appendChild(script);
  },

  onOrderSuccess: function(res) {
    if (res.status === 'success') {
      alert(this.settings.order_success_msg || "Commande envoyée avec succès !");
      this.items = [];
      this.save();
      location.reload();
    } else {
      alert("Erreur lors de l'envoi : " + res.message);
    }
  },

  /**
   * Component Event Binding
   */
  bindEvents: function() {
    const cartBtn = document.getElementById('cartIcon');
    const floatBtn = document.getElementById('floatingCart');
    const closeBtn = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('confirmCheckout');

    const toggleCart = () => {
      document.getElementById('cartSidebar').classList.toggle('active');
      document.getElementById('sidebarOverlay').classList.toggle('active');
    };

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (floatBtn) floatBtn.addEventListener('click', toggleCart);
    if (closeBtn) closeBtn.addEventListener('click', toggleCart);
    
    // Direct trigger for the Checkout process
    const procBtn = document.getElementById('checkoutBtn');
    if (procBtn) procBtn.addEventListener('click', () => this.openCheckout());
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.submitOrder());
  },

  showToast: function(msg) {
    console.log("Toast: " + msg);
    // You can implement your own Bootstrap toast logic here if needed
  }
};
