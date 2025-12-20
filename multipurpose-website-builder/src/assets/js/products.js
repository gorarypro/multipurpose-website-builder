const ProductsModule = {
  catalog: [],
  init: function() {
    const domain = Fusion.settings.base_url || 'eventsushi.blogspot.com';
    const script = document.createElement('script');
    script.src = `https://${domain}/feeds/posts/default?alt=json-in-script&max-results=100&callback=ProductsModule.parse`;
    document.body.appendChild(script);
  },
  parse: function(json) {
    const entries = (json.feed && json.feed.entry) ? json.feed.entry : [];
    this.catalog = entries.map(e => ({
      id: e.id.$t,
      title: e.title.$t,
      price: e.category ? parseFloat(e.category.find(c => c.term.startsWith('price-'))?.term.split('-')[1] || 0) : 0,
      image: e.media$thumbnail ? e.media$thumbnail.url.replace('s72-c', 's600') : 'https://via.placeholder.com/600'
    }));
    this.render();
  },
  render: function() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = this.catalog.map(p => `
      <div class="col-md-3 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <img src="${p.image}" class="card-img-top">
          <div class="card-body">
            <h6>${p.title}</h6>
            <div class="fw-bold text-primary mb-3">${p.price} DH</div>
            <button class="btn btn-primary w-100 btn-sm" onclick="CartModule.add('${p.id}', '${p.title}', ${p.price})">AJOUTER</button>
          </div>
        </div>
      </div>
    `).join('');
  }
};
