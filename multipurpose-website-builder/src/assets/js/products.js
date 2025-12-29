/**
 * FUSION ENGINE v15.4.0 - Headless Catalog Controller
 * Features: High-Res Thumbnails, Label-to-Category Mapping, Price Extraction.
 */

const FusionCatalog = (function() {
    // 1. Internal State
    let allProducts = [];
    const settings = window.FUSION_SETTINGS || {};
    const currency = settings.currency_symbol || "DH";
    
    // Blogger Feed URL (max results 999 for full catalog)
    const feedUrl = `/feeds/posts/default?alt=json&max-results=999`;

    // 2. DOM Cache
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
            const response = await fetch(feedUrl);
            const data = await response.json();
            
            parseBloggerData(data);
            populateFilters();
            render(allProducts);
            setupListeners();
            
            console.log("FusionCatalog: Catalog synchronized.");
        } catch (err) {
            console.error("Fusion Error: Failed to fetch catalog.", err);
            if (loading) loading.innerHTML = `<div class="alert alert-danger">Catalog Error. Please check feed settings.</div>`;
        }
    }

    /**
     * Parse Blogger JSON into Clean Product Objects
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

            // High-Resolution Image Processing
            let img = 'https://via.placeholder.com/600x600?text=No+Image';
            if (entry.media$thumbnail) {
                // Change s72-c (Blogger default) to s1600 (Original size) or w600 (Optimized)
                img = entry.media$thumbnail.url.replace(/\/s[0-9]+-c/, '/w600-h600-c');
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
     * Render the UI Grid
     */
    function render(products) {
        if (loading) loading.style.display = 'none';
        grid.innerHTML = '';

        if (products.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        const html = products.map(item => `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="card h-100 border-0 shadow-sm product-card transition-hover">
                    <div class="position-relative overflow-hidden" style="padding-top: 100%;">
                        <img src="${item.image}" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" alt="${item.title}">
                        <div class="position-absolute top-0 end-0 p-2">
                             <button class="btn btn-white btn-sm rounded-circle shadow-sm" onclick="FusionWishlist.add('${item.id}')">
                                <i class="bi bi-heart"></i>
                             </button>
                        </div>
                    </div>
                    <div class="card-body p-3 text-center">
                        <h6 class="card-title text-truncate mb-1 small fw-bold">${item.title}</h6>
                        <p class="text-primary fw-bold mb-3 small">${item.price}</p>
                        <button class="btn btn-sm btn-primary w-100 rounded-pill py-2" onclick="FusionCart.add('${item.id}')">
                            <i class="bi bi-cart-plus me-1"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        grid.innerHTML = html;
    }

    /**
     * Auto-generate Category Dropdown from Labels
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
     * Search and Filter Handlers
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
    }

    /**
     * Helper for cart.js and wishlist.js
     */
    function getProductById(id) {
        return allProducts.find(p => p.id === id);
    }

    // Public API
    return { init, getProductById };
})();

// Auto-boot
document.addEventListener('DOMContentLoaded', FusionCatalog.init);
