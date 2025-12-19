/**
 * FUSION v5.0 - cart.js
 * Handles local storage cart management and WhatsApp checkout.
 */

const CartModule = {
    items: [],

    init: () => {
        const saved = localStorage.getItem('fusion_cart');
        if (saved) CartModule.items = JSON.parse(saved);
        CartModule.updateUI();
    },

    toggle: () => {
        const drawer = document.getElementById('cartDrawer');
        if (drawer) drawer.classList.toggle('open');
    },

    add: (id) => {
        const product = ProductsModule.allProducts.find(p => p.id === id);
        if (!product) return;

        const existing = CartModule.items.find(i => i.id === id);
        if (existing) {
            existing.qty++;
        } else {
            CartModule.items.push({ ...product, qty: 1 });
        }

        CartModule.save();
        CartModule.updateUI();
        
        // Open drawer on add
        const drawer = document.getElementById('cartDrawer');
        if (drawer && !drawer.classList.contains('open')) drawer.classList.add('open');
    },

    remove: (id) => {
        CartModule.items = CartModule.items.filter(i => i.id !== id);
        CartModule.save();
        CartModule.updateUI();
    },

    updateUI: () => {
        const container = document.getElementById('cartItems');
        const countBadge = document.getElementById('cartCount');
        const totalDisplay = document.getElementById('cartTotal');

        if (!container) return;

        if (CartModule.items.length === 0) {
            container.innerHTML = '<div class="text-center py-5 opacity-50">Your selection is empty.</div>';
            countBadge.innerText = '0';
            totalDisplay.innerText = '0 DH';
            return;
        }

        let total = 0;
        let count = 0;

        container.innerHTML = CartModule.items.map(item => {
            total += (item.price * item.qty);
            count += item.qty;
            return `
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                    <div style="max-width: 70%;">
                        <div class="fw-bold small">${item.title}</div>
                        <div class="text-primary small">${item.qty} x ${item.price} DH</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="CartModule.remove('${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        countBadge.innerText = count;
        totalDisplay.innerText = total + ' DH';
    },

    save: () => {
        localStorage.setItem('fusion_cart', JSON.stringify(CartModule.items));
    },

    checkout: () => {
        if (CartModule.items.length === 0) return;

        const summary = CartModule.items.map(i => `${i.qty}x ${i.title}`).join('%0A');
        const total = CartModule.items.reduce((a, b) => a + (b.price * b.qty), 0);
        
        const message = `🍱 *NEW ORDER RECEIVED*%0A------------------%0A${summary}%0A------------------%0A*Total:* ${total} DH`;
        
        // Open WhatsApp
        window.open(`https://wa.me/${window.FUSION_CONFIG.whatsapp}?text=${message}`, '_blank');
        
        // Optional: Save entry to Google Sheet via GAS
        const orderData = {
            customer: "Web Customer",
            order: CartModule.items.map(i => `${i.qty}x ${i.title}`).join(', '),
            total: total
        };

        const script = document.createElement('script');
        script.src = `${window.FUSION_CONFIG.api}?action=saveEntry&data=${JSON.stringify(orderData)}&callback=CartModule.onOrderSaved`;
        document.body.appendChild(script);
    },

    onOrderSaved: (res) => {
        console.log("Order saved to Google Sheet:", res);
        alert("Your order has been sent!");
        CartModule.items = [];
        CartModule.save();
        CartModule.updateUI();
        CartModule.toggle();
    }
};
