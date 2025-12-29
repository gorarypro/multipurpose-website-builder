/**
 * FUSION ENGINE v14.0.0 - wishlist.js
 * Persistent Wishlist Module
 * -----------------------------------------------------
 * Features:
 * - LocalStorage Persistence
 * - Variant-aware duplicate checking
 * - FusionCurrency Integration
 */

window.FusionWishlist = (function () {
  const STORAGE_KEY = 'fusion_wishlist_v1';
  
  const state = {
    items: [],
    elements: {
      count: null,
      floatingCount: null,
      body: null,
      emptyMsg: null
    }
  };

  function init() {
    state.elements.count = document.getElementById('wishlistCount');
    state.elements.floatingCount = document.getElementById('floatingWishlistCount');
    state.elements.body = document.getElementById('wishlistContent'); // Match ThemeTemplate ID
    state.elements.emptyMsg = document.getElementById('wishlistEmpty');

    // Load persisted data
    state.items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    render();
    console.log("FusionWishlist: Persistence Engine Active");
  }

  function add(product, variants = {}) {
    // Unique ID based on product + variants
    const variantKey = JSON.stringify(variants);
    const exists = state.items.find(i => i.id === product.id && JSON.stringify(i.variants) === variantKey);

    if (!exists) {
      state.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        variants: variants
      });
      save();
    }
  }

  function remove(productId, variantKey) {
    state.items = state.items.filter(i => !(i.id === productId && JSON.stringify(i.variants) === variantKey));
    save();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    render();
  }

  function render() {
    if (!state.elements.body) return;

    state.elements.body.innerHTML = '';
    const hasItems = state.items.length > 0;

    if (!hasItems) {
      if (state.elements.emptyMsg) state.elements.emptyMsg.classList.remove('d-none');
      updateCounts(0);
      return;
    }

    if (state.elements.emptyMsg) state.elements.emptyMsg.classList.add('d-none');

    state.items.forEach((item) => {
      const formattedPrice = window.FusionCurrency ? FusionCurrency.format(item.price) : item.price;
      const row = document.createElement('div');
      row.className = 'col-12 d-flex align-items-center gap-3 mb-3 pb-3 border-bottom';
      
      row.innerHTML = `
        <img src="${item.image}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">
        <div class="flex-grow-1">
          <div class="fw-bold small">${item.title}</div>
          <div class="text-muted" style="font-size: 11px;">
            ${Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(', ')}
          </div>
          <div class="text-primary fw-bold small">${formattedPrice}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger border-0 remove-wish">
          <i class="bi bi-trash"></i>
        </button>
      `;

      row.querySelector('.remove-wish').onclick = () => remove(item.id, JSON.stringify(item.variants));
      state.elements.body.appendChild(row);
    });

    updateCounts(state.items.length);
  }

  function updateCounts(count) {
    if (state.elements.count) state.elements.count.textContent = count;
    if (state.elements.floatingCount) state.elements.floatingCount.textContent = count;
  }

  return { init, add, remove, load: () => state.items };
})();

// Initialize on Fusion Runtime ready
window.addEventListener('fusion:ready', () => FusionWishlist.init());
