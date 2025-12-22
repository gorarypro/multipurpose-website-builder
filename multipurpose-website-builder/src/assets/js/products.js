/**
 * FUSION v10.9.9 - products.js
 * Blogger Feed Parser
 */

const ProductsModule = {
    catalog: [],
    settings: {},

    init: function(settings) {
        this.settings = settings;
        this.fetchFeed();
    },

    fetchFeed: function() {
        const domain = this.settings.base_url || location.hostname;
        const script = document.createElement('script');
        // JSONP Callback to bypass CORS
        script.src = `https://${domain}/feeds/posts/default?alt=json-in-script&callback=ProductsModule.parse`;
        document.body.appendChild(script);
    },

    parse: function(json) {
        const entries = json.feed.entry || [];
        this.catalog = entries.map(e => {
            const priceTag = (e.category || []).find(c => c.term.startsWith('price-'));
            return {
                id: e.id.$t,
                title: e.title.$t,
                content: e.content ? e.content.$t : "",
                price: priceTag ? parseFloat(priceTag.term.split('-')[1]) : 0,
                image: e.media$thumbnail ? e.media$thumbnail.url.replace('/s72-c/', '/s600/') : "https://placehold.co/600x400"
            };
        });
        this.render();
    },

    render: function() {
        const grid = document.getElementById('productGrid');
        
        // NULL GUARD: Prevent TypeError if grid is missing
        if (!grid) {
            console.warn("ProductsModule: #productGrid element not found in DOM.");
            return;
        }

        const currency = this.settings.currency_symbol || 'DH';

        grid.innerHTML = this.catalog.map(p => `
            <div class="col-md-4 col-sm-6">
                <div class="card h-100 border-0 shadow-sm overflow-hidden">
                    <img src="${p.image}" class="card-img-top" alt="${p.title}" style="aspect-ratio: 1/1; object-fit: cover;">
                    <div class="card-body text-center">
                        <h6 class="fw-bold">${p.title}</h6>
                        <p class="text-primary fw-bold fs-5">${p.price} ${currency}</p>
                        <button class="btn btn-outline-primary btn-sm rounded-pill w-100" onclick="CartModule.add('${p.id}', '${p.title.replace(/'/g, "\\'")}', ${p.price})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};
