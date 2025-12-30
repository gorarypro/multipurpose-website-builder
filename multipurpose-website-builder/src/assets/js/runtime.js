/**
 * FUSION ENGINE v16.8.1 - Runtime Logic (Hybrid Catalog Loading)
 * Updated to use injected FUSION_CATALOG to bypass CORS.
 */

// Extend Fusion object
Fusion.Catalog = {
  products: [],
  load: function(feedUrl) {
    // 1. CHECK FOR INJECTED DATA (No CORS, Instant Load)
    if (typeof window.FUSION_CATALOG !== 'undefined' && window.FUSION_CATALOG.length > 0) {
      console.log('Fusion: Loading catalog from injected JSON...');
      this.products = window.FUSION_CATALOG;
      Fusion.Wishlist.render();
      return; // Stop here, don't fetch
    }

    // 2. FALLBACK TO FETCH (If no injected data)
    console.log('Fusion: No injected catalog. Fetching from URL...');
    fetch(feedUrl)
      .then(res => res.json())
      .then(data => {
        var entries = data.feed.entry;
        if (entries) {
          this.products = entries.map(function(entry) {
            var content = entry.content.$t;
            var priceMatch = content.match(/price[\s:]+([\d.]+)/i);
            var price = priceMatch ? priceMatch[1] : '0.00';
            var imgMatch = content.match(/src="([^"]+)"/i);
            var img = imgMatch ? imgMatch[1] : 'https://via.placeholder.com/150';
            return {
              id: entry.id.$t,
              title: entry.title.$t,
              price: price + (window.FUSION_CONFIG.currency_symbol || ''),
              image: img,
              link: entry.link.find(l => l.rel === 'alternate').href
            };
          });
          Fusion.Wishlist.render();
        }
      })
      .catch(err => console.error('Failed to load catalog', err));
  }
};

// ... (Keep Cart and Wishlist logic exactly as it was before) ...
Fusion.Cart.updateUI = function() {
    const totalQty = this.items.reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = document.getElementById('cartCount');
    const floatingCountEl = document.getElementById('floatingCartCount');
    
    if (cartCountEl) {
        cartCountEl.textContent = totalQty;
        cartCountEl.style.display = totalQty > 0 ? 'inline-block' : 'none';
    }
    if (floatingCountEl) {
        floatingCountEl.textContent = totalQty;
    }

    const listContainer = document.getElementById('cartItemsList');
    const checkoutSec = document.getElementById('checkoutSection');
    const confirmBtn = document.getElementById('confirmCheckoutBtn');
    const totalEl = document.getElementById('cartTotal');
    
    if (!listContainer) return;

    if (this.items.length === 0) {
        listContainer.innerHTML = '<div class="text-center py-5"><i class="bi bi-cart-x display-1 text-light mb-3"></i><p class="text-muted">Your cart is empty.</p></div>';
        if (checkoutSec) checkoutSec.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = true;
        if (totalEl) totalEl.textContent = '0.00 ' + (window.FUSION_CONFIG.currency_symbol || 'DH');
    } else {
        let grandTotal = 0;
        listContainer.innerHTML = this.items.map(item => {
            const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            grandTotal += (numericPrice * item.qty);

            return '<div class="cart-item"><img src="' + item.image + '" class="cart-item-img me-3"><div class="flex-grow-1"><h6 class="mb-0 fw-bold small">' + item.title + '</h6><span class="text-primary small fw-bold">' + item.price + '</span></div><div class="quantity-control me-3"><button class="btn btn-sm btn-link text-dark py-0" onclick="Fusion.Cart.changeQty(\'' + item.id + '\', -1)"><i class="bi bi-dash"></i></button><span class="px-2 small fw-bold">' + item.qty + '</span><button class="btn btn-sm btn-link text-dark py-0" onclick="Fusion.Cart.changeQty(\'' + item.id + '\', 1)"><i class="bi bi-plus"></i></button></div><button class="btn btn-sm text-danger p-0" onclick="Fusion.Cart.remove(\'' + item.id + '\')"><i class="bi bi-trash"></i></button></div>';
        }).join('');

        if (checkoutSec) checkoutSec.style.display = 'block';
        if (confirmBtn) confirmBtn.disabled = false;
        if (totalEl) totalEl.textContent = grandTotal.toFixed(2) + ' ' + (window.FUSION_CONFIG.currency_symbol || 'DH');
    }
};

Fusion.Cart.changeQty = function(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            this.remove(id);
        } else {
            this.persist();
        }
    }
};

Fusion.Cart.remove = function(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.persist();
};

Fusion.Wishlist.render = function() {
    const listContainer = document.getElementById('wishlistItemsList');
    if (!listContainer) return;

    if (this.items.length === 0) {
        listContainer.innerHTML = '<div class="text-center py-5"><i class="bi bi-balloon-heart display-1 text-light mb-3"></i><p class="text-muted">No items saved yet.</p></div>';
    } else {
        listContainer.innerHTML = this.items.map(id => {
            const product = Fusion.Catalog.products.find(p => p.id === id);
            if (!product) return '';

            return '<div class="wishlist-item"><div class="wishlist-item-info"><img src="' + product.image + '"><div><h6 class="mb-0 fw-bold small text-truncate" style="max-width: 150px;">' + product.title + '</h6><span class="text-primary small fw-bold">' + product.price + '</span></div></div><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-danger border-0" onclick="Fusion.Wishlist.toggle(\'' + product.id + '\')"><i class="bi bi-trash"></i></button><button class="btn btn-sm btn-primary rounded-pill px-3" onclick="Fusion.Cart.add(\'' + product.id + '\')"><i class="bi bi-cart-plus"></i></button></div></div>';
        }).join('');
    }
};

// INITIALIZATION LOGIC
(function() {
    'use strict';
    if (typeof window.FUSION_CONFIG === 'undefined') {
      console.error('Fusion: Critical Error - FUSION_CONFIG not found.');
      return;
    }
    
    var settings = window.FUSION_CONFIG;
    
    // Check for Config
    if (typeof window.FUSION_CONFIG === 'undefined') {
        console.error('Fusion: Critical Error - FUSION_CONFIG not found.');
        return;
    }

    var textMapping = window.FUSION_TEXTMAPPING || {};
    var Fusion = window.FUSION = window.FUSION || {};

    // I18N
    Fusion.i18n = {
      lang: settings.default_language || 'en',
      get: function(key) {
        var entry = textMapping[key];
        return entry ? (entry[this.lang] || entry.en || key) : key;
      },
      switch: function(l) {
        this.lang = l;
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
          var key = el.getAttribute('data-i18n');
          el.innerText = Fusion.i18n.get(key);
        });
        document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
      }
    };

    // CART
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
          var product = Fusion.Catalog.products.find(p => p.id === id);
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
      changeQty: function(id, delta) {
        var item = this.items.find(i => i.id === id);
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
        this.items = this.items.filter(i => i.id !== id);
        this.persist();
      },
      updateUI: Fusion.Cart.updateUI 
    };

    // WISHLIST
    Fusion.Wishlist = {
      items: [],
      init: function() {
        var saved = localStorage.getItem('fusion_wishlist');
        if (saved) this.items = JSON.parse(saved);
        this.render();
      },
      persist: function() {
        localStorage.setItem('fusion_wishlist', JSON.stringify(this.items));
        this.render();
      },
      toggle: function(id) {
        var index = this.items.indexOf(id);
        if (index > -1) {
          this.items.splice(index, 1);
        } else {
          this.items.push(id);
        }
        this.persist();
      },
      render: Fusion.Wishlist.render
    };

    // BOOTSTRAP
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
