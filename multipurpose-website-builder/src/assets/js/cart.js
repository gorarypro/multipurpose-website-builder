/**
 * Cart logic with localStorage
 */
window.Cart = {
  key: 'mpwb_cart',
  items: [],
  init() {
    try {
      const raw = localStorage.getItem(this.key);
      this.items = raw ? JSON.parse(raw) : [];
    } catch(e) {
      this.items = [];
    }
    this.updateBadge();
    this.bindCheckout();
  },
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
    this.renderModal();
  },
  add(product, qty) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ id: product.id, title: product.title, price: product.price, qty: qty });
    }
    this.save();
  },
  total() {
    return this.items.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.qty), 0);
  },
  updateBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const qty = this.items.reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = qty;
  },
  renderModal() {
    const cont = document.getElementById('cartContent');
    const empty = document.getElementById('cartEmpty');
    const totalEl = document.getElementById('cartTotal');
    if (!cont || !totalEl) return;
    cont.innerHTML = '';
    if (!this.items.length) {
      if (empty) empty.classList.remove('d-none');
      totalEl.textContent = '0';
      return;
    }
    if (empty) empty.classList.add('d-none');
    const table = document.createElement('table');
    table.className = 'table table-sm align-middle';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-end">Qty</th>
          <th class="text-end">Price</th>
          <th class="text-end">Total</th>
          <th></th>
        </tr>
      </thead>`;
    const tbody = document.createElement('tbody');
    this.items.forEach((i, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i.title}</td>
        <td class="text-end">${i.qty}</td>
        <td class="text-end">${i.price}</td>
        <td class="text-end">${(parseFloat(i.price || 0) * i.qty).toFixed(2)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-idx="${idx}">&times;</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    cont.appendChild(table);

    cont.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-idx'), 10);
        this.items.splice(index, 1);
        this.save();
      });
    });

    totalEl.textContent = this.total().toFixed(2);
  },
  bindCheckout() {
    const btn = document.getElementById('checkoutButton');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (!this.items.length) return;
      const name = prompt('Your name?');
      const email = prompt('Your email?');
      const entry = {
        type: 'order',
        items: this.items,
        total: this.total(),
        name,
        email
      };
      try {
        await Runtime.saveEntry(entry);
        alert('Order submitted!');
        this.items = [];
        this.save();
      } catch(e) {
        alert('Could not submit order.');
      }
    });
  }
};
