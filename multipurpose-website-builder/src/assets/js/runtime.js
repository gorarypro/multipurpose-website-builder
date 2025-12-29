/**
 * FUSION ENGINE v16.1.0 - Unified Runtime (Inventory Enabled)
 */

const Fusion = (function() {
    const settings = window.FUSION_SETTINGS || {};
    const mapping = window.FUSION_TEXTMAPPING || {};
    const currency = settings.currency_symbol || "DH";
    const scriptUrl = window.location.href.split('?')[0];

    // --- 1. i18n & CONFIG ---
    const i18n = {
        lang: localStorage.getItem('fusion_lang') || 'en',
        translate: function() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (mapping[key]) el.textContent = mapping[key][this.lang] || mapping[key]['en'];
            });
            document.dir = (this.lang === 'ar') ? 'rtl' : 'ltr';
        }
    };

    // --- 2. CATALOG & INVENTORY ENGINE ---
    const Catalog = {
        products: [],
        inventory: {},
        init: async function() {
            const grid = document.getElementById('productGrid');
            if (!grid) return;
            try {
                // Fetch Inventory Status first
                const invRes = await fetch(`${scriptUrl}?action=getInventory`);
                const invData = await invRes.json();
                this.inventory = invData.inventory || {};

                // Fetch Blogger Posts
                const res = await fetch(`/feeds/posts/default?alt=json&max-results=999`);
                const data = await res.json();
                
                this.products = (data.feed.entry || []).map(entry => {
                    const labels = entry.category ? entry.category.map(c => c.term) : [];
                    let p = "Contact";
                    const lb = labels.find(l => l.toLowerCase().includes('price:'));
                    if (lb) p = lb.split(':')[1].trim() + " " + currency;
                    
                    let img = entry.media$thumbnail ? entry.media$thumbnail.url.replace(/\/s[0-9]+-c/, '/w600-h600-c') : 'https://via.placeholder.com/600';
                    
                    return { 
                        id: entry.id.$t, 
                        title: entry.title.$t, 
                        image: img, 
                        price: p,
                        inStock: this.inventory[entry.id.$t] !== "Out of Stock"
                    };
                });
                this.render();
            } catch (e) { console.error("Fusion Init Error", e); }
        },
        render: function() {
            const grid = document.getElementById('productGrid');
            const wished = Wishlist.items;
            grid.innerHTML = this.products.map(item => {
                const heart = wished.includes(item.id) ? 'bi-heart-fill text-danger' : 'bi-heart';
                const stockBadge = item.inStock ? '' : '<span class="badge bg-danger position-absolute top-0 start-0 m-2">Out of Stock</span>';
                const btnAttr = item.inStock ? `onclick="Fusion.Cart.add('${item.id}')"` : 'disabled';
                const btnClass = item.inStock ? 'btn-primary' : 'btn-secondary opacity-50';

                return `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="card h-100 border-0 shadow-sm product-card ${item.inStock ? '' : 'stock-out'}">
                        <div class="position-relative overflow-hidden" style="padding-top: 100%;">
                            ${stockBadge}
                            <img src="${item.image}" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" loading="lazy">
                            <button class="btn btn-white btn-sm rounded-circle shadow-sm position-absolute top-0 end-0 m-2" onclick="Fusion.Wishlist.toggle('${item.id}')">
                                <i class="bi ${heart}"></i>
                            </button>
                        </div>
                        <div class="card-body p-3 text-center">
                            <h6 class="small fw-bold text-truncate">${item.title}</h6>
                            <p class="small text-primary fw-bold">${item.price}</p>
                            <button class="btn btn-sm ${btnClass} w-100 rounded-pill" ${btnAttr}>
                                ${item.inStock ? 'Add to Cart' : 'Sold Out'}
                            </button>
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
            if (!p || !p.inStock) return;
            const ex = this.items.find(x => x.id === id);
            if (ex) ex.qty++; else this.items.push({...p, qty: 1});
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
        },
        checkout: function() {
            const n = document.getElementById('checkoutName').value;
            const ph = document.getElementById('checkoutPhone').value;
            const tot = document.getElementById('cartTotal').textContent;
            if (!n || !ph) return alert("Missing Info");

            const payload = { name: n, phone: ph, total: tot, items: this.items };
            fetch(`${scriptUrl}?action=saveOrder&payload=${encodeURIComponent(JSON.stringify(payload))}`, { mode: 'no-cors' });
            
            const waMsg = `*New Order*\nName: ${n}\nItems: ${this.items.map(i => i.title).join(', ')}`;
            window.open(`https://wa.me/${settings.contact_whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}`, '_blank');
        }
    };

    // --- 4. WISHLIST & POPUP ---
    const Wishlist = {
        items: JSON.parse(localStorage.getItem('fusion_wishlist')) || [],
        toggle: function(id) {
            this.items = this.items.includes(id) ? this.items.filter(x => x !== id) : [...this.items, id];
            localStorage.setItem('fusion_wishlist', JSON.stringify(this.items));
            this.updateUI();
            Catalog.render();
        },
        updateUI: function() {
            const c = this.items.length;
            ['wishlistCount', 'floatingWishlistCount'].forEach(id => {
                if (document.getElementById(id)) document.getElementById(id).textContent = c;
            });
        }
    };

    const Popup = {
        init: function() {
            const dismissed = localStorage.getItem('fusion_popup_dismissed');
            if (dismissed && new Date().getTime() < parseInt(dismissed)) return;
            setTimeout(() => {
                const el = document.getElementById('popupModal');
                if (el) new bootstrap.Modal(el).show();
            }, settings.popup_delay || 3000);
        }
    };

    return { 
        boot: () => { i18n.translate(); Catalog.init(); Cart.updateUI(); Wishlist.updateUI(); Popup.init(); }, 
        Cart, Wishlist, i18n 
    };
})();

document.addEventListener('DOMContentLoaded', Fusion.boot);
