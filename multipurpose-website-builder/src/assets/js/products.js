/**
 * FUSION ENGINE v15.2.0 - Product Grid Logic
 * Fetches data from Blogger JSON Feed and renders the UI.
 */

const FusionCatalog = (function() {
    // 1. Internal State
    let allProducts = [];
    const settings = window.FUSION_SETTINGS || {};
    const feedUrl = `/feeds/posts/default?alt=json&max-results=999`;

    // 2. DOM Elements
    const grid = document.getElementById('productGrid');
    const loading = document.getElementById('gridLoading');
    const emptyState = document.getElementById('productsEmpty');
    const searchInput = document.getElementById('productSearch');

    /**
     * Initialize the Catalog
     */
    async function init() {
        if (!grid) return;
        try {
            const response = await fetch(feedUrl);
            const data = await response.json();
            parseBloggerData(data);
            render(allProducts);
            setupListeners();
        } catch (err) {
            console.error("Fusion Error: Catalog fetch failed.", err);
            loading.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
        }
    }

    /**
     * Extract data from Blogger's messy JSON structure
     */
    function parseBloggerData(json) {
        const entries = json.feed.entry || [];
        allProducts = entries.map(entry => {
            // Find Featured Image
            let img = 'https://via.placeholder.com/400x400?text=No+Image';
            if (entry.media$thumbnail) {
                img = entry.media$thumbnail.url.replace('/s72-c/', '/w600/');
            } else if (entry.content && entry.content.$t.includes('<img')) {
                const match = entry.content.$t.match(/src="([^"]+)"/);
                if (match) img = match[1];
            }

            // Find Price in Labels (e.g., "Price: 150")
            let price = "Contact for Price";
            const labels = entry.category || [];
            labels.forEach(label => {
                if (label.term.toLowerCase().includes('price:')) {
                    price = label.term.split(':')[1].trim() + " " + (settings.currency_symbol || "DH");
                }
            });

            return {
                id: entry.id.$t,
                title: entry.title.$t,
                link: entry.link.find(l => l.rel === 'alternate').href,
                image: img,
                price: price,
                categories: labels.map(l => l.term)
            };
        });
    }

    /**
     * Render HTML Cards
     */
    function render(products) {
        loading.style.display = 'none';
        grid.innerHTML = '';
        
        if (products.length === 0) {
            emptyState.classList.remove('d-none');
            return;
        }

        emptyState.classList.add('d-none');
        
        products.forEach(item => {
            const card = `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm product-card">
                        <div class="position-relative overflow-hidden">
                            <img src="${item.image}" class="card-img-top" alt="${item.title}" style="aspect-ratio: 1/1; object-fit: cover;">
                            <button class="btn btn-sm btn-white position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" onclick="FusionWishlist.toggle('${item.id}')">
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                        <div class="card-body p-3">
                            <h6 class="card-title text-truncate mb-1">${item.title}</h6>
                            <p class="text-primary fw-bold mb-3">${item.price}</p>
                            <button class="btn btn-sm btn-primary w-100 rounded-pill" onclick="FusionCart.add('${item.id}')">
                                <i class="bi bi-cart-plus me-1"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });
    }

    /**
     * Setup Search and Filters
     */
    function setupListeners() {
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allProducts.filter(p => p.title.toLowerCase().includes(term));
                render(filtered);
            });
        }
    }

    return { init };
})();

// Auto-run on load
document.addEventListener('DOMContentLoaded', FusionCatalog.init);
