/**
 * Products module
 * ---------------
 * Renders products into #productGrid, handles:
 * - filter dropdown (#productFilter)
 * - sort dropdown (#productSort)
 * - "No products found" state (#productsEmpty)
 */

window.Products = (function () {
  var allProducts = [];
  var currentProducts = [];
  var settings = {};

  var gridEl = null;
  var emptyEl = null;
  var filterEl = null;
  var sortEl = null;

  function initElements() {
    gridEl = document.getElementById("productGrid");
    emptyEl = document.getElementById("productsEmpty");
    filterEl = document.getElementById("productFilter");
    sortEl = document.getElementById("productSort");
  }

  function cloneArray(arr) {
    return arr.slice ? arr.slice() : Array.prototype.slice.call(arr);
  }

  function extractShortDescription(html, maxLength) {
    if (!html) return "";
    var text = html.replace(/<[^>]+>/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  function buildCard(product) {
    var col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    var card = document.createElement("div");
    card.className = "card h-100 shadow-sm";

    if (product.image) {
      var img = document.createElement("img");
      img.className = "card-img-top";
      img.src = product.image;
      img.alt = product.title || "";
      card.appendChild(img);
    }

    var body = document.createElement("div");
    body.className = "card-body d-flex flex-column";

    var titleEl = document.createElement("h5");
    titleEl.className = "card-title";
    titleEl.textContent = product.title || "";
    body.appendChild(titleEl);

    var descEl = document.createElement("p");
    descEl.className = "card-text text-muted small";
    descEl.textContent = extractShortDescription(product.content, 110);
    body.appendChild(descEl);

    if (product.price) {
      var priceEl = document.createElement("div");
      priceEl.className = "fw-semibold mb-2";

      var currencySymbol = (settings && settings.currency_symbol) ? settings.currency_symbol : "$";
      priceEl.textContent = currencySymbol + " " + String(product.price);
      body.appendChild(priceEl);
    }

    var footer = document.createElement("div");
    footer.className = "mt-auto d-flex justify-content-between align-items-center";

    var btn = document.createElement("button");
    btn.className = "btn btn-sm btn-primary";
    btn.textContent = "Add to cart";
    btn.addEventListener("click", function () {
      if (typeof Cart !== "undefined") {
        Cart.add(product, 1);
      } else {
        console.log("Cart module not available. Product:", product);
      }
    });
    footer.appendChild(btn);

    if (typeof Wishlist !== "undefined") {
      var wishBtn = document.createElement("button");
      wishBtn.className = "btn btn-sm btn-outline-secondary";
      wishBtn.textContent = "Wishlist";
      wishBtn.addEventListener("click", function () {
        Wishlist.toggle(product);
      });
      footer.appendChild(wishBtn);
    }

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);

    return col;
  }

  function renderGridInternal(list) {
    if (!gridEl || !emptyEl) return;

    gridEl.innerHTML = "";

    if (!list || list.length === 0) {
      emptyEl.classList.remove("d-none");
      return;
    }

    emptyEl.classList.add("d-none");

    list.forEach(function (p) {
      var card = buildCard(p);
      gridEl.appendChild(card);
    });
  }

  function getUniqueLabels(products) {
    var set = {};
    products.forEach(function (p) {
      (p.labels || []).forEach(function (lab) {
        if (lab) set[lab] = true;
      });
    });
    return Object.keys(set).sort();
  }

  function populateFilter(products) {
    if (!filterEl) return;

    var options = filterEl.querySelectorAll("option");
    options.forEach(function (opt, idx) {
      if (idx > 0) opt.remove();
    });

    var labels = getUniqueLabels(products);
    labels.forEach(function (lab) {
      var opt = document.createElement("option");
      opt.value = lab;
      opt.textContent = lab;
      filterEl.appendChild(opt);
    });
  }

  function applyFilterAndSort() {
    var filtered = cloneArray(allProducts);

    if (filterEl && filterEl.value && filterEl.value !== "all") {
      var filterValue = filterEl.value;
      filtered = filtered.filter(function (p) {
        return (p.labels || []).indexOf(filterValue) !== -1;
      });
    }

    if (sortEl && sortEl.value) {
      var sortValue = sortEl.value;

      if (sortValue === "price-asc") {
        filtered.sort(function (a, b) {
          var pa = parseFloat(a.price || "0");
          var pb = parseFloat(b.price || "0");
          return pa - pb;
        });
      } else if (sortValue === "price-desc") {
        filtered.sort(function (a, b) {
          var pa = parseFloat(a.price || "0");
          var pb = parseFloat(b.price || "0");
          return pb - pa;
        });
      } else if (sortValue === "latest") {
        filtered.sort(function (a, b) {
          var ia = a.id || "";
          var ib = b.id || "";
          if (ia < ib) return 1;
          if (ia > ib) return -1;
          return 0;
        });
      }
    }

    currentProducts = filtered;
    renderGridInternal(filtered);
  }

  function attachEvents() {
    if (filterEl) {
      filterEl.addEventListener("change", function () {
        applyFilterAndSort();
      });
    }
    if (sortEl) {
      sortEl.addEventListener("change", function () {
        applyFilterAndSort();
      });
    }
  }

  return {
    renderGrid: function (products, runtimeSettings) {
      initElements();
      settings = runtimeSettings || {};
      allProducts = products || [];
      currentProducts = cloneArray(allProducts);

      populateFilter(allProducts);
      attachEvents();
      applyFilterAndSort();

      console.log("Products grid rendered:", allProducts.length, "items");
    }
  };
})();
