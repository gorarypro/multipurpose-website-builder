/**
 * FUSION v10.8.0 - products.js
 * Blogger Feed Parser & Dynamic Catalog Engine
 * Role: Fetches, parses, and renders products with category filtering.
 */

const ProductsModule = {
  catalog: [],
  categories: new Set(['all']),
  currentFilter: 'all',
  settings: {},

  /**
   * Initialize the module with synchronized settings
   */
  init: function(syncedSettings) {
    console.log("Products: Initializing Catalog...");
    this.settings = syncedSettings || window.FUSION_CONFIG.settings;
    this.fetchBloggerFeed();
    this.setupEventListeners();
  },

  /**
   * Request data from Blogger via JSONP
   */
  fetchBloggerFeed: function() {
    const domain = this.settings.base_url || 'eventsushi.blogspot.com';
    const script = document.createElement('script');
    
    // Blogger API v3 endpoint for JSON-in-script format
    script.src = `https://${domain}/feeds/posts/default?alt=json-in-script&max-results=150&callback=ProductsModule.parseFeed`;
    
    script.onerror = () => {
      console.error("Products Error: Could not reach Blogger feed.");
      this.renderError();
    };
    
    document.body.appendChild(script);
  },

  /**
   * Parse the raw JSON feed into usable product objects
   */
  parseFeed: function(json) {
    const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
    
    this.catalog = entries.map(entry => {
      // 1. Extract Price from Labels (format: price-150)
      let priceValue = 0;
      let categories = [];
      
      if (entry.category) {
        entry.category.forEach(cat => {
          const term = cat.term;
          if (term.startsWith('price-')) {
            priceValue = parseFloat(term.split('-')[1]);
          } else {
            categories.push(term.toLowerCase());
            this.categories.add(term.toLowerCase());
          }
        });
      }

      // 2. High-Res Image Logic
      const rawThumb = entry.media$thumbnail ? entry.media$thumbnail.url : 'https://via.placeholder.com/600';
      const highResImg = rawThumb.replace('/s72-c/', '/s600/');

      // 3. Construct Object
      return {
        id: entry.id.$t,
        title: entry.title.$t,
        content: entry.content ? entry.content.$t : "",
        price: priceValue,
        image: highResImg,
        categories: categories,
        link: entry.link.find(l => l.rel === 'alternate').href
      };
    });

    this.renderCategoryFilter();
    this.renderGrid();
  },

  /**
   * Builds the filter buttons based on Blogger labels
   */
  renderCategoryFilter: function() {
    const container = document.getElementById('filterContainer');
    if (!container) return;

    container.innerHTML = Array.from(this.categories).map(cat => `
      <button class="filter-btn ${this.currentFilter === cat ? 'active' : ''}" 
              data-filter="${cat}"
              onclick="ProductsModule.filterBy('${cat}')">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');
  },

  /**
   * Filters the grid based on selection
   */
  filterBy: function(category) {
    this.currentFilter = category;
    this.renderCategoryFilter();
    this.renderGrid();
  },

  /**
   * Core UI Rendering logic
   */
  renderGrid: function() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const currency = this.settings.currency_symbol || 'DH';
    
    // Filter the items
    const filteredItems = this.catalog.filter(p => {
      return this.currentFilter === 'all' || p.categories.includes(this.currentFilter);
    });

    if (filteredItems.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center py-5"><h5>Aucun produit trouvé dans cette catégorie.</h5></div>';
      return;
    }

    grid.innerHTML = filteredItems.map(p => `
      <div class="col-6 col-md-4 col-lg-3 mb-4 animate-fadeIn">
        <div class="card h-100 border-0 shadow-sm product-card">
          <div class="position-relative overflow-hidden bg-light rounded-top">
             <img src="${p.image}" class="card-img-top object-fit-cover" alt="${p.title}" style="aspect-ratio: 1/1;">
             ${this.settings.quickview_included === 'yes' ? `
               <button class="btn-quickview" onclick="QuickView.show('${p.id}')">
                 <i class="bi bi-eye"></i>
               </button>
             ` : ''}
          </div>
          <div class="card-body p-3 text-center">
            <h6 class="fw-bold mb-1 text-truncate">${p.title}</h6>
            <div class="text-primary fw-bold mb-3">${p.price} ${currency}</div>
            
            <button class="btn btn-primary btn-sm w-100 rounded-pill" 
                    onclick="CartModule.add('${p.id}', '${p.title.replace(/'/g, "\\'")}', ${p.price})">
              <i class="bi bi-cart-plus me-2"></i>AJOUTER
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderError: function() {
    const grid = document.getElementById('productGrid');
    if (grid) grid.innerHTML = '<div class="alert alert-danger">Erreur de chargement du menu.</div>';
  },

  setupEventListeners: function() {
    // Listener for the search bar from Builder Step 4
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        this.searchProducts(term);
      });
    }
  },

  searchProducts: function(term) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      const title = card.querySelector('h6').textContent.toLowerCase();
      card.parentElement.style.display = title.includes(term) ? 'block' : 'none';
    });
  }
};
