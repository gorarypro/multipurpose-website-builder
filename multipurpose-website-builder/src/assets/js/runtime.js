/**
 * FUSION ENGINE v16.6.4 - Complete Runtime Logic
 * Reconstructed to fix "FUSION_CONFIG not found" error.
 */

// 1. SYSTEM INITIALIZATION & CHECK
(function() {
  'use strict';

  // Check if config exists
  if (typeof window.FUSION_CONFIG === 'undefined') {
    console.error('Fusion: Critical Error - FUSION_CONFIG not found.');
    // Attempt to recover gracefully or stop
    return;
  }

  console.log('Fusion: System check initiated...');

  // 2. LOAD SETTINGS & GLOBAL OBJECTS
  var settings = window.FUSION_CONFIG;
  var textMapping = window.FUSION_TEXTMAPPING || {};
  
  var Fusion = window.FUSION = window.FUSION || {};

  // 3. I18N HELPER
  Fusion.i18n = {
    lang: settings.default_language || 'en',
    get: function(key) {
      var entry = textMapping[key];
      return entry ? (entry[this.lang] || entry.en || key) : key;
    },
    switch: function(l) {
      this.lang = l;
      // Update page elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        el.innerText = Fusion.i18n.get(key);
      });
      // RTL handling
      document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', l);
    }
  };

  // 4. CATALOG (Product Store)
  // This ensures Fusion.Catalog exists for Wishlist to work
  Fusion.Catalog = {
    products: [],
    load: function(feedUrl) {
      fetch(feedUrl)
        .then(res => res.json())
        .then(data => {
          var entries = data.feed.entry;
          if (entries) {
            this.products = entries.map(function(entry) {
              var content = entry.content.$t;
              // Simple parser to extract price from post content
              var priceMatch = content.match(/price[\s:]+([\d.]+)/i);
              var price = priceMatch ? priceMatch[1] : '0.00';
              
              // Extract Image
              var imgMatch = content.match(/src="([^"]+)"/i);
              var img = imgMatch ? imgMatch[1] : 'https://via.placeholder.com/150';

              return {
                id: entry.id.$t, // Use Atom ID
                title: entry.title.$t,
                price: price + (settings.currency_symbol || ''),
                image: img,
                link: entry.link.find(l => l.rel === 'alternate').href
              };
            });
            Fusion.Wishlist.render(); // Re-render wishlist if catalog loads late
          }
        })
        .catch(err => console.error('Failed to load catalog', err));
    }
  };

  // 5. CART LOGIC
  Fusion.Cart = {
    items: [],
    init: function() {
      var saved = localStorage.getItem('fusion_cart');
      if (saved) this.items = JSON.parse(saved);
      this.updateUI();
    },
    persist: function() {
      localStorage.setItem('fusion_cart', JSON.stringify(this.items));
      this.updateUI();
    },
    add: function(id) {
      var existing = this.items.find(i => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        // Try to find in Catalog first
        var product = Fusion.Catalog.products.find(p => p.id === id);
        // Fallback: Create generic item
        this.items.push({
          id: id,
          title: product ? product.title : 'Product ' + id,
          price: product ? product.price : '0.00',
          image: product ? product.image : '',
          qty: 1
        });
      }
      this.persist();
    },
    
    // --- YOUR PASTED CART LOGIC (Incorporated) ---
    updateUI: function() {
      // 1. Update Global Counters
      var totalQty = this.items.reduce(function(sum, item) { return sum + item.qty; }, 0);
      var cartCountEl = document.getElementById('cartCount');
      var floatingCountEl = document.getElementById('floatingCartCount');
      
      if (cartCountEl) {
          cartCountEl.textContent = totalQty;
          cartCountEl.style.display = totalQty > 0 ? 'inline-block' : 'none';
      }
      if (floatingCountEl) {
          floatingCountEl.textContent = totalQty;
      }

      // 2. Render Cart Modal Items
      var listContainer = document.getElementById('cartItemsList');
      var checkoutSec = document.getElementById('checkoutSection');
      var confirmBtn = document.getElementById('confirmCheckoutBtn');
      var totalEl = document.getElementById('cartTotal');
      
      if (!listContainer) return;

      if (this.items.length === 0) {
          listContainer.innerHTML = '<div class="text-center py-5"><i class="bi bi-cart-x display-1 text-light mb-3"></i><p class="text-muted">Your cart is empty.</p></div>';
          if (checkoutSec) checkoutSec.style.display = 'none';
          if (confirmBtn) confirmBtn.disabled = true;
          if (totalEl) totalEl.textContent = '0.00 ' + (settings.currency_symbol || 'DH');
      } else {
          var grandTotal = 0;
          listContainer.innerHTML = this.items.map(function(item) {
              // Calculate numeric price for total
              var numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
              grandTotal += (numericPrice * item.qty);

              return '<div class="cart-item"><img src="' + item.image + '" class="cart-item-img me-3"><div class="flex-grow-1"><h6 class="mb-0 fw-bold small">' + item.title + '</h6><span class="text-primary small fw-bold">' + item.price + '</span></div><div class="quantity-control me-3"><button class="btn btn-sm btn-link text-dark py-0" onclick="Fusion.Cart.changeQty(\'' + item.id + '\', -1)"><i class="bi bi-dash"></i></button><span class="px-2 small fw-bold">' + item.qty + '</span><button class="btn btn-sm btn-link text-dark py-0" onclick="Fusion.Cart.changeQty(\'' + item.id + '\', 1)"><i class="bi bi-plus"></i></button></div><button class="btn btn-sm text-danger p-0" onclick="Fusion.Cart.remove(\'' + item.id + '\')"><i class="bi bi-trash"></i></button></div>';
          }).join('');

          if (checkoutSec) checkoutSec.style.display = 'block';
          if (confirmBtn) confirmBtn.disabled = false;
          if (totalEl) totalEl.textContent = grandTotal.toFixed(2) + ' ' + (settings.currency_symbol || 'DH');
      }
    },

    changeQty: function(id, delta) {
      var item = this.items.find(function(i) { return i.id === id; });
      if (item) {
          item.qty += delta;
          if (item.qty <= 0) {
              this.remove(id);
          } else {
              this.persist();
          }
      }
    },

    remove: function(id) {
      this.items = this.items.filter(function(i) { return i.id !== id; });
      this.persist();
    }
  };

  // 6. WISHLIST LOGIC
  Fusion.Wishlist = {
    items: [],
    init: function() {
      var saved = localStorage.getItem('fusion_wishlist');
      if (saved) this.items = JSON.parse(saved);
      this.render();
    },
    persist: function() {
      localStorage.setItem('fusion_wishlist', JSON.stringify(this.items));
    },
    toggle: function(id) {
      var index = this.items.indexOf(id);
      if (index > -1) {
        this.items.splice(index, 1); // Remove
      } else {
        this.items.push(id); // Add
      }
      this.persist();
      this.render();
    },
    
    // --- YOUR PASTED WISHLIST LOGIC (Incorporated) ---
    render: function() {
      var listContainer = document.getElementById('wishlistItemsList');
      if (!listContainer) return;

      if (this.items.length === 0) {
          listContainer.innerHTML = '<div class="text-center py-5"><i class="bi bi-balloon-heart display-1 text-light mb-3"></i><p class="text-muted">No items saved yet.</p></div>';
      } else {
          listContainer.innerHTML = this.items.map(function(id) {
              // Find product details from Catalog
              var product = Fusion.Catalog.products.find(function(p) { return p.id === id; });
              if (!product) return '';

              return '<div class="wishlist-item"><div class="wishlist-item-info"><img src="' + product.image + '"><div><h6 class="mb-0 fw-bold small text-truncate" style="max-width: 150px;">' + product.title + '</h6><span class="text-primary small fw-bold">' + product.price + '</span></div></div><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-danger border-0" onclick="Fusion.Wishlist.toggle(\'' + product.id + '\')"><i class="bi bi-trash"></i></button><button class="btn btn-sm btn-primary rounded-pill px-3" onclick="Fusion.Cart.add(\'' + product.id + '\')"><i class="bi bi-cart-plus"></i></button></div></div>';
          }).join('');
      }
    }
  };

  // 7. BOOTSTRAP
  // Initialize all systems on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      Fusion.Cart.init();
      Fusion.Wishlist.init();
      if (settings.blogger_feed_url) {
        Fusion.Catalog.load(settings.blogger_feed_url);
      }
    });
  } else {
    Fusion.Cart.init();
    Fusion.Wishlist.init();
    if (settings.blogger_feed_url) {
      Fusion.Catalog.load(settings.blogger_feed_url);
    }
  }

})();
