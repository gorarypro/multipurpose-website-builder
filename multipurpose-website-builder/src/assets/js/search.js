/**
 * FUSION v6.7.1 - search.js
 * Client-side Search Engine Module with Analytics Integration
 */

const SearchModule = {
  searchInput: null,
  productGrid: null,
  clearButton: null,
  isInitialized: false,
  searchAnalyticsEnabled: false,
  
  /**
   * Initialize the search module
   */
  init: function() {
    console.log("SearchModule: Initializing...");
    
    // Get DOM elements
    this.searchInput = document.getElementById('searchInput');
    this.productGrid = document.getElementById('productGrid');
    this.clearButton = this.searchInput?.parentNode?.querySelector('button');
    
    if (!this.searchInput || !this.productGrid) {
      console.warn("SearchModule: Required elements not found. Skipping initialization.");
      return;
    }
    
    // Check if search analytics is enabled in settings
    this.searchAnalyticsEnabled = window.SETTINGS?.search_analytics_enabled === 'yes';
    
    // Add event listeners
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
    
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => {
        this.searchInput.value = '';
        this.handleSearch('');
        this.clearButton.style.display = 'none';
      });
    }
    
    // Add keyboard shortcuts
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchInput.value = '';
        this.handleSearch('');
        this.clearButton?.click();
      }
    });
    
    this.isInitialized = true;
    console.log("SearchModule: Successfully initialized.");
  },
  
  /**
   * Handle search input and filter products
   */
  handleSearch: function(query) {
    if (!query) {
      this.showAllProducts();
      return;
    }
    
    const products = this.productGrid.querySelectorAll('.product-card');
    let visibleCount = 0;
    const searchTerms = query.toLowerCase().trim().split(' ');
    
    products.forEach(product => {
      const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const description = product.querySelector('.product-description')?.textContent.toLowerCase() || '';
      const tags = product.querySelector('.product-tags')?.textContent.toLowerCase() || '';
      
      // Check if product matches any search term
      const isVisible = searchTerms.some(term => 
        title.includes(term) || 
        description.includes(term) ||
        tags.includes(term)
      );
      
      product.style.display = isVisible ? 'block' : 'none';
      if (isVisible) visibleCount++;
    });
    
    // Show/hide clear button
    if (this.clearButton) {
      this.clearButton.style.display = query ? 'inline-block' : 'none';
    }
    
    // Update UI feedback
    this.updateSearchUI(visibleCount, products.length, query);
    
    // Track search analytics if enabled
    if (this.searchAnalyticsEnabled && query.length > 0) {
      this.trackSearchAnalytics(query, visibleCount, products.length);
    }
  },
  
  /**
   * Track search analytics with backend
   */
  trackSearchAnalytics: function(searchTerm, resultsFound, totalProducts) {
    if (!window.BASE_SCRIPT_URL) {
      console.warn("SearchModule: BASE_SCRIPT_URL not available for analytics.");
      return;
    }
    
    // Create a script element for JSONP call
    const script = document.createElement('script');
    script.src = `${window.BASE_SCRIPT_URL}?action=save_search&term=${encodeURIComponent(searchTerm)}&callback=SearchModule.onAnalyticsSaved&results=${resultsFound}&total=${totalProducts}`;
    script.onerror = () => {
      console.warn("SearchModule: Failed to track search analytics.");
    };
    
    // Clean up the script after execution
    script.onload = () => {
      document.body.removeChild(script);
    };
    
    document.body.appendChild(script);
  },
  
  /**
   * Callback for analytics save operation
   */
  onAnalyticsSaved: function(response) {
    if (response?.status === 'success') {
      console.log("SearchModule: Analytics tracked successfully.");
    } else {
      console.warn("SearchModule: Analytics tracking failed:", response?.message);
    }
  },
  
  /**
   * Show all products (clear search)
   */
  showAllProducts: function() {
    const products = this.productGrid.querySelectorAll('.product-card');
    products.forEach(product => {
      product.style.display = 'block';
    });
    
    // Hide clear button
    if (this.clearButton) {
      this.clearButton.style.display = 'none';
    }
    
    this.updateSearchUI(products.length, products.length, '');
  },
  
  /**
   * Update search UI with results count and feedback
   */
  updateSearchUI: function(visibleCount, totalCount, query) {
    // Remove existing feedback elements
    const existingFeedback = document.getElementById('search-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    
    // Create new feedback element
    const feedback = document.createElement('div');
    feedback.id = 'search-feedback';
    feedback.className = 'search-results-info mt-2';
    
    if (query) {
      if (visibleCount === 0) {
        feedback.innerHTML = `
          <div class="search-no-results">
            <i class="bi bi-search"></i>
            <p>No products found matching "${query}"</p>
          </div>
        `;
      } else {
        feedback.innerHTML = `
          <span>Found ${visibleCount} of ${totalCount} products matching "${query}"</span>
        `;
      }
    } else {
      feedback.innerHTML = `<span>Show all ${totalCount} products</span>`;
    }
    
    // Insert feedback after search input
    this.searchInput.parentNode.appendChild(feedback);
  },
  
  /**
   * Reset search state
   */
  reset: function() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.handleSearch('');
    }
  },
  
  /**
   * Highlight search terms in product cards
   */
  highlightSearchTerms: function(product, searchTerm) {
    const title = product.querySelector('.product-title');
    const description = product.querySelector('.product-description');
    
    if (title && searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      title.innerHTML = title.textContent.replace(regex, '<mark>$1</mark>');
    }
    
    if (description && searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      description.innerHTML = description.textContent.replace(regex, '<mark>$1</mark>');
    }
  },
  
  /**
   * Debounce function to optimize search performance
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Create debounced search handler for better performance
SearchModule.handleSearch = SearchModule.debounce(SearchModule.handleSearch, 300);

// Auto-initialize when runtime is ready
document.addEventListener('runtime_ready', () => {
  if (window.SETTINGS.search_included === 'yes') {
    // Add settings to window for easy access
    window.SearchModule = SearchModule;
    SearchModule.init();
  }
});

// Global function for external access
window.SearchModule = SearchModule;
