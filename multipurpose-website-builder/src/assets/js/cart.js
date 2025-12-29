/**
 * FUSION ENGINE v15.3.0 - Shopping Cart Logic
 * Manages persistence, UI synchronization, and checkout.
 */

const FusionCart = (function() {
    // 1. Internal State
    let cart = JSON.parse(localStorage.getItem('fusion_cart')) || [];
    const settings = window.FUSION_SETTINGS || {};

    /**
     * Initialize Cart UI
     */
    function init() {
        updateUI();
        setupListeners();
        console.log("FusionCart: System Ready.");
    }

    /**
     * Add Item to Cart
     */
    function add(productId) {
        // Find product details from the Catalog (loaded by products.js)
        const product = (typeof FusionCatalog !== 'undefined') 
            ? FusionCatalog.getProductById(productId) 
            : null;

        if (!product) {
            console.error("FusionCart: Product not found in catalog.");
            return;
        }

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        save();
        showToast(`Added ${product.title} to cart`);
    }

    /**
     * Remove or Decrease Quantity
     */
    function remove(productId, forceDelete = false) {
        const index = cart.findIndex(item => item.id === productId);
        if (index === -1) return;

        if (forceDelete || cart[index].quantity <= 1) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity -= 1;
        }

        save();
    }

    /**
     * Persist to Storage and Update UI
     */
    function save() {
        localStorage.setItem('fusion_cart', JSON.stringify(cart));
        updateUI();
        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('fusion:cartUpdated', { detail: cart }));
    }

    /**
     * Sync all counters and modal content
     */
    function updateUI() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all badges (Navbar & Floating)
        const badges = ['cartCount', 'floatingCartCount'];
        badges.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            }
        });

        renderCartModal();
    }

    /**
     * Render the Cart Modal Content
     */
    function renderCartModal() {
        const container = document.getElementById('cartContent');
        const emptyState = document.getElementById('cartEmpty');
        const checkoutFields = document.getElementById('checkoutFields');
        const totalEl = document.getElementById('cartTotal');

        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('d-none');
            if (checkoutFields) checkoutFields.style.display = 'none';
            if (totalEl) totalEl.textContent = '0 ' + (settings.currency_symbol || 'DH');
            return;
        }

        emptyState.classList.add('d-none');
        if (checkoutFields) checkoutFields.style.display = 'block';

        let total = 0;
        container.innerHTML = cart.map(item => {
            const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            total += (priceNum * item.quantity);
            
            return `
                <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                    <img src="${item.image}" class="rounded me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-0 small fw-bold">${item.title}</h6>
                        <div class="text-primary small">${item.price} x ${item.quantity}</div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-light py-0" onclick="FusionCart.remove('${item.id}')">-</button>
                        <button class="btn btn-sm btn-light py-0" onclick="FusionCart.add('${item.id}')">+</button>
                    </div>
                </div>
            `;
        }).join('');

        if (totalEl) totalEl.textContent = total.toFixed(2) + ' ' + (settings.currency_symbol || 'DH');
    }

    /**
     * Checkout - WhatsApp Integration
     */
    function checkout() {
        if (cart.length === 0) return;

        const name = document.getElementById('checkoutName')?.value;
        const phone = document.getElementById('checkoutPhone')?.value;
        
        if (!name || !phone) {
            alert("Please fill in your Name and Phone Number.");
            return;
        }

        let message = `*New Order from ${settings.site_title}*\n\n`;
        message += `*Customer:* ${name}\n`;
        message += `*Phone:* ${phone}\n\n`;
        message += `*Items:*\n`;
        
        cart.forEach(item => {
            message += `- ${item.title} (x${item.quantity}) - ${item.price}\n`;
        });

        const total = document.getElementById('cartTotal')?.textContent;
        message += `\n*Total:* ${total}`;

        const waNumber = (settings.contact_whatsapp || '').replace(/\D/g, '');
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(waUrl, '_blank');
        
        // Clear cart after redirect?
        // cart = []; save();
    }

    function setupListeners() {
        const btn = document.getElementById('checkoutButton');
        if (btn) btn.onclick = checkout;
    }

    function showToast(msg) {
        console.log("Cart Toast:", msg);
        // Add your favorite toast notification logic here
    }

    return { init, add, remove, getItems: () => cart };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', FusionCart.init);
