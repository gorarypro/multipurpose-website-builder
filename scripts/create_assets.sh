#!/usr/bin/env bash
# scripts/create_assets.sh
# Creates CSS and JS assets

set -euo pipefail

ROOT_DIR="${1:-multipurpose-website-builder}"
echo "🎨 [assets] Using root: $ROOT_DIR"

CSS_DIR="$ROOT_DIR/src/assets/css"
JS_DIR="$ROOT_DIR/src/assets/js"

mkdir -p "$CSS_DIR" "$JS_DIR"

########################################
# CSS
########################################

cat > "$CSS_DIR/theme-base.css" << 'EOF'
/* Core theme styles */
body.theme-body {
  background-color: #ffffff;
  color: #212529;
}
.product-card {
  transition: transform .15s ease, box-shadow .15s ease;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.08);
}
EOF

cat > "$CSS_DIR/rtl.css" << 'EOF'
/* Simple RTL adjustments */
[dir="rtl"] body {
  direction: rtl;
  text-align: right;
}
[dir="rtl"] .navbar .navbar-nav {
  margin-left: 0;
  margin-right: auto;
}
EOF

cat > "$CSS_DIR/animations.css" << 'EOF'
.fade-in {
  opacity: 0;
  animation: fadeIn .4s forwards;
}
@keyframes fadeIn {
  to { opacity: 1; }
}
.slide-up {
  transform: translateY(10px);
  opacity: 0;
  animation: slideUp .35s forwards;
}
@keyframes slideUp {
  to { transform: translateY(0); opacity: 1; }
}
EOF

cat > "$CSS_DIR/gallery.css" << 'EOF'
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
}
EOF

cat > "$CSS_DIR/buttons.css" << 'EOF'
.btn-pill {
  border-radius: 999px;
}
.btn-soft-primary {
  background-color: rgba(13,110,253,.08);
  color: #0d6efd;
  border-color: transparent;
}
.btn-soft-primary:hover {
  background-color: rgba(13,110,253,.16);
}
EOF

cat > "$CSS_DIR/forms.css" << 'EOF'
.form-control.is-invalid {
  border-color: #dc3545;
}
.form-control.is-valid {
  border-color: #28a745;
}
EOF

########################################
# JS RUNTIME
########################################

# runtime.js
cat > "$JS_DIR/runtime.js" << 'EOF'
/**
 * Core runtime engine.
 * NOTE: Set BASE_SCRIPT_URL to your deployed Apps Script web app URL.
 */
const BASE_SCRIPT_URL = 'https://script.google.com/macros/s/PUT_YOUR_DEPLOYMENT_ID/exec';

window.Runtime = {
  settings: null,
  textMap: null,
  products: [],
  init: async function() {
    try {
      await this.loadSettings();
      await this.loadTextMap();
      await this.loadProducts();
      I18n.init(this.textMap, this.settings);
      Products.renderGrid(this.products, this.settings);
      Cart.init();
      Wishlist.init();
      Popup.init(this.settings);
      LazyLoad.init();
      Analytics.init(this.settings);
      SEO.applyBasic(this.settings);
    } catch (err) {
      console.error('Runtime init error', err);
    }
  },
  fetchJson: async function(action, extraParams) {
    const params = new URLSearchParams({ action, ...(extraParams || {}) });
    const url = BASE_SCRIPT_URL + '?' + params.toString();
    const res = await fetch(url, { method: 'GET' });
    return res.json();
  },
  loadSettings: async function() {
    const res = await this.fetchJson('getSettings');
    this.settings = res.settings || {};
  },
  loadTextMap: async function() {
    const res = await this.fetchJson('getTextMap');
    this.textMap = res.map || {};
  },
  loadProducts: async function() {
    const res = await this.fetchJson('getProducts');
    this.products = res.items || [];
  },
  saveEntry: async function(entry) {
    const res = await this.fetchJson('saveEntry', { entry: JSON.stringify(entry) });
    return res;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.Runtime !== 'undefined') {
    window.Runtime.init();
  }
});
EOF

# products.js
cat > "$JS_DIR/products.js" << 'EOF'
/**
 * Product rendering + filtering + sorting
 */
