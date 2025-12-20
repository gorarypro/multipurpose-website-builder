const CartModule = {
  items: [],
  init: function() {
    const saved = localStorage.getItem('fusion_cart');
    if (saved) this.items = JSON.parse(saved);
    this.update();
  },
  add: function(id, title, price) {
    const found = this.items.find(i => i.id === id);
    if (found) found.qty++; else this.items.push({ id, title, price, qty: 1 });
    this.sync();
  },
  sync: function() {
    localStorage.setItem('fusion_cart', JSON.stringify(this.items));
    this.update();
  },
  update: function() {
    const count = this.items.reduce((acc, i) => acc + i.qty, 0);
    document.getElementById('cartCount').textContent = count;
  }
};
