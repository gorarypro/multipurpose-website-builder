/**
 * FUSION v5.10 - products.js
 * Fetches and renders products from the Blogger JSON feed.
 */

const ProductsModule = {
    items: [],

    init: function() {
        this.fetchFromBlogger();
    },

    /**
     * Fetches the native Blogger feed
     */
    fetchFromBlogger: function() {
        const blogUrl = Runtime.settings.base_url || 'eventsushi.blogspot.com';
        const script = document.createElement('script');
        script.src = `https://${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=50&callback=ProductsModule.render`;
        document.body.appendChild(script);
    },

    /**
     * Parses Blogger JSON and builds the UI grid
     */
    render: function(json) {
        const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        if (entries.length === 0) {
            document.getElementById('productsEmpty')?.classList.remove('d-none');
            return;
        }

        const currency = Runtime.settings.currency_symbol || 'DH';

        grid.innerHTML = entries.map(entry => {
            const title = entry.title.$t;
            const content = entry.content ? entry.content.$t : "";
            
            // Extract high-res image
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            const image = imgMatch ? imgMatch[1].replace('s72-c', 's600') : 'https://via.placeholder.com/400';

            // Extract price from labels (e.g., price-50)
            let price = 0;
            if (entry.category) {
                const priceLabel = entry.category.find(c => c.term.startsWith('price-'));
                if (priceLabel) price = priceLabel.term.split('-')[1];
            }

            return `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm product-card">
                        <div class="product-image">
                            <img src="${image}" class="card-img-top" alt="${title}">
                        </div>
                        <div class="card-body p-3">
                            <h6 class="fw-bold mb-1">${title}</h6>
                            <p class="text-primary fw-bold mb-3">${price} ${currency}</p>
                            <button class="btn btn-sm btn-primary w-100 rounded-pill" 
                                    onclick="CartModule.add('${entry.id.$t}', '${title}', ${price})">
                                + ADD
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};
