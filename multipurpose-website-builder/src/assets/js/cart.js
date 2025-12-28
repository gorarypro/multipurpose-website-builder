window.Cart = (function () {

  const KEY = 'fusion_cart';

  function load() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  function add(btn) {
    const card = btn.closest('.product-card');
    const id = card.dataset.id;
    const price = parseFloat(card.dataset.price);

    const variants = {};
    card.querySelectorAll('.variant').forEach(sel => {
      variants[sel.dataset.variant] = sel.value;
    });

    const cart = load();

    cart.push({
      id,
      title: card.querySelector('h3').innerText,
      price,
      variants,
      qty: 1
    });

    save(cart);
    alert('Added to cart');
  }

  function total() {
    return load().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function items() {
    return load();
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  return { add, total, items, clear };

})();
