/**
 * FUSION v10.8.0 - variants.js
 * Product Options & Attribute Manager
 * Role: Parses Blogger content for variant strings and manages selection.
 */

const VariantsModule = {
  activeSelection: {},

  /**
   * Scans a product's raw content for variant syntax
   * Syntax Example: [options: Size|Small,Medium,Large; Color|Red,Blue]
   */
  parse: function(content) {
    if (!content) return null;
    
    const regex = /\[options:\s*([^\]]+)\]/;
    const match = content.match(regex);
    
    if (!match) return null;

    const optionsString = match[1];
    const groups = optionsString.split(';');
    
    const variantMap = {};
    groups.forEach(group => {
      const [name, values] = group.split('|');
      if (name && values) {
        variantMap[name.trim()] = values.split(',').map(v => v.trim());
      }
    });

    return variantMap;
  },

  /**
   * Renders variant selection buttons into a container
   */
  renderSelector: function(productId, containerId, variantMap) {
    const container = document.getElementById(containerId);
    if (!container || !variantMap) return;

    container.innerHTML = Object.keys(variantMap).map(key => `
      <div class="variant-group mb-3">
        <label class="form-label small fw-bold text-muted">${key}</label>
        <div class="d-flex flex-wrap gap-2">
          ${variantMap[key].map(value => `
            <button class="btn btn-sm btn-outline-secondary variant-option" 
                    data-product="${productId}" 
                    data-type="${key}" 
                    data-value="${value}"
                    onclick="VariantsModule.select('${productId}', '${key}', '${value}', this)">
              ${value}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  /**
   * Handles user selection and updates the active state
   */
  select: function(productId, type, value, element) {
    if (!this.activeSelection[productId]) {
      this.activeSelection[productId] = {};
    }

    this.activeSelection[productId][type] = value;

    // Update UI active states in the specific group
    const group = element.closest('.variant-group');
    group.querySelectorAll('.variant-option').forEach(btn => btn.classList.remove('active', 'btn-primary', 'text-white'));
    
    element.classList.add('active', 'btn-primary', 'text-white');
    console.log(`Variants: Product ${productId} - ${type} set to ${value}`);
  },

  /**
   * Retrieves the current selection for the CartModule
   */
  getSelection: function(productId) {
    return this.activeSelection[productId] || {};
  }
};
