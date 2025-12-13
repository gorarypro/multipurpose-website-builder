/**
 * Products module
 * ---------------
 * Renders products into #productGrid, handles:
 * - filter dropdown (#productFilter)
 * - sort dropdown (#productSort)
 * - "No products found" state (#productsEmpty)
 *
 * IMPORTANT:
 * - Adds data-product-id on the card so QuickView can work reliably
 * - Buttons stopPropagation so clicking buttons doesn't open QuickView
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
    return arr && arr.slice ? arr.slice() : Array.prototype.slice.call(arr || []);
  }

  function extractShortDescription(html, maxLength) {
    if (!html) return "";
    var text = String(html).replace(/<[^>]+>/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  function currencySymbol() {
    return (settings && settings.currency_symbol) ? settings.currency_symbol : "$";
  }

  function stopBtn(evt) {
    // prevent QuickView click handler from firing
    if (!evt) return;
    evt.preventDefault();
    evt.stopPropagation();
  }

  function buildCard(product) {
    var col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    var card = document.createElement("div");
    card.className = "card h-100 shadow-sm product-card";

    // QuickView relies on this:
    card.setAttribute("data-product-id", String(product.id || ""));
    card.setAttribute("data-title", String(product.title || ""));
    card.setAttribute("data-price", String(product.price || ""));
    card.setAttribute("data-description", extractShortDescription(product.content, 260));

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

    if (product.price != null && product.price !== "") {
      var priceEl = document.createElement("div");
      priceEl.className = "fw-semibold mb-2";
      priceEl.textContent = currencySymbol() + " " + String(product.price);
      body.appendChild(priceEl);
    }

    var footer = document.createElement("div");
    footer.className = "mt-auto d-flex justify-content-between align-items-center gap-2";

    var btn = document.createElement("button");
    btn.className = "btn btn-sm btn-primary";
    btn.type = "button";
    btn.textContent = "Add to cart";
    btn.addEventListener("click", function (e) {
      stopBtn(e);
      if (typeof Cart !== "undefined" && Cart && typeof Cart.add === "function") {
        Cart.add(product, 1);
      } else {
        console.log("Cart module not available. Product:", product);
      }
    });
    footer.appendChild(btn);

    if (typeof Wishlist !== "undefined" && Wishlist && typeof Wishlist.toggle === "function") {
      var wishBtn = document.createElement("button");
      wishBtn.className = "btn btn-sm btn-outline-secondary";
      wishBtn.type = "button";
      wishBtn.textContent = "Wishlist";
      wishBtn.addEventListener("click", function (e) {
        stopBtn(e);
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
      gridEl.appendChild(buildCard(p));
    });
  }

  function getUniqueLabels(products) {
    var set = {};
    (products || []).forEach(function (p) {
      (p.labels || []).forEach(function (lab) {
        if (lab) set[lab] = true;
      });
    });
    return Object.keys(set).sort();
  }

  function populateFilter(products) {
    if (!filterEl) return;

    // Keep first option (All)
    var options = filterEl.querySelectorAll("option");
    for (var i = options.length - 1; i >= 1; i--) {
      options[i].remove();
    }

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
          return parseFloat(a.price || "0") - parseFloat(b.price || "0");
        });
      } else if (sortValue === "price-desc") {
        filtered.sort(function (a, b) {
          return parseFloat(b.price || "0") - parseFloat(a.price || "0");
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
    if (filterEl) filterEl.onchange = applyFilterAndSort;
    if (sortEl) sortEl.onchange = applyFilterAndSort;
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
