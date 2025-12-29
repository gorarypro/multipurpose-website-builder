/**
 * FUSION ENGINE v13.1.0 - variants.js
 * Dynamic Variant Selector Engine
 * -----------------------------------------------------
 * Responsibilities:
 * - Generating DOM selectors from product labels
 * - Managing real-time selection state
 * - Serializing variants for unique cart keys
 */

window.FusionVariants = (function () {

  /**
   * Generates Bootstrap-styled selectors inside a container
   * @param {Object} variants - The variants object from FusionCatalog
   * @param {HTMLElement} container - The target DOM element
   * @returns {Object} - A reference to the live selection state
   */
  function createSelectors(variants, container) {
    if (!container) return {};
    container.innerHTML = '';
    
    // Shared state object for this specific render instance
    const state = {};

    Object.keys(variants).forEach(type => {
      const wrap = document.createElement('div');
      wrap.className = 'mb-3 variant-group';

      const label = document.createElement('label');
      label.className = 'form-label small fw-bold text-uppercase text-muted';
      label.textContent = type;
      wrap.appendChild(label);

      const select = document.createElement('select');
      select.className = 'form-select form-select-sm';
      select.dataset.variantType = type;

      variants[type].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });

      // Update state reference on user change
      select.addEventListener('change', (e) => {
        state[type] = e.target.value;
      });

      // Initialize with the first available option
      state[type] = variants[type][0];
      
      wrap.appendChild(select);
      container.appendChild(wrap);
    });

    return state;
  }

  /**
   * Converts state object to a unique string key
   * Example: { color: "Red", size: "M" } -> "color:Red|size:M"
   */
  function serialize(state) {
    if (!state || Object.keys(state).length === 0) return 'default';
    return Object.keys(state)
      .sort() // Ensure consistent key regardless of insertion order
      .map(k => `${k}:${state[k]}`)
      .join('|');
  }

  return {
    createSelectors,
    serialize
  };

})();
