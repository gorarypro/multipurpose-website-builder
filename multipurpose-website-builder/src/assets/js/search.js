/**
 * FUSION ENGINE v14.0.0 - search.js
 * Search Engine & Discovery Analytics
 * -----------------------------------------------------
 * Role: Provides real-time grid filtering and query logging.
 */

window.FusionSearch = (function () {
  const state = {
    settings: window.FUSION_SETTINGS || {},
    searchTimer: null,
    minChars: 2
  };

  /**
   * Initialize search listeners
   */
  function init() {
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim().toLowerCase();
      
      // Perform immediate UI filtering
      filterGrid(term);

      // Debounce analytics logging
      clearTimeout(state.searchTimer);
      if (term.length >= state.minChars) {
        state.searchTimer = setTimeout(() => logToBackend(term), 1200);
      }
    });
    
    console.log("FusionSearch: Discovery Engine Active");
  }

  /**
   * Optimized Grid Filtering
   */
  function filterGrid(term) {
    const items = document.querySelectorAll('.content-item');
    let foundCount = 0;

    items.forEach(item => {
      const title = item.querySelector('.card-title').textContent.toLowerCase();
      const parent = item.closest('.col');

      if (title.includes(term)) {
        if (parent) parent.style.display = 'block';
        foundCount++;
      } else {
        if (parent) parent.style.display = 'none';
      }
    });

    updateStatus(term, foundCount);
  }

  /**
   * Localized Status Update
   */
  function updateStatus(term, count) {
    const statusEl = document.getElementById('searchStatus');
    if (!statusEl) return;

    if (term === '') {
      statusEl.style.display = 'none';
    } else {
      statusEl.style.display = 'block';
      // Uses I18n if available, falls back to French as per original logic
      const label = window.FusionI18n 
        ? `${count} ${FusionI18n.get('SEARCH_RESULTS_FOR')} "${term}"`
        : `${count} résultats pour "${term}"`;
      statusEl.textContent = label;
    }
  }

  /**
   * Logs query to Entries sheet via GAS
   */
  function logToBackend(term) {
    if (state.settings.analytics_included !== 'yes') return;

    const payload = {
      type: 'search_query',
      term: term,
      timestamp: new Date().toISOString()
    };

    if (window.google && google.script) {
      google.script.run.saveEntry(JSON.stringify(payload));
    }
  }

  return { init };
})();

// Initialize on Fusion Runtime ready
window.addEventListener('fusion:ready', () => FusionSearch.init());
