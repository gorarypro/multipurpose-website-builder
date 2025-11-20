/**
 * Product rendering + filtering + sorting
 */
window.Products = {
  current: [],
  renderGrid(products, settings) {
    this.current = products || [];
    this.settings = settings || {};
    const grid = document.getElementById('productGrid');
    const empty = document.getElementById('productsEmpty');
    if (!grid) return;
    grid.innerHTML = '';
    if (!this.current.length) {
      if (empty) empty.classList.remove('d-none');
      return;
    }
    if (empty) empty.classList.add('d-none');

    this.current.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card h-100 product-card" data-id="${p.id}">
          <img src="${p.image || ''}" class="card-img-top" alt="${p.title || ''}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1">${p.title || ''}</h5>
            <p class="card-text small text-muted flex-grow-1"></p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="fw-bold product-price">${Currency.format(p.price, settings)}</span>
              <button class="btn btn-sm btn-primary add-to-cart-btn">+</button>
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
    });

    grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.product-card');
        const id = card.getAttribute('data-id');
        const product = this.current.find(p => p.id === id);
        if (product) {
          Cart.add(product, 1);
        }
      });
    });
  }
};
