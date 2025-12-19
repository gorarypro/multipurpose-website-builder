/**
 * FUSION v6.7.1 - products.js
 * Blogger Feed Parser & Grid Renderer
 */

const ProductsModule = {
  catalog: [],

  init: function() {
    console.log("Products: Initializing Catalog...");
    this.fetchBloggerFeed();
  },

  fetchBloggerFeed: function() {
    const domain = Fusion.settings.base_url || 'eventsushi.blogspot.com';
    const script = document.createElement('script');
    // alt=json-in-script is the standard Blogger API v3 response format
    script.src = `https://${domain}/feeds/posts/default?alt=json-in-script&max-results=100&callback=ProductsModule.parseFeed`;
    document.body.appendChild(script);
  },

  parseFeed: function(json) {
    const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
    
    this.catalog = entries.map(entry => {
      // Find Price in Labels (expects label format: price-150)
      let priceValue = 0;
      if (entry.category) {
        const pLabel = entry.category.find(c => c.term.startsWith('price-'));
        if (pLabel) priceValue = parseFloat(pLabel.term.split('-')[1]);
      }

      // Process Image
      const thumb = entry.media$thumbnail ? entry.media$thumbnail.url.replace('s72-c', 's600') : 'https://via.placeholder.com/600x400';

      return {
        id: entry.id.$t,
        title: entry.title.$t,
        content: entry.content ? entry.content.$t : "",
        price: priceValue,
        image: thumb,
        link: entry.link.find(l => l.rel === 'alternate').href
      };
    });

    this.renderGrid();
  },

  renderGrid: function() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const currency = Fusion.settings.currency_symbol || 'DH';

    if (this.catalog.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center py-5"><h5>No products found.</h5></div>';
      return;
    }

    grid.innerHTML = this.catalog.map(p => `
      <div class="col-6 col-md-4 col-lg-3 mb-4 animate-fadeIn">
        <div class="card h-100 border-0 shadow-sm product-card">
          <div class="ratio ratio-1x1 overflow-hidden bg-light rounded-top">
            <img src="${p.image}" class="object-fit-cover w-100 h-100 transition-scale" alt="${p.title}">
          </div>
          <div class="card-body p-3 text-center">
            <h6 class="fw-bold mb-1 text-truncate">${p.title}</h6>
            <div class="text-primary fw-bold mb-3">${p.price} ${currency}</div>
            <button class="btn btn-primary btn-sm w-100 rounded-pill" 
                    onclick="CartModule.add('${p.id}', '${p.title.replace(/'/g, "\\'")}', ${p.price})">
              <i class="bi bi-plus-circle me-2"></i>AJOUTER
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
};
