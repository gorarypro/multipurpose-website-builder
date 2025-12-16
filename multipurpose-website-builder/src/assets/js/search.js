/**
 * Search Module
 * Filters the global product list based on title/description matches
 * and triggers a re-render of the product grid.
 */
window.Search = (function () {
  let searchInput = null;
  let debounceTimer = null;

  function init() {
    searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Listen for input with a slight delay (debounce) to avoid lag
    searchInput.addEventListener('input', function (e) {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim().toLowerCase();
      
      debounceTimer = setTimeout(function() {
        performSearch(query);
      }, 300);
    });
  }

  function performSearch(query) {
    // 1. Get all products from Runtime
    const allProducts = (window.Runtime && window.Runtime.products) ? window.Runtime.products : [];
    
    // 2. Filter logic
    let filtered = [];
    if (!query) {
      filtered = allProducts; // No query? Show all
    } else {
      filtered = allProducts.filter(function (p) {
        const title = (p.title || '').toLowerCase();
        // Strip HTML from content to search text only
        const content = (p.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
        
        return title.includes(query) || content.includes(query);
      });
    }

    // 3. Re-render the grid via Products module
    if (window.Products && typeof Products.renderGrid === 'function') {
      Products.renderGrid(filtered, window.Runtime.settings || {});
    }
  }

  // Auto-init when DOM is ready
  document.addEventListener("DOMContentLoaded", init);
  
  return { init: init };
})();
