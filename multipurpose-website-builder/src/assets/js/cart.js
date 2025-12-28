/*************************************************
 * CART ENGINE (Variant-Aware)
 *************************************************/

window.FusionCart = (function () {

  const KEY = 'fusion_cart_v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  function add(product, variantState) {
    const cart = load();
    const variantKey = FusionVariants.serialize(variantState);

    const found = cart.find(
      i => i.id === product.id && i.variantKey === variantKey
    );

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
    renderCount();
  }

  function remove(index) {
    const cart = load();
    cart.splice(index, 1);
    save(cart);
    renderCount();
  }

  function clear() {
    save([]);
    renderCount();
  }

  function total() {
    return load().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function renderCount() {
    const el = document.querySelector('[data-cart-count]');
    if (el) el.textContent = load().length;
  }

  return {
    load,
    add,
    remove,
    clear,
    total,
    renderCount
  };

})();