window.Products = {
  current: [],
  renderGrid(products, settings) {
    this.current = products || [];
    this.settings = settings || {};
    const grid = document.getElementById('productGrid');
    const empty = document.getElementById('productsEmpty');
    if (!grid) return;
    grid.innerHTML = '';
    if (!this.current.length) {
      if (empty) empty.classList.remove('d-none');
      return;
    }
    if (empty) empty.classList.add('d-none');

    this.current.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card h-100 product-card" data-id="${p.id}">
          <img src="${p.image || ''}" class="card-img-top" alt="${p.title || ''}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1">${p.title || ''}</h5>
            <p class="card-text small text-muted flex-grow-1"></p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="fw-bold product-price">${Currency.format(p.price, settings)}</span>
              <button class="btn btn-sm btn-primary add-to-cart-btn">+</button>
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
    });

    grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.product-card');
        const id = card.getAttribute('data-id');
        const product = this.current.find(p => p.id === id);
        if (product) {
          Cart.add(product, 1);
        }
      });
    });
  }
};
EOF

# variants.js
cat > "$JS_DIR/variants.js" << 'EOF'
/**
 * Variants from labels (e.g., "Size:M", "Color:Red")
 */
window.Variants = {
  fromLabels(labels) {
    const map = {};
    (labels || []).forEach(label => {
      const idx = label.indexOf(':');
      if (idx <= 0) return;
      const group = label.slice(0, idx).trim();
      const option = label.slice(idx + 1).trim();
      if (!map[group]) map[group] = [];
      if (!map[group].includes(option)) map[group].push(option);
    });
    return map;
  }
};
EOF

# i18n.js
cat > "$JS_DIR/i18n.js" << 'EOF'
/**
 * Simple text mapping + RTL helper
 */
window.I18n = {
  map: {},
  settings: {},
  activeLang: 'default',
  init(map, settings) {
    this.map = map || {};
    this.settings = settings || {};
    this.activeLang = settings.default_language || 'en';
    this.applyDir();
    this.replaceText();
  },
  t(key) {
    const entry = this.map[key];
    if (!entry) return key;
    return entry[this.activeLang] || entry.default || key;
  },
  applyDir() {
    const rtlLangs = ['ar', 'he', 'fa', 'ur'];
    const dir = rtlLangs.includes(this.activeLang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  },
  replaceText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
  }
};
EOF

# cart.js
cat > "$JS_DIR/cart.js" << 'EOF'
/**
 * Cart logic with localStorage
 */
