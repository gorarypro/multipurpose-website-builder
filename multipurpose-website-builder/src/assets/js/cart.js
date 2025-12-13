/**
 * Cart logic with localStorage
 * - Adds +/- controls
 * - Checkout saves detailed rows (per item) via Runtime.saveEntry()
 */

window.Cart = {
  key: 'mpwb_cart',
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
    this.bindCheckout();
  },

  save: function () {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
    this.renderModal();
  },

  add: function (product, qty, variants) {
    qty = parseInt(qty, 10) || 1;
    var id = String(product && product.id ? product.id : '');

    if (!id) return;

    var existing = null;
    for (var i = 0; i < this.items.length; i++) {
      if (String(this.items[i].id) === id) {
        existing = this.items[i];
        break;
      }
    }

    if (existing) {
      existing.qty = (parseInt(existing.qty, 10) || 1) + qty;
    } else {
      this.items.push({
        id: id,
        title: product.title || '',
        price: product.price || 0,
        qty: qty,
        variants: variants || product.variants || null
      });
    }

    this.save();
  },

  inc: function (productId) {
    var id = String(productId);
    for (var i = 0; i < this.items.length; i++) {
      if (String(this.items[i].id) === id) {
        this.items[i].qty = (parseInt(this.items[i].qty, 10) || 1) + 1;
        break;
      }
    }
    this.save();
  },

  dec: function (productId) {
    var id = String(productId);
    for (var i = 0; i < this.items.length; i++) {
      if (String(this.items[i].id) === id) {
        var q = (parseInt(this.items[i].qty, 10) || 1) - 1;
        if (q < 1) q = 1;
        this.items[i].qty = q;
        break;
      }
    }
    this.save();
  },

  removeById: function (productId) {
    var id = String(productId);
    this.items = this.items.filter(function (x) { return String(x.id) !== id; });
    this.save();
  },

  total: function () {
    var sum = 0;
    for (var i = 0; i < this.items.length; i++) {
      sum += (parseFloat(this.items[i].price || 0) * (parseInt(this.items[i].qty, 10) || 1));
    }
    return sum;
  },

  updateBadge: function () {
    var qty = 0;
    for (var i = 0; i < this.items.length; i++) qty += (parseInt(this.items[i].qty, 10) || 0);

    ['cartCount', 'floatingCartCount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(qty);
    });
  },

  renderModal: function () {
    var cont = document.getElementById('cartContent');
    var empty = document.getElementById('cartEmpty');
    var totalEl = document.getElementById('cartTotal');

    if (!cont || !totalEl) return;

    cont.innerHTML = '';

    if (!this.items.length) {
      if (empty) empty.classList.remove('d-none');
      totalEl.textContent = '0';
      return;
    }

    if (empty) empty.classList.add('d-none');

    var table = document.createElement('table');
    table.className = 'table table-sm align-middle';

    table.innerHTML =
      "<thead>" +
        "<tr>" +
          "<th>Item</th>" +
          "<th class='text-end'>Qty</th>" +
          "<th class='text-end'>Price</th>" +
          "<th class='text-end'>Total</th>" +
          "<th class='text-end'></th>" +
        "</tr>" +
      "</thead>";

    var tbody = document.createElement('tbody');

    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      var pid = String(it.id);
      var price = parseFloat(it.price || 0);
      if (isNaN(price)) price = 0;

      var qty = parseInt(it.qty, 10) || 1;
      var lineTotal = (price * qty);

      var tr = document.createElement('tr');
      tr.innerHTML =
        "<td>" + (it.title || "") + "</td>" +
        "<td class='text-end'>" +
          "<div class='d-inline-flex align-items-center gap-1'>" +
            "<button type='button' class='btn btn-sm btn-outline-secondary' data-act='dec' data-id='" + pid + "'>-</button>" +
            "<span class='px-2'>" + qty + "</span>" +
            "<button type='button' class='btn btn-sm btn-outline-secondary' data-act='inc' data-id='" + pid + "'>+</button>" +
          "</div>" +
        "</td>" +
        "<td class='text-end'>" + price.toFixed(2) + "</td>" +
        "<td class='text-end'>" + lineTotal.toFixed(2) + "</td>" +
        "<td class='text-end'>" +
          "<button type='button' class='btn btn-sm btn-outline-danger' data-act='del' data-id='" + pid + "'>&times;</button>" +
        "</td>";

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    cont.appendChild(table);

    var self = this;
    cont.onclick = function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button[data-act]") : null;
      if (!btn) return;

      ev.preventDefault();

      var act = btn.getAttribute("data-act");
      var pid = btn.getAttribute("data-id");

      if (act === "inc") self.inc(pid);
      else if (act === "dec") self.dec(pid);
      else if (act === "del") self.removeById(pid);
    };

    totalEl.textContent = this.total().toFixed(2);
  },

  bindCheckout: function () {
    var btn = document.getElementById('checkoutButton');
    if (!btn) return;
    if (btn.__bound_cart) return;
    btn.__bound_cart = true;

    var self = this;

    btn.addEventListener('click', async function () {
      if (!self.items.length) return;

      if (!window.Runtime || typeof Runtime.saveEntry !== "function") {
        alert("Checkout error: Runtime.saveEntry is not available.");
        return;
      }

      var name = prompt("Name?");
      if (name === null) return;

      var email = prompt("Email? (optional)") || "";
      var phone = prompt("Phone?") || "";
      var message = prompt("Message / Address (optional)") || "";

      var ts = (new Date()).toISOString();

      try {
        for (var i = 0; i < self.items.length; i++) {
          var it = self.items[i];
          var qty = parseInt(it.qty, 10) || 1;
          var price = parseFloat(it.price || 0);
          if (isNaN(price)) price = 0;

          var variantsStr = "";
          try { variantsStr = it.variants ? JSON.stringify(it.variants) : ""; } catch (e) { variantsStr = ""; }

          var entry = {
            timestamp: ts,
            type: "order",
            product_id: String(it.id || ""),
            title: String(it.title || ""),
            variants: variantsStr,
            qty: qty,
            price: price,
            total: parseFloat((price * qty).toFixed(2)),
            name: String(name || ""),
            email: String(email || ""),
            phone: String(phone || ""),
            message: String(message || "")
          };

          await Runtime.saveEntry(entry);
        }

        alert("Order submitted!");
        self.items = [];
        self.save();

      } catch (e2) {
        console.error("Checkout failed:", e2);
        alert("Could not submit order.");
      }
    });
  }
};

// auto-init (runtime may also init, but double init is safe)
document.addEventListener("runtime_ready", function () {
  try { Cart.init(); } catch (e) {}
});
document.addEventListener("DOMContentLoaded", function () {
  // If runtime doesn't fire (rare), still init
  setTimeout(function () {
    if (!Cart.__inited) {
      try { Cart.init(); } catch (e) {}
    }
  }, 800);
});
