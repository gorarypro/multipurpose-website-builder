/**
 * FUSION v10.8.1 - variants.js
 * Product Options & Attribute Manager
 * Role: Parses content for variant strings and manages selection.
 */

const VariantsModule = {
  activeSelection: {},

  /**
   * Parse product content for variant options
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
   * Render variant selection buttons into a container
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
   * Handle user selection and update active state
   */
  select: function(productId, type, value, element) {
    if (!this.activeSelection[productId]) this.activeSelection[productId] = {};
    this.activeSelection[productId][type] = value;

    // Update UI active states
    const group = element.closest('.variant-group');
    group.querySelectorAll('.variant-option').forEach(btn => btn.classList.remove('active', 'btn-primary', 'text-white'));
    
    element.classList.add('active', 'btn-primary', 'text-white');
    console.log(`Variants: Product ${productId} - ${type} set to ${value}`);
  },

  /**
   * Retrieve current selection for CartModule
   */
  getSelection: function(productId) {
    return this.activeSelection[productId] || {};
  }
};

/**
 * Auto-initialize variant rendering if DOM content is available
 */
document.addEventListener('DOMContentLoaded', function() {
  const variantContainers = document.querySelectorAll('[data-variant-container]');
  variantContainers.forEach(container => {
    const content = container.getAttribute('data-variant-content');
    const productId = container.getAttribute('data-product-id');
    const variantMap = VariantsModule.parse(content);
    if (variantMap) VariantsModule.renderSelector(productId, container.id, variantMap);
  });
  
});
window.VariantsModule = VariantsModule;
