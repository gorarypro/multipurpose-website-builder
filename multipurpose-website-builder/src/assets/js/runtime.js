/**
 * FUSION ENGINE v15.8.0 - Unified Runtime
 * Includes: Catalog, Cart, Wishlist, Popup, and i18n Core.
 */

const Fusion = (function() {
    // --- GLOBAL CONFIG & STATE ---
    const settings = window.FUSION_SETTINGS || {};
    const mapping = window.FUSION_TEXTMAPPING || {};
    const currency = settings.currency_symbol || "DH";
    const feedUrl = `/feeds/posts/default?alt=json&max-results=999`;

    // --- 1. i18n ENGINE ---
    const i18n = {
        lang: localStorage.getItem('fusion_lang') || 'en',
        translate: function() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (mapping[key]) el.textContent = mapping[key][this.lang] || mapping[key]['en'];
                if (el.placeholder) el.placeholder = mapping[key][this.lang] || mapping[key]['en'];
            });
            document.dir = (this.lang === 'ar') ? 'rtl' : 'ltr';
        },
        setLang: function(l) { 
            this.lang = l; 
            localStorage.setItem('fusion_lang', l); 
            this.translate(); 
            location.reload(); 
        }
    };

    // --- 2. CATALOG ENGINE ---
    const Catalog = {
        products: [],
        init: async function() {
            const grid = document.getElementById('productGrid');
            if (!grid) return;
            try {
                const res = await fetch(feedUrl);
                const data = await res.json();
                this.products = (data.feed.entry || []).map(entry => {
                    const labels = entry.category ? entry.category.map(c => c.term) : [];
                    let price = "Contact";
                    const pLabel = labels.find(l => l.toLowerCase().includes('price:'));
                    if (pLabel) price = pLabel.split(':')[1].trim() + " " + currency;
                    
                    let img = 'https://via.placeholder.com/600x600';
                    if (entry.media$thumbnail) img = entry.media$thumbnail.url.replace(/\/s[0-9]+-c/, '/w600-h600-c');
                    
                    return {
                        id: entry.id.$t,
                        title: entry.title.$t,
                        link: entry.link.find(l => l.rel === 'alternate').href,
                        image: img,
                        price: price,
                        categories: labels.filter(l => !l.toLowerCase().includes('price:'))
                    };
                });
                this.render();
            } catch (e) { console.error("Catalog Error", e); }
        },
        render: function() {
            const grid = document.getElementById('productGrid');
            const wished = Wishlist.items;
            grid.innerHTML = this.products.map(item => {
                const heart = wished.includes(item.id) ? 'bi-heart-fill text-danger' : 'bi-heart';
                return `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="card h-100 border-0 shadow-sm product-card">
                        <div class="position-relative overflow-hidden" style="padding-top: 100%;">
                            <img src="${item.image}" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" loading="lazy">
                            <button class="btn btn-white btn-sm rounded-circle shadow-sm position-absolute top-0 end-0 m-2" onclick="Fusion.Wishlist.toggle('${item.id}')">
                                <i class="bi ${heart}"></i>
                            </button>
                        </div>
                        <div class="card-body p-3 text-center">
                            <h6 class="small fw-bold text-truncate">${item.title}</h6>
                            <p class="small text-primary fw-bold">${item.price}</p>
                            <button class="btn btn-sm btn-primary w-100 rounded-pill" onclick="Fusion.Cart.add('${item.id}')">Add</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    };

    // --- 3. CART ENGINE ---
    const Cart = {
        items: JSON.parse(localStorage.getItem('fusion_cart')) || [],
        add: function(id) {
            const p = Catalog.products.find(x => x.id === id);
            if (!p) return;
            const exist = this.items.find(x => x.id === id);
            if (exist) exist.qty++; else this.items.push({...p, qty: 1});
            this.save();
        },
        save: function() {
            localStorage.setItem('fusion_cart', JSON.stringify(this.items));
            this.updateUI();
        },
        updateUI: function() {
            const count = this.items.reduce((a, b) => a + b.qty, 0);
            ['cartCount', 'floatingCartCount'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = count;
            });
            // Render Modal Logic here...
        }
    };

    // --- 4. WISHLIST ENGINE ---
    const Wishlist = {
        items: JSON.parse(localStorage.getItem('fusion_wishlist')) || [],
        toggle: function(id) {
            if (this.items.includes(id)) this.items = this.items.filter(x => x !== id);
            else this.items.push(id);
            localStorage.setItem('fusion_wishlist', JSON.stringify(this.items));
            this.updateUI();
            Catalog.render(); // Re-sync heart icons
        },
        updateUI: function() {
            const count = this.items.length;
            ['wishlistCount', 'floatingWishlistCount'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = count;
            });
        }
    };

    // --- 5. POPUP ENGINE ---
    const Popup = {
        init: function() {
            const dismissed = localStorage.getItem('fusion_popup_dismissed');
            if (dismissed && new Date().getTime() < parseInt(dismissed)) return;
            setTimeout(() => {
                const el = document.getElementById('popupModal');
                if (el) new bootstrap.Modal(el).show();
            }, settings.popup_delay || 3000);
        },
        dismiss: function() {
            const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('fusion_popup_dismissed', expiry);
        }
    };

    /**
     * Boot Sequence
     */
    function boot() {
        i18n.translate();
        Catalog.init();
        Cart.updateUI();
        Wishlist.updateUI();
        Popup.init();
    }

    // Expose API
    return { boot, i18n, Catalog, Cart, Wishlist, Popup };
})();

// Auto-start
document.addEventListener('DOMContentLoaded', Fusion.boot);
