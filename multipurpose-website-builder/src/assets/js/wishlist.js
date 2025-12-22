/**
 * FUSION v10.8.0 - wishlist.js
 * Persistent Favorites & Social Signals Engine
 * Role: Manages "Save for Later" state using LocalStorage and UI synchronization.
 */

const WishlistModule = {
  items: [],
  storageKey: 'fusion_wishlist_v10',
  settings: {},

  /**
   * Initialize the module and load persisted data.
   */
  init: function(syncedSettings) {
    console.log("Wishlist: Initializing Favorites Engine...");
    this.settings = syncedSettings || (window.FUSION_CONFIG ? window.FUSION_CONFIG.settings : {});

    // Load from browser memory with safety catch
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Wishlist: Corrupted storage detected. Resetting favorites.");
      this.items = [];
    }

    this.refreshUI();
    this.bindGlobalEvents();
  },

  /**
   * Toggles an item's presence in the list.
   * Called primarily from the heart icons on product cards.
   */
  toggle: function(productId) {
    if (!window.ProductsModule) return;

    const index = this.items.findIndex(item => String(item.id) === String(productId));

    if (index >= 0) {
      // Item exists, so remove it
      this.items.splice(index, 1);
    } else {
      // Find full product data in the catalog cache to save rich details
      const product = window.ProductsModule.catalog.find(p => String(p.id) === String(productId));
      if (product) {
        this.items.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image
        });
      }
    }

    this.save();
  },

  /**
   * Removes an item by ID directly (used in the Wishlist Sidebar/Modal).
   */
  removeById: function(productId) {
    this.items = this.items.filter(item => String(item.id) !== String(productId));
    this.save();
  },

  /**
   * Persists state to LocalStorage and triggers UI updates.
   */
  save: function() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    this.refreshUI();
  },

  /**
   * Master UI Synchronization: Updates badges, sidebar, and card icons.
   */
  refreshUI: function() {
    this.updateBadges();
    this.updateCardIcons();
    this.renderContainer();
  },

  /**
   * Updates count badges across the site (Header and Floating buttons).
   */
  updateBadges: function() {
    const count = this.items.length;
    const badgeIds = ['wishlistCount', 'floatingWishlistCount'];
    
    badgeIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(count);
    });
  },

  /**
   * Visual Feedback: Updates heart icons on the product grid.
   */
  updateCardIcons: function() {
    const allCards = document.querySelectorAll('.product-card, [data-id]');
    
    allCards.forEach(card => {
      const id = card.getAttribute('data-id');
      const heartIcon = card.querySelector('.btn-wishlist i, .wishlist-toggle i');
      
      if (heartIcon) {
        const isFavorited = this.items.some(item => String(item.id) === String(id));
        if (isFavorited) {
          heartIcon.classList.replace('bi-heart', 'bi-heart-fill');
          heartIcon.classList.add('text-danger');
        } else {
          heartIcon.classList.replace('bi-heart-fill', 'bi-heart');
          heartIcon.classList.remove('text-danger');
        }
      }
    });
  },

  /**
   * Renders the wishlist list into the sidebar or modal container.
   */
  renderContainer: function() {
    const container = document.getElementById('wishlistBody') || document.getElementById('wishlistContent');
    const emptyMsg = document.getElementById('wishlistEmpty') || document.getElementById('emptyWishlistMessage');
    
    if (!container) return;

    if (this.items.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    const currency = this.settings.currency_symbol || 'DH';

    container.innerHTML = this.items.map(item => `
      <div class="wishlist-item d-flex align-items-center mb-3 pb-3 border-bottom animate-fadeIn">
        <img src="${item.image}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" alt="${item.title}">
        <div class="ms-3 flex-grow-1">
          <div class="fw-bold small text-truncate" style="max-width: 140px;">${item.title}</div>
          <div class="text-primary small fw-bold">${item.price} ${currency}</div>
        </div>
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-primary rounded-pill me-2" 
                  onclick="CartModule.add('${item.id}', '${item.title.replace(/'/g, "\\'")}', ${item.price})">
            <i class="bi bi-cart-plus"></i>
          </button>
          <button class="btn btn-sm text-danger" onclick="WishlistModule.removeById('${item.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  /**
   * Binds global UI triggers like opening the wishlist sidebar.
   */
  bindGlobalEvents: function() {
    const triggers = ['wishlistIcon', 'floatingWishlist'];
    
    triggers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          const sidebar = document.getElementById('wishlistSidebar');
          if (sidebar) {
            sidebar.classList.toggle('active');
            const overlay = document.getElementById('sidebarOverlay');
            if (overlay) overlay.classList.toggle('active');
          }
        });
      }
    });

    const closeBtn = document.getElementById('closeWishlist');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('wishlistSidebar').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
      });
    }
  }
};

/**
 * Global Initialization Logic
 */
document.addEventListener('runtime_ready', function(e) {
  WishlistModule.init(e.detail);
});

// Fallback for direct loading scenarios
if (document.readyState === 'complete') {
  setTimeout(() => { if (!WishlistModule.isReady) WishlistModule.init(); }, 1000);
}
