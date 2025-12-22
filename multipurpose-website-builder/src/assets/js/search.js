/**
 * FUSION v10.8.0 - search.js
 * Search Engine & Discovery Analytics
 * Role: Provides real-time grid filtering and query logging.
 */

const SearchModule = {
  settings: {},
  searchTimer: null,
  minChars: 2,

  /**
   * Initialize search listeners and sync settings
   */
  init: function(syncedSettings) {
    console.log("Search: Initializing Discovery Module...");
    this.settings = syncedSettings || window.FUSION_CONFIG.settings;
    
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) {
      console.warn("Search: Input element #productSearch not found.");
      return;
    }

    this.bindEvents(searchInput);
  },

  /**
   * Set up input listeners with debouncing to save API calls
   */
  bindEvents: function(input) {
    input.addEventListener('input', (e) => {
      const term = e.target.value.trim();
      
      // Perform immediate UI filtering
      this.filterGrid(term.toLowerCase());

      // Debounce the analytics recording (wait 1 second after typing stops)
      clearTimeout(this.searchTimer);
      if (term.length >= this.minChars) {
        this.searchTimer = setTimeout(() => {
          this.logSearchToBackend(term);
        }, 1000);
      }
    });
  },

  /**
   * Filters the ProductModule catalog in real-time
   */
  filterGrid: function(term) {
    const cards = document.querySelectorAll('.product-card');
    let foundCount = 0;

    cards.forEach(card => {
      // Find the title element within the card
      const title = card.querySelector('h6').textContent.toLowerCase();
      const parent = card.closest('.col-6, .col-md-4, .col-lg-3');

      if (title.includes(term)) {
        if (parent) parent.style.display = 'block';
        foundCount++;
      } else {
        if (parent) parent.style.display = 'none';
      }
    });

    this.updateStatus(term, foundCount);
  },

  /**
   * Updates a status message if present in the UI
   */
  updateStatus: function(term, count) {
    const statusEl = document.getElementById('searchStatus');
    if (!statusEl) return;

    if (term === '') {
      statusEl.style.display = 'none';
    } else {
      statusEl.style.display = 'block';
      statusEl.textContent = `${count} résultats pour "${term}"`;
    }
  },

  /**
   * Sends the search term to Code.gs for spreadsheet archival
   */
  logSearchToBackend: function(term) {
    if (this.settings.analytics_included !== 'yes') return;

    console.log(`Search Analytics: Logging "${term}"...`);
    
    const apiBase = (window.FUSION_CONFIG && window.FUSION_CONFIG.apiUrl) || window.BASE_SCRIPT_URL;
    const script = document.createElement('script');
    
    // Calls the save_search action defined in your backend Code.gs
    script.src = `${apiBase}?action=save_search&term=${encodeURIComponent(term)}&callback=SearchModule.onLogSuccess`;
    document.body.appendChild(script);
  },

  onLogSuccess: function(res) {
    if (res.status === 'success') {
      console.log("Search Analytics: Data synced.");
    }
  }
};
