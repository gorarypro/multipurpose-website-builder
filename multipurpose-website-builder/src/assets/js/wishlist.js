/**
 * Wishlist with localStorage
 */

window.Wishlist = {
  key: 'mpwb_wishlist',
  items: [],

  init: function () {
    try {
      var raw = localStorage.getItem(this.key);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.items = [];
    }
    this.updateBadge();
    this.renderModal();
  },

  save: function () {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
    this.renderModal();
  },

  toggle: function (product) {
    var id = String(product && product.id ? product.id : "");
    if (!id) return;

    var idx = -1;
    for (var i = 0; i < this.items.length; i++) {
      if (String(this.items[i].id) === id) { idx = i; break; }
    }

    if (idx >= 0) {
      this.items.splice(idx, 1);
    } else {
      this.items.push({ id: id, title: product.title || "" });
    }
    this.save();
  },

  removeById: function (productId) {
    var id = String(productId);
    this.items = this.items.filter(function (x) { return String(x.id) !== id; });
    this.save();
  },

  updateBadge: function () {
    var count = this.items.length;
    ['wishlistCount', 'floatingWishlistCount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(count);
    });
  },

  renderModal: function () {
    var cont = document.getElementById('wishlistContent');
    var empty = document.getElementById('wishlistEmpty');
    if (!cont) return;

    cont.innerHTML = '';

    if (!this.items.length) {
      if (empty) empty.classList.remove('d-none');
      return;
    }

    if (empty) empty.classList.add('d-none');

    var ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';

    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];

      var li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';

      li.innerHTML =
        "<span>" + (it.title || "") + "</span>" +
        "<button type='button' class='btn btn-sm btn-outline-danger' data-id='" + String(it.id) + "'>&times;</button>";

      ul.appendChild(li);
    }

    cont.appendChild(ul);

    var self = this;
    cont.onclick = function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button[data-id]") : null;
      if (!btn) return;
      ev.preventDefault();
      self.removeById(btn.getAttribute("data-id"));
    };
  }
};

// auto-init
document.addEventListener("runtime_ready", function () {
  try { Wishlist.init(); } catch (e) {}
});
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    try { Wishlist.init(); } catch (e) {}
  }, 800);
});
