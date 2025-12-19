/**
 * FUSION v5.0 - products.js
 * Fetches product data from Blogger and renders the dynamic grid.
 */

const ProductsModule = {
    allProducts: [],

    init: () => {
        ProductsModule.fetchFromBlogger();
    },

    fetchFromBlogger: () => {
        const script = document.createElement('script');
        // Fetch from Blogger's native JSON feed
        script.src = `https://${window.FUSION_CONFIG.blog}/feeds/posts/default?alt=json-in-script&max-results=150&callback=ProductsModule.onFetch`;
        document.body.appendChild(script);
    },

    onFetch: (json) => {
        const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
        
        if (entries.length === 0) {
            document.getElementById('shopContent').innerHTML = '<div class="col-12 text-center text-muted">No products found. Ensure your posts have price labels.</div>';
            return;
        }

        // Map Blogger posts to clean product objects
        ProductsModule.allProducts = entries.map(entry => {
            let price = 0;
            let category = "General";
            
            if (entry.category) {
                entry.category.forEach(cat => {
                    const term = cat.term.toLowerCase();
                    if (term.startsWith('price-')) price = term.split('-')[1];
                    // You can add logic here to detect specific categories for tabs
                });
            }

            const content = entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : '');
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            
            return {
                id: entry.id.$t.split('post-')[1],
                title: entry.title.$t,
                price: parseFloat(price) || 0,
                image: imgMatch ? imgMatch[1] : (entry.media$thumbnail ? entry.media$thumbnail.url.replace('s72-c', 's600') : 'https://via.placeholder.com/400x300?text=Sushi'),
                description: content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
            };
        });

        ProductsModule.render(ProductsModule.allProducts);
    },

    render: (items) => {
        const container = document.getElementById('shopContent');
        if (!container) return;

        container.innerHTML = items.map(item => `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="card h-100 bg-dark border-secondary text-white shadow-sm menu-item">
                    <div class="position-relative overflow-hidden">
                        <img src="${item.image}" class="card-img-top" alt="${item.title}" style="height: 200px; object-fit: cover;">
                    </div>
                    <div class="card-body d-flex flex-column p-3">
                        <h6 class="card-title fw-bold mb-1">${item.title}</h6>
                        <p class="card-text text-primary fw-bold mb-3 fs-5">${item.price} DH</p>
                        <button class="btn btn-primary w-100 rounded-pill mt-auto fw-bold" 
                                onclick="CartModule.add('${item.id}')">
                            + ADD TO ORDER
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};
