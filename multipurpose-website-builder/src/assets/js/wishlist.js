/**
 * Wishlist with localStorage
 */
window.Wishlist = {
  key: 'mpwb_wishlist',
  items: [],

  init() {
    try {
      const raw = localStorage.getItem(this.key);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.items = [];
    }
    this.updateBadge();
    this.renderModal();
  },

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
    this.renderModal();
  },

  toggle(product) {
    const idx = this.items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      this.items.splice(idx, 1);
    } else {
      this.items.push({
        id: product.id,
        title: product.title
      });
    }
    this.save();
  },

  updateBadge() {
    const count = this.items.length;

    const ids = ['wishlistCount', 'floatingWishlistCount'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = count;
      }
    });
  },

  renderModal() {
    const cont = document.getElementById('wishlistContent');
    const empty = document.getElementById('wishlistEmpty');
    if (!cont) return;

    cont.innerHTML = '';

    if (!this.items.length) {
      if (empty) empty.classList.remove('d-none');
      return;
    }

    if (empty) empty.classList.add('d-none');

    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';

    this.items.forEach(i => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<span>${i.title}</span>`;
      ul.appendChild(li);
    });

    cont.appendChild(ul);
  }
};
