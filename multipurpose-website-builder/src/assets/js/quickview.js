/**
 * QuickView module
 * ----------------
 * Opens #quickViewModal when clicking on a product card.
 * Requires products.js to set: data-product-id on the .card
 */

window.QuickView = (function () {
  var currentProduct = null;

  function $(id) { return document.getElementById(id); }

  function findProductById(pid) {
    var list = (window.Runtime && Array.isArray(Runtime.products)) ? Runtime.products : [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(pid)) return list[i];
    }
    return null;
  }

  function stripHtml(html) {
    if (!html) return "";
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function currencySymbol() {
    try {
      return (window.Runtime && Runtime.settings && Runtime.settings.currency_symbol) ? Runtime.settings.currency_symbol : "$";
    } catch (e) {
      return "$";
    }
  }

  function formatPrice(p) {
    var n = parseFloat(p || 0);
    if (isNaN(n)) n = 0;
    return currencySymbol() + " " + n.toFixed(2);
  }

  function open(product, card) {
    var modalEl = $("quickViewModal");
    if (!modalEl || !(window.bootstrap && bootstrap.Modal)) return;

    currentProduct = product;

    var title = (product && product.title) ? product.title : "Product";
    var price = (product && product.price != null) ? formatPrice(product.price) : "";
    var desc = (product && product.content) ? stripHtml(product.content) : "";

    var label = $("quickViewLabel");
    if (label) label.textContent = title;

    var priceEl = $("quickViewPrice");
    if (priceEl) priceEl.textContent = price;

    var descEl = $("quickViewDescription");
    if (descEl) descEl.textContent = desc;

    var imgEl = $("quickViewImage");
    if (imgEl) {
      var img = (product && product.image) ? product.image : "";
      if (!img && card) {
        var cardImg = card.querySelector("img");
        img = cardImg ? (cardImg.getAttribute("src") || "") : "";
      }
      if (img) {
        imgEl.setAttribute("src", img);
        imgEl.style.display = "";
      } else {
        imgEl.removeAttribute("src");
        imgEl.style.display = "none";
      }
    }

    modalEl.setAttribute("data-product-id", String(product && product.id ? product.id : ""));

    var bs = bootstrap.Modal.getOrCreateInstance(modalEl, {
      backdrop: true,
      keyboard: true,
      focus: true
    });

    bs.show();
  }

  function init() {
    var grid = $("productGrid");
    if (!grid) return;

    grid.addEventListener("click", function (e) {
      // Ignore clicks on buttons/links inside the card
      var btn = e.target && e.target.closest ? e.target.closest("button, a") : null;
      if (btn) return;

      var card = e.target && e.target.closest ? e.target.closest(".card[data-product-id]") : null;
      if (!card) return;

      var pid = card.getAttribute("data-product-id") || "";
      if (!pid) return;

      var product = findProductById(pid);
      if (!product) return;

      e.preventDefault();
      open(product, card);
    });

    // QuickView "Add to cart"
    var addBtn = $("quickViewAddToCart");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (!currentProduct) return;
        if (window.Cart && typeof Cart.add === "function") {
          Cart.add(currentProduct, 1);
        }
        
        // close modal with robust cleanup
        var modalEl = $("quickViewModal");
        if (modalEl && window.bootstrap && bootstrap.Modal) {
          try { 
            // 1. Attempt to hide the instance normally
            bootstrap.Modal.getOrCreateInstance(modalEl).hide(); 
          } catch (e) {
            // 2. If hiding fails, manually remove the modal artifacts
            console.warn("QuickView hide failed. Manual cleanup initiated.", e);
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
            
            // Manual backdrop cleanup (CRITICAL FIX)
            document.body.classList.remove('modal-open');
            document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
              backdrop.remove();
            });
          }
        }
      });
    }
  }

  // init now + after runtime is ready (products grid is rendered then)
  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("runtime_ready", function () {
    // no rebind needed, click handler is delegated on #productGrid
  });

  return { init: init };
})();
