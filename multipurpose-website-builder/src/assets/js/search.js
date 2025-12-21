/**
 * FUSION v6.7.1 - search.js
 * Client-side Search Engine Module
 */

const SearchModule = {
  searchInput: null,
  productGrid: null,
  isInitialized: false,
  
  /**
   * Initialize the search module
   */
  init: function() {
    console.log("SearchModule: Initializing...");
    
    // Get DOM elements
    this.searchInput = document.getElementById('searchInput');
    this.productGrid = document.getElementById('productGrid');
    
    if (!this.searchInput || !this.productGrid) {
      console.warn("SearchModule: Required elements not found. Skipping initialization.");
      return;
    }
    
    // Add event listener
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
    
    // Add clear button functionality
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-sm btn-outline-secondary ms-2';
    clearBtn.innerHTML = '<i class="bi bi-x"></i>';
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.handleSearch('');
      clearBtn.style.display = 'none';
    });
    
    this.searchInput.parentNode.appendChild(clearBtn);
    
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
    
    products.forEach(product => {
      const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const description = product.querySelector('.product-description')?.textContent.toLowerCase() || '';
      const tags = product.querySelector('.product-tags')?.textContent.toLowerCase() || '';
      
      const isVisible = title.includes(query.toLowerCase()) || 
                      description.includes(query.toLowerCase()) ||
                      tags.includes(query.toLowerCase());
      
      product.style.display = isVisible ? 'block' : 'none';
      if (isVisible) visibleCount++;
    });
    
    // Show/hide clear button
    const clearBtn = this.searchInput.parentNode.querySelector('button');
    if (clearBtn) {
      clearBtn.style.display = query ? 'inline-block' : 'none';
    }
    
    // Update UI feedback
    this.updateSearchUI(visibleCount, products.length);
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
    const clearBtn = this.searchInput.parentNode.querySelector('button');
    if (clearBtn) {
      clearBtn.style.display = 'none';
    }
    
    this.updateSearchUI(products.length, products.length);
  },
  
  /**
   * Update search UI with results count
   */
  updateSearchUI: function(visibleCount, totalCount) {
    // You can implement UI feedback here
    // For example: show "X of Y results" or highlight matches
  },
  
  /**
   * Reset search state
   */
  reset: function() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.handleSearch('');
    }
  }
};

// Auto-initialize when runtime is ready
document.addEventListener('runtime_ready', () => {
  if (window.SETTINGS.search_included === 'yes') {
    SearchModule.init();
  }
});
