/**
 * Cart logic with localStorage
 * - Adds +/- controls
 * - Checkout saves detailed rows (per item) via Runtime.saveEntry()
 * - The CART MODAL acts as the Checkout Popup (asking for info).
 * - FIX: Explicitly closes the modal to prevent stuck backdrops (gray overlay).
 * - FIX: Implements a reliable Bootstrap alert modal instead of browser alert().
 */

window.Cart = {
  key: 'mpwb_cart',
  items: [],

  // Refactored Modal for alerts/messages
  alertModal: {
    _el: null,      // Stores the DOM element
    _instance: null, // Stores the Bootstrap instance

    getDom: function(title, message) {
      if (!this._el) {
        // --- 1. Create and append the DOM element once ---
        this._el = document.createElement('div');
        this._el.className = 'modal fade';
        this._el.id = 'cartAlertModal';
        this._el.setAttribute('tabindex', '-1');
        this._el.setAttribute('aria-hidden', 'true');
        this._el.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="cartAlertModalTitle">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="cartAlertModalBody">
                <p>${message}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(this._el);
        
        // --- 2. Create the Bootstrap instance once ---
        this._instance = new bootstrap.Modal(this._el);
      } else {
        // --- 3. Update content on subsequent calls ---
        this._el.querySelector('.modal-title').textContent = title;
        this._el.querySelector('.modal-body p').innerHTML = message;
      }
      return this._instance;
    },
    
    show: function(message, title = "Message") {
      if (!window.bootstrap || !window.bootstrap.Modal) {
          // Fallback if Bootstrap is missing (e.g., if external scripts fail to load)
          console.error("Bootstrap Modal library is missing.");
          alert(title + ": " + message); 
          return;
      }
      const modalInstance = this.getDom(title, message);
      modalInstance.show();
    }
  },

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
    var fieldsEl = document.getElementById('checkoutFields');

    if (!cont || !totalEl) return;

    cont.innerHTML = '';
    
    // Checkout fields visibility
    if (fieldsEl) fieldsEl.style.display = this.items.length > 0 ? 'block' : 'none';

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
        self.alertModal.show("Checkout error: Runtime.saveEntry is not available.", "Error");
        return;
      }
      
      var nameEl = document.getElementById('checkoutName');
      var phoneEl = document.getElementById('checkoutPhone');
      var emailEl = document.getElementById('checkoutEmail');
      var messageEl = document.getElementById('checkoutMessage');
      var modalBody = document.querySelector('#cartModal .modal-body');

      // Clear previous validation classes
      [nameEl, phoneEl].forEach(el => {
          if (el) el.classList.remove('is-invalid');
      });

      var missingFields = [];
      if (nameEl && !nameEl.value.trim()) missingFields.push(nameEl);
      if (phoneEl && !phoneEl.value.trim()) missingFields.push(phoneEl);

      if (missingFields.length > 0) {
          // Add visual error cue
          missingFields.forEach(el => el.classList.add('is-invalid'));
          
          // Scroll the modal body to the top of the form fields for visibility
          if (modalBody && nameEl) {
              modalBody.scrollTop = nameEl.offsetTop - modalBody.offsetTop;
          }
          
          // Use console error instead of alert for better UX
          console.error("Validation failed: Please fill required fields.");
          return;
      }

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
            name: String(nameEl.value.trim() || ""),
            email: String(emailEl.value.trim() || ""),
            phone: String(phoneEl.value.trim() || ""),
            message: String(messageEl.value.trim() || "")
          };

          await Runtime.saveEntry(entry);
        }

        // Use Bootstrap modal for submission confirmation
        self.alertModal.show("Order submitted successfully! We will contact you soon.", "Success");
        self.items = [];
        self.save();
        
        // Fix: Explicitly dismiss the cart modal after success (Solves stuck gray overlay)
        var cartModalEl = document.getElementById('cartModal');
        if (cartModalEl && window.bootstrap && bootstrap.Modal) {
            var modalInstance = bootstrap.Modal.getInstance(cartModalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
        
        // Clear fields
        nameEl.value = '';
        emailEl.value = '';
        phoneEl.value = '';
        messageEl.value = '';


      } catch (e2) {
        console.error("Checkout failed:", e2);
        self.alertModal.show("Could not submit order. Please try again.", "Error");
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
