/**
 * FUSION v10.8.1 - variants.js
 * --------------------------------
 * Product Variant & Attribute Engine
 * Role:
 * - Parses variant syntax from Blogger content
 * - Renders selectable UI
 * - Persists selections per product
 * - Exposes selection to CartModule
 */

(function () {

  const VariantsModule = {
    selections: {},

    /**
     * Parse variant definitions from content
     * Syntax:
     * [options: Size|S,M,L; Color|Red,Blue]
     */
    parse(content) {
      if (!content) return null;

      const match = content.match(/\[options:\s*([^\]]+)\]/i);
      if (!match) return null;

      const groups = match[1].split(';');
      const map = {};

      groups.forEach(group => {
        const [name, values] = group.split('|');
        if (!name || !values) return;

        map[name.trim()] = values.split(',').map(v => v.trim());
      });

      return Object.keys(map).length ? map : null;
    },

    /**
     * Render variant selectors
     */
    renderSelector(productId, containerId, variantMap) {
      const container = document.getElementById(containerId);
      if (!container || !variantMap) return;

      this.selections[productId] = {};

      container.innerHTML = Object.entries(variantMap).map(([type, values]) => `
        <div class="variant-group mb-3" data-type="${type}">
          <div class="small fw-bold text-muted mb-2">${type}</div>
          <div class="d-flex flex-wrap gap-2">
            ${values.map(value => `
              <button type="button"
                class="btn btn-sm btn-outline-secondary variant-option"
                data-product="${productId}"
                data-type="${type}"
                data-value="${value}">
                ${value}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.variant-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.select(
            productId,
            btn.dataset.type,
            btn.dataset.value,
            btn
          );
        });
      });
    },

    /**
     * Handle selection
     */
    select(productId, type, value, element) {
      if (!this.selections[productId]) {
        this.selections[productId] = {};
      }

      this.selections[productId][type] = value;

      // UI active state (group scoped)
      const group = element.closest('.variant-group');
      if (group) {
        group.querySelectorAll('.variant-option').forEach(btn => {
          btn.classList.remove('active', 'btn-primary', 'text-white');
          btn.classList.add('btn-outline-secondary');
        });
      }

      element.classList.remove('btn-outline-secondary');
      element.classList.add('active', 'btn-primary', 'text-white');

      console.log(`Variants: ${productId} → ${type} = ${value}`);
    },

    /**
     * Get selected variants
     */
    getSelection(productId) {
      return this.selections[productId] || {};
    },

    /**
     * Reset variants for product (modal close safety)
     */
    reset(productId) {
      delete this.selections[productId];
    }
  };

  // Expose globally
  window.VariantsModule = VariantsModule;

})();