window.Cart = {
  key: 'mpwb_cart',
  items: [],
  init() {
    try {
      const raw = localStorage.getItem(this.key);
      this.items = raw ? JSON.parse(raw) : [];
    } catch(e) {
      this.items = [];
    }
    this.updateBadge();
    this.bindCheckout();
  },
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
    this.renderModal();
  },
  add(product, qty) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ id: product.id, title: product.title, price: product.price, qty: qty });
    }
    this.save();
  },
  total() {
    return this.items.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.qty), 0);
  },
  updateBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const qty = this.items.reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = qty;
  },
  renderModal() {
    const cont = document.getElementById('cartContent');
    const empty = document.getElementById('cartEmpty');
    const totalEl = document.getElementById('cartTotal');
    if (!cont || !totalEl) return;
    cont.innerHTML = '';
    if (!this.items.length) {
      if (empty) empty.classList.remove('d-none');
      totalEl.textContent = '0';
      return;
    }
    if (empty) empty.classList.add('d-none');
    const table = document.createElement('table');
    table.className = 'table table-sm align-middle';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-end">Qty</th>
          <th class="text-end">Price</th>
          <th class="text-end">Total</th>
          <th></th>
        </tr>
      </thead>`;
    const tbody = document.createElement('tbody');
    this.items.forEach((i, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i.title}</td>
        <td class="text-end">${i.qty}</td>
        <td class="text-end">${i.price}</td>
        <td class="text-end">${(parseFloat(i.price || 0) * i.qty).toFixed(2)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-idx="${idx}">&times;</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    cont.appendChild(table);

    cont.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-idx'), 10);
        this.items.splice(index, 1);
        this.save();
      });
    });

    totalEl.textContent = this.total().toFixed(2);
  },
  bindCheckout() {
    const btn = document.getElementById('checkoutButton');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (!this.items.length) return;
      const name = prompt('Your name?');
      const email = prompt('Your email?');
      const entry = {
        type: 'order',
        items: this.items,
        total: this.total(),
        name,
        email
      };
      try {
        await Runtime.saveEntry(entry);
        alert('Order submitted!');
        this.items = [];
        this.save();
      } catch(e) {
        alert('Could not submit order.');
      }
    });
  }
};
EOF

# wishlist.js
cat > "$JS_DIR/wishlist.js" << 'EOF'
/**
 * Wishlist with localStorage
 */
window.Wishlist = {
  key: 'mpwb_wishlist',
  items: [],
  init() {
    try {
      const raw = localStorage.getItem(this.key);
      this.items = raw ? JSON.parse(raw) : [];
    } catch(e) {
      this.items = [];
    }
    this.updateBadge();
  },
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
    this.renderModal();
  },
  toggle(product) {
    const idx = this.items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      this.items.splice(idx, 1);
    } else {
      this.items.push({ id: product.id, title: product.title });
    }
    this.save();
  },
  updateBadge() {
    const badge = document.getElementById('wishlistCount');
    if (!badge) return;
    badge.textContent = this.items.length;
  },
  renderModal() {
    const cont = document.getElementById('wishlistContent');
    const empty = document.getElementById('wishlistEmpty');
    if (!cont) return;
    cont.innerHTML = '';
    if (!this.items.length) {
      if (empty) empty.classList.remove('d-none');
      return;
    }
    if (empty) empty.classList.add('d-none');
    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';
    this.items.forEach(i => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<span>${i.title}</span>`;
      ul.appendChild(li);
    });
    cont.appendChild(ul);
  }
};
EOF

# popup.js
cat > "$JS_DIR/popup.js" << 'EOF'
/**
 * Timed popup logic
 */
window.Popup = {
  init(settings) {
    const enabled = (settings.popup_included || 'no') === 'yes';
    if (!enabled) return;
    const delay = parseInt(settings.popup_delay_seconds || '60', 10) * 1000;
    setTimeout(() => {
      const el = document.getElementById('timedPopup');
      if (!el) return;
      const modal = new bootstrap.Modal(el);
      modal.show();
    }, delay);
  }
};
EOF

# currency.js
cat > "$JS_DIR/currency.js" << 'EOF'
/**
 * Currency formatting helper
 */
window.Currency = {
  format(value, settings) {
    const symbol = (settings && settings.currency_symbol) || '$';
    const num = parseFloat(value || 0);
    if (isNaN(num)) return symbol + '0.00';
    return symbol + num.toFixed(2);
  }
};
EOF

# lazyload.js
cat > "$JS_DIR/lazyload.js" << 'EOF'
/**
 * Simple image lazy loading
 */
window.LazyLoad = {
  init() {
    if (!('IntersectionObserver' in window)) return;
    const imgs = document.querySelectorAll('img[data-src]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    });
    imgs.forEach(img => obs.observe(img));
  }
};
EOF

# analytics.js
cat > "$JS_DIR/analytics.js" << 'EOF'
/**
 * Basic GA4 / GTM injection
 */
window.Analytics = {
  init(settings) {
    const gaId = settings.ga_id || '';
    if (!gaId) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  }
};
EOF

# seo.js
cat > "$JS_DIR/seo.js" << 'EOF'
/**
 * Basic SEO helper
 */
window.SEO = {
  applyBasic(settings) {
    if (!settings) return;
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  }
};
EOF

# gallery.js
cat > "$JS_DIR/gallery.js" << 'EOF'
/**
 * Simple lightbox/gallery
 */
window.Gallery = {
  init() {
    document.querySelectorAll('[data-lightbox]').forEach(img => {
      img.addEventListener('click', () => this.open(img.src));
    });
  },
  open(src) {
    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.innerHTML = `<img src="${src}" class="lightbox-img" alt="">`;
    backdrop.addEventListener('click', () => backdrop.remove());
    document.body.appendChild(backdrop);
  }
};

document.addEventListener('DOMContentLoaded', () => Gallery.init());
EOF

echo "✅ [assets] Done."
