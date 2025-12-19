/**
 * FUSION v5.10 - cart.js
 * Manages cart state and orders.
 */

const CartModule = {
    data: [],

    init: function() {
        const saved = localStorage.getItem('fusion_cart');
        if (saved) this.data = JSON.parse(saved);
        this.updateUI();
        this.bindEvents();
    },

    bindEvents: function() {
        document.getElementById('checkoutButton')?.addEventListener('click', () => this.handleCheckout());
    },

    add: function(id, title, price) {
        const item = this.data.find(i => i.id === id);
        if (item) item.qty++;
        else this.data.push({ id, title, price, qty: 1 });
        
        this.save();
        this.updateUI();
        alert(`${title} added to cart!`);
    },

    updateUI: function() {
        const countEls = ['cartCount', 'floatingCartCount'];
        const total = this.data.reduce((acc, i) => acc + (i.price * i.qty), 0);
        const count = this.data.reduce((acc, i) => acc + i.qty, 0);

        countEls.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        });

        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.textContent = `${total} ${Runtime.settings.currency_symbol || 'DH'}`;

        // Toggle checkout fields visibility
        const fields = document.getElementById('checkoutFields');
        if (fields) fields.style.display = this.data.length > 0 ? 'block' : 'none';
    },

    save: function() {
        localStorage.setItem('fusion_cart', JSON.stringify(this.data));
    },

    /**
     * Final Checkout Handshake
     */
    handleCheckout: function() {
        const entry = {
            type: 'order',
            name: document.getElementById('checkoutName').value,
            phone: document.getElementById('checkoutPhone').value,
            message: document.getElementById('checkoutMessage').value,
            order_data: this.data,
            total: this.data.reduce((acc, i) => acc + (i.price * i.qty), 0)
        };

        if (!entry.name || !entry.phone) return alert("Please fill required fields.");

        // 1. Push to GAS Backend
        const script = document.createElement('script');
        script.src = `${window.BASE_SCRIPT_URL}?action=saveEntry&entry=${encodeURIComponent(JSON.stringify(entry))}&callback=CartModule.onComplete`;
        document.body.appendChild(script);
    },

    onComplete: function(res) {
        if (res.status === 'ok') {
            alert("Order Sent! We will contact you soon.");
            CartModule.data = [];
            CartModule.save();
            location.reload();
        }
    }
};
