/**
 * FUSION ENGINE v16.5.9 - Runtime Logic (Expanded Modal Support)
 */

// Extend the existing Cart object in runtime.js
Fusion.Cart.updateUI = function() {
    // 1. Update Global Counters
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

    // 2. Render Cart Modal Items
    const listContainer = document.getElementById('cartItemsList');
    const checkoutSec = document.getElementById('checkoutSection');
    const confirmBtn = document.getElementById('confirmCheckoutBtn');
    const totalEl = document.getElementById('cartTotal');
    
    if (!listContainer) return;

    if (this.items.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-5"><i class="bi bi-cart-x display-1 text-light mb-3"></i><p class="text-muted">Your cart is empty.</p></div>`;
        if (checkoutSec) checkoutSec.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = true;
        if (totalEl) totalEl.textContent = `0.00 ${settings.currency_symbol || 'DH'}`;
    } else {
        let grandTotal = 0;
        listContainer.innerHTML = this.items.map(item => {
            // Calculate numeric price for total
            const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            grandTotal += (numericPrice * item.qty);

            return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-img me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold small">${item.title}</h6>
                    <span class="text-primary small fw-bold">${item.price}</span>
                </div>
                <div class="quantity-control me-3">
                    <button class="btn btn-sm btn-link text-dark py-0" onclick="Fusion.Cart.changeQty('${item.id}', -1)"><i class="bi bi-dash"></i></button>
                    <span class="px-2 small fw-bold">${item.qty}</span>
                    <button class="btn btn-sm btn-link text-dark py-0" onclick="Fusion.Cart.changeQty('${item.id}', 1)"><i class="bi bi-plus"></i></button>
                </div>
                <button class="btn btn-sm text-danger p-0" onclick="Fusion.Cart.remove('${item.id}')"><i class="bi bi-trash"></i></button>
            </div>`;
        }).join('');

        if (checkoutSec) checkoutSec.style.display = 'block';
        if (confirmBtn) confirmBtn.disabled = false;
        if (totalEl) totalEl.textContent = `${grandTotal.toFixed(2)} ${settings.currency_symbol || 'DH'}`;
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

// Extend the existing Wishlist object in runtime.js
Fusion.Wishlist.render = function() {
    const listContainer = document.getElementById('wishlistItemsList');
    if (!listContainer) return;

    if (this.items.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-5"><i class="bi bi-balloon-heart display-1 text-light mb-3"></i><p class="text-muted">No items saved yet.</p></div>`;
    } else {
        listContainer.innerHTML = this.items.map(id => {
            // Find product details from Catalog
            const product = Fusion.Catalog.products.find(p => p.id === id);
            if (!product) return '';

            return `
            <div class="wishlist-item">
                <div class="wishlist-item-info">
                    <img src="${product.image}">
                    <div>
                        <h6 class="mb-0 fw-bold small text-truncate" style="max-width: 150px;">${product.title}</h6>
                        <span class="text-primary small fw-bold">${product.price}</span>
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="Fusion.Wishlist.toggle('${product.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-primary rounded-pill px-3" onclick="Fusion.Cart.add('${product.id}')">
                        <i class="bi bi-cart-plus"></i>
                    </button>
                </div>
            </div>`;
        }).join('');
    }
};
