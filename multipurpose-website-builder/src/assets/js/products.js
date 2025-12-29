/**
 * FUSION ENGINE v15.6.0 - Headless Catalog Controller
 * --------------------------------------------------------
 * Features: 
 * - Wishlist State Sync (Real-time Heart Icons)
 * - Intelligent Price Extraction from Blogger Labels
 * - High-Res Image Scaling (s1600/w800 logic)
 * - Search & Dynamic Category Filtering
 */

const FusionCatalog = (function() {
    // 1. Internal State
    let allProducts = [];
    const settings = window.FUSION_SETTINGS || {};
    const currency = settings.currency_symbol || "DH";
    
    // Blogger Feed URL (max results 999 for full catalog)
    const feedUrl = `/feeds/posts/default?alt=json&max-results=999`;

    // 2. DOM Elements Cache
    const grid = document.getElementById('productGrid');
    const loading = document.getElementById('gridLoading');
    const emptyState = document.getElementById('productsEmpty');
    const searchInput = document.getElementById('productSearch');
    const filterSelect = document.getElementById('productFilter');

    /**
     * Entry Point: Fetch and Render
     */
    async function init() {
        if (!grid) return;
        
        try {
            // Fetch Blogger JSON Feed
            const response = await fetch(feedUrl);
            const data = await response.json();
            
            parseBloggerData(data);
            populateFilters();
            render(allProducts);
            setupListeners();
            
            console.log("FusionCatalog: Catalog synchronized and state mapped.");
        } catch (err) {
            console.error("Fusion Error: Catalog synchronization failed.", err);
            if (loading) loading.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle display-4 text-warning"></i>
                    <p class="mt-3">Unable to load catalog. Please check your Blogger Feed settings.</p>
                </div>`;
        }
    }

    /**
     * Parse Blogger JSON into Optimized Product Objects
     */
    function parseBloggerData(json) {
        const entries = json.feed.entry || [];
        
        allProducts = entries.map(entry => {
            const labels = entry.category ? entry.category.map(c => c.term) : [];
            
            // Extract Price from Label (Format: "Price: 100")
            let priceText = "Contact for Price";
            let priceNumeric = 0;
            const priceLabel = labels.find(l => l.toLowerCase().includes('price:'));
            
            if (priceLabel) {
                const val = priceLabel.split(':')[1].trim();
                priceNumeric = parseFloat(val) || 0;
                priceText = `${val} ${currency}`;
            }

            // High-Resolution Image Logic
            // Replaces Blogger's tiny /s72-c/ with high-quality /w800/
            let img = 'https://via.placeholder.com/800x800?text=No+Image';
            if (entry.media$thumbnail) {
                img = entry.media$thumbnail.url.replace(/\/s[0-9]+-c/, '/w800-h800-c');
            } else if (entry.content && entry.content.$t.includes('<img')) {
                const match = entry.content.$t.match(/src="([^"]+)"/);
                if (match) img = match[1];
            }

            return {
                id: entry.id.$t,
                title: entry.title.$t,
                link: entry.link.find(l => l.rel === 'alternate').href,
                image: img,
                price: priceText,
                priceValue: priceNumeric,
                categories: labels.filter(l => !l.toLowerCase().includes('price:'))
            };
        });
    }

    /**
     * Render the UI Grid with Wishlist State Sync
     */
    function render(products) {
        if (loading) loading.style.display = 'none';
        grid.innerHTML = '';

        if (products.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        // Check current wishlist items for heart state
        const wishedItems = (typeof FusionWishlist !== 'undefined') ? FusionWishlist.getItems() : [];

        const html = products.map(item => {
            const isWished = wishedItems.includes(item.id);
            const heartIcon = isWished ? 'bi-heart-fill text-danger' : 'bi-heart';

            return `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="card h-100 border-0 shadow-sm product-card transition-hover">
                        <div class="position-relative overflow-hidden" style="padding-top: 100%;">
                            <img src="${item.image}" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" alt="${item.title}" loading="lazy">
                            <div class="position-absolute top-0 end-0 p-2">
                                 <button class="btn btn-white btn-sm rounded-circle shadow-sm" onclick="FusionWishlist.toggle('${item.id}')">
                                    <i class="bi ${heartIcon}"></i>
                                 </button>
                            </div>
                        </div>
                        <div class="card-body p-3 text-center">
                            <h6 class="card-title text-truncate mb-1 small fw-bold">${item.title}</h6>
                            <p class="text-primary fw-bold mb-3 small">${item.price}</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-sm btn-primary rounded-pill py-2" onclick="FusionCart.add('${item.id}')">
                                    <i class="bi bi-cart-plus me-1"></i> Add to Cart
                                </button>
                                <a href="${item.link}" class="btn btn-sm btn-outline-light text-dark rounded-pill py-1 x-small border-0">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = html;
    }

    /**
     * Auto-generate Category Filter from Labels
     */
    function populateFilters() {
        if (!filterSelect) return;
        
        const categories = new Set();
        allProducts.forEach(p => p.categories.forEach(cat => categories.add(cat)));
        
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            filterSelect.appendChild(opt);
        });
    }

    /**
     * Search and Category Listeners
     */
    function setupListeners() {
        const runFilter = () => {
            const term = searchInput ? searchInput.value.toLowerCase() : "";
            const cat = filterSelect ? filterSelect.value : "all";

            const filtered = allProducts.filter(p => {
                const matchesSearch = p.title.toLowerCase().includes(term);
                const matchesCat = (cat === "all" || p.categories.includes(cat));
                return matchesSearch && matchesCat;
            });

            render(filtered);
        };

        if (searchInput) searchInput.oninput = runFilter;
        if (filterSelect) filterSelect.onchange = runFilter;

        // Listen for Wishlist updates to refresh heart icons without re-fetching data
        window.addEventListener('fusion:wishlistUpdated', () => {
            renderCurrentSelection();
        });
    }

    /**
     * Re-renders the current view (useful for state changes)
     */
    function renderCurrentSelection() {
        const term = searchInput ? searchInput.value.toLowerCase() : "";
        const cat = filterSelect ? filterSelect.value : "all";
        const filtered = allProducts.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(term);
            const matchesCat = (cat === "all" || p.categories.includes(cat));
            return matchesSearch && matchesCat;
        });
        render(filtered);
    }

    /**
     * Public API for Cart and Wishlist modules
     */
    function getProductById(id) {
        return allProducts.find(p => p.id === id);
    }

    return { init, getProductById, render: renderCurrentSelection };
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', FusionCatalog.init);
