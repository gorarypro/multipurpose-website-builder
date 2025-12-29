/**
 * FUSION ENGINE v12.0.0 - cart.js
 * Persistent, Variant-Aware Cart Logic
 * -----------------------------------------------------
 * Responsibilities:
 * - LocalStorage state management
 * - Checkout lead preparation for Code.gs
 * - Global event dispatching (fusion:cart_updated)
 */

window.FusionCart = (function () {
  const KEY = 'fusion_cart_v1';

  /**
   * Load cart from LocalStorage
   */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch { return []; }
  }

  /**
   * Save cart and notify other modules
   */
  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    // Dispatch event for UI sync (cart-ui.js, runtime.js)
    window.dispatchEvent(new CustomEvent('fusion:cart_updated', { detail: cart }));
  }

  /**
   * Add item to cart with variant support
   */
  function add(product, variantState = {}) {
    const cart = load();
    
    // Safely generate a unique key for this product+variant combination
    const variantKey = window.FusionVariants 
      ? FusionVariants.serialize(variantState) 
      : JSON.stringify(variantState);

    const found = cart.find(i => i.id === product.id && i.variantKey === variantKey);

    if (found) {
      found.qty += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        variantKey,
        variants: { ...variantState },
        qty: 1,
        image: product.image
      });
    }
    save(cart);
  }

  function remove(index) {
    const cart = load();
    cart.splice(index, 1);
    save(cart);
  }

  function clear() { 
    save([]); 
  }

  function total() {
    return load().reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  }

  /**
   * CHECKOUT LOGIC
   * Communicates with saveEntry in Code.gs
   */
  async function checkout(details) {
    const cartItems = load();
    if (cartItems.length === 0) return { status: 'error', message: 'Cart is empty' };

    const payload = {
      type: 'order',
      name: details.name,
      email: details.email,
      phone: details.phone,
      // Map address/notes to the "message" column in Code.gs v13.1.0
      message: details.address || details.message || '',
      total: total(),
      items: cartItems,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      // Check if running in Google Apps Script environment
      if (window.google && google.script) {
        google.script.run
          .withSuccessHandler(res => {
            if (res.status === 'ok') {
              clear();
              resolve(res);
            } else {
              reject(res);
            }
          })
          .withFailureHandler(err => reject(err))
          .saveEntry(JSON.stringify(payload));
      } else {
        // Fallback for simulation/local preview
        console.log("Fusion Engine: Checkout Simulation Payload:", payload);
        setTimeout(() => {
          clear();
          resolve({ status: 'ok', simulation: true });
        }, 1500);
      }
    });
  }

  return { load, add, remove, clear, total, checkout };
})();

/**
 * Global UI Synchronization
 * Automatically updates navbar and floating cart counts
 */
window.addEventListener('fusion:cart_updated', (e) => {
  const cart = e.detail || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Update standard navbar and floating button count elements
  ['cartCount', 'floatingCartCount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });
});
