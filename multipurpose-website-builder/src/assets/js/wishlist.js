/**
 * FUSION ENGINE v15.5.0 - Wishlist Logic
 * Features: Toggle State, LocalStorage Persistence, Cross-Component Sync.
 */

const FusionWishlist = (function() {
    // 1. Internal State
    let wishlist = JSON.parse(localStorage.getItem('fusion_wishlist')) || [];

    /**
     * Entry Point
     */
    function init() {
        updateUI();
        console.log("FusionWishlist: System Synced.");
    }

    /**
     * Toggle Product in Wishlist
     */
    function toggle(productId) {
        const index = wishlist.indexOf(productId);
        
        if (index > -1) {
            wishlist.splice(index, 1);
            showToast("Removed from wishlist");
        } else {
            wishlist.push(productId);
            showToast("Added to wishlist");
        }

        save();
    }

    /**
     * Add specifically (for 'Buy Later' buttons)
     */
    function add(productId) {
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            save();
            showToast("Added to wishlist");
        }
    }

    /**
     * Remove specifically
     */
    function remove(productId) {
        wishlist = wishlist.filter(id => id !== productId);
        save();
    }

    /**
     * Persist and Notify
     */
    function save() {
        localStorage.setItem('fusion_wishlist', JSON.stringify(wishlist));
        updateUI();
        // Dispatch event for other components (like product cards)
        window.dispatchEvent(new CustomEvent('fusion:wishlistUpdated', { detail: wishlist }));
    }

    /**
     * Sync UI Elements
     */
    function updateUI() {
        const count = wishlist.length;
        
        // Update all badges (Navbar & Floating)
        const badges = ['wishlistCount', 'floatingWishlistCount'];
        badges.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            }
        });

        renderModal();
    }

    /**
     * Render items inside the Wishlist Modal
     */
    function renderModal() {
        const container = document.getElementById('wishlistContent');
        const emptyState = document.getElementById('wishlistEmpty');
        
        if (!container) return;

        if (wishlist.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        // Fetch full product details from the Catalog
        container.innerHTML = wishlist.map(id => {
            const product = FusionCatalog.getProductById(id);
            if (!product) return '';

            return `
                <div class="col-6 col-md-4">
                    <div class="card h-100 border-0 shadow-sm overflow-hidden">
                        <img src="${product.image}" class="card-img-top" style="aspect-ratio:1/1; object-fit:cover;">
                        <div class="card-body p-2 text-center">
                            <h6 class="small fw-bold text-truncate mb-1">${product.title}</h6>
                            <p class="small text-primary mb-2">${product.price}</p>
                            <div class="d-grid gap-1">
                                <button class="btn btn-xs btn-primary py-1" onclick="FusionCart.add('${product.id}')">
                                    <i class="bi bi-cart"></i>
                                </button>
                                <button class="btn btn-xs btn-outline-danger py-1" onclick="FusionWishlist.remove('${product.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showToast(msg) {
        // Implementation for UI feedback
        console.log("Wishlist:", msg);
    }

    return { init, toggle, add, remove, getItems: () => wishlist };
})();

// Auto-boot
document.addEventListener('DOMContentLoaded', FusionWishlist.init);
