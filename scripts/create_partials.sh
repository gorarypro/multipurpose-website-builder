#!/usr/bin/env bash
# scripts/create_partials.sh
# Creates Blogger theme partials (head, navbar, hero, etc.)

set -euo pipefail

ROOT_DIR="${1:-multipurpose-website-builder}"
echo "🧩 [partials] Using root: $ROOT_DIR"

PARTIALS_DIR="$ROOT_DIR/src/apps-script/partials"
mkdir -p "$PARTIALS_DIR"

########################################
# head.html
########################################
cat > "$PARTIALS_DIR/head.html" << 'EOF'
<meta charset="utf-8">
<title><?= settings.site_title || 'My Website' ?></title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

<!-- Replace these two with your own hosted CSS URLs -->
<link href="https://YOUR_DOMAIN/assets/css/theme-base.css" rel="stylesheet">
<link href="https://YOUR_DOMAIN/assets/css/rtl.css" rel="stylesheet" expr:if='data:blog.languageDirection == "rtl"'>

<style>
  body.theme-body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .hide-comp { display: none !important; }
</style>
EOF

########################################
# footer-scripts.html
########################################
cat > "$PARTIALS_DIR/footer-scripts.html" << 'EOF'
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Replace these JS URLs with your own hosting / CDN where you deploy the files from src/assets/js -->
<script src="https://YOUR_DOMAIN/assets/js/runtime.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/products.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/variants.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/i18n.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/cart.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/wishlist.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/popup.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/currency.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/lazyload.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/analytics.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/seo.js"></script>
<script src="https://YOUR_DOMAIN/assets/js/gallery.js"></script>
EOF

########################################
# Components (navbar, hero, grid, cart, wishlist, popup, forms, testimonials, pricing, footer)
########################################

# navbar.html
cat > "$PARTIALS_DIR/navbar.html" << 'EOF'
<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#top" id="brandLogo">
      {{SITE_TITLE}}
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
      aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainNavbar">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0" id="navLinks">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#hero">{{TEXT_HOME}}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#products">{{TEXT_PRODUCTS}}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#contact">{{TEXT_CONTACT}}</a>
        </li>
      </ul>
      <div class="d-flex align-items-center gap-3">
        <div id="langSwitcher" class="d-none"></div>
        <button type="button"
                class="btn btn-sm btn-outline-secondary position-relative {{WISHLIST_INCLUDED}}"
                id="wishlistButton"
                data-bs-toggle="modal" data-bs-target="#wishlistModal">
          <i class="bi bi-heart"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                id="wishlistCount">0</span>
        </button>
        <button type="button"
                class="btn btn-sm btn-primary position-relative {{CART_INCLUDED}}"
                id="cartButton"
                data-bs-toggle="modal" data-bs-target="#cartModal">
          <i class="bi bi-cart3"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-dark"
                id="cartCount">0</span>
        </button>
      </div>
    </div>
  </div>
</nav>
EOF

# hero.html
cat > "$PARTIALS_DIR/hero.html" << 'EOF'
<section id="hero" class="py-5 py-md-6 bg-light">
  <div class="container">
    <div class="row align-items-center g-4">
      <div class="col-lg-6">
        <h1 class="display-5 fw-bold mb-3" id="heroTitle">
          {{HERO_TITLE}}
        </h1>
        <p class="lead mb-4" id="heroSubtitle">
          {{HERO_SUBTITLE}}
        </p>
        <div class="d-flex flex-wrap gap-2">
          <a href="#products" class="btn btn-primary btn-lg">
            {{TEXT_BROWSE_PRODUCTS}}
          </a>
          <a href="#contact" class="btn btn-outline-secondary btn-lg">
            {{TEXT_CONTACT_US}}
          </a>
        </div>
      </div>
      <div class="col-lg-6 text-center">
        <img src="{{HERO_IMAGE_URL}}" id="heroImage" alt="Hero" class="img-fluid rounded shadow-sm">
      </div>
    </div>
  </div>
</section>
EOF

# product-grid.html
cat > "$PARTIALS_DIR/product-grid.html" << 'EOF'
<section id="products" class="py-5">
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3 mb-0">{{TEXT_PRODUCTS}}</h2>
      <div class="d-flex gap-2">
        <select id="productFilter" class="form-select form-select-sm" style="width:auto;">
          <option value="all">{{TEXT_ALL}}</option>
        </select>
        <select id="productSort" class="form-select form-select-sm" style="width:auto;">
          <option value="latest">{{TEXT_SORT_LATEST}}</option>
          <option value="price-asc">{{TEXT_SORT_PRICE_ASC}}</option>
          <option value="price-desc">{{TEXT_SORT_PRICE_DESC}}</option>
        </select>
      </div>
    </div>
    <div id="productGrid" class="row g-4">
      <!-- JS will inject product cards -->
    </div>
    <div id="productsEmpty" class="text-center text-muted mt-4 d-none">
      {{TEXT_NO_PRODUCTS}}
    </div>
  </div>
</section>
EOF

# cart.html
cat > "$PARTIALS_DIR/cart.html" << 'EOF'
<div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="cartModalLabel">{{TEXT_CART}}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{TEXT_CLOSE}}"></button>
      </div>
      <div class="modal-body">
        <div id="cartContent"></div>
        <div id="cartEmpty" class="text-center text-muted d-none">
          {{TEXT_CART_EMPTY}}
        </div>
      </div>
      <div class="modal-footer d-flex justify-content-between">
        <div>
          <span class="fw-semibold">{{TEXT_TOTAL}}: </span>
          <span id="cartTotal">0 {{CURRENCY_SYMBOL}}</span>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            {{TEXT_CONTINUE_SHOPPING}}
          </button>
          <button type="button" class="btn btn-primary" id="checkoutButton">
            {{TEXT_CHECKOUT}}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
EOF

# wishlist.html
cat > "$PARTIALS_DIR/wishlist.html" << 'EOF'
<div class="modal fade" id="wishlistModal" tabindex="-1" aria-labelledby="wishlistModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="wishlistModalLabel">{{TEXT_WISHLIST}}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{TEXT_CLOSE}}"></button>
      </div>
      <div class="modal-body">
        <div id="wishlistContent"></div>
        <div id="wishlistEmpty" class="text-center text-muted d-none">
          {{TEXT_WISHLIST_EMPTY}}
        </div>
      </div>
      <div class="modal-footer d-flex justify-content-between">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          {{TEXT_CLOSE}}
        </button>
      </div>
    </div>
  </div>
</div>
EOF

# popup.html
cat > "$PARTIALS_DIR/popup.html" << 'EOF'
<div class="modal fade" id="timedPopup" tabindex="-1" aria-labelledby="timedPopupLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header border-0">
        <h5 class="modal-title" id="timedPopupLabel">{{POPUP_TITLE}}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{TEXT_CLOSE}}"></button>
      </div>
      <div class="modal-body" id="timedPopupContent">
        {{{POPUP_HTML}}}
      </div>
    </div>
  </div>
</div>
EOF

# forms.html
cat > "$PARTIALS_DIR/forms.html" << 'EOF'
<section id="contact" class="py-5 bg-light">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-5">
        <h2 class="h3 mb-3">{{TEXT_CONTACT_US}}</h2>
        <p class="text-muted">{{TEXT_CONTACT_INTRO}}</p>
        <ul class="list-unstyled small">
          <li><strong>{{TEXT_PHONE}}:</strong> {{CONTACT_PHONE}}</li>
          <li><strong>{{TEXT_EMAIL}}:</strong> {{CONTACT_EMAIL}}</li>
          <li><strong>{{TEXT_WHATSAPP}}:</strong> {{WHATSAPP_NUMBER}}</li>
        </ul>
      </div>
      <div class="col-lg-7">
        <form id="contactForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="contactName">{{TEXT_NAME}}</label>
            <input type="text" class="form-control" id="contactName" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="contactEmail">{{TEXT_EMAIL}}</label>
            <input type="email" class="form-control" id="contactEmail" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="contactMessage">{{TEXT_MESSAGE}}</label>
            <textarea class="form-control" id="contactMessage" rows="4" required></textarea>
          </div>
          <div class="d-none">
            <input type="text" id="contactHp" autocomplete="off">
          </div>
          <button type="submit" class="btn btn-primary" id="contactSubmit">
            {{TEXT_SEND_MESSAGE}}
          </button>
          <div id="contactStatus" class="mt-2 small text-muted"></div>
        </form>
      </div>
    </div>
  </div>
</section>
EOF

# testimonials.html
cat > "$PARTIALS_DIR/testimonials.html" << 'EOF'
<section id="testimonials" class="py-5 bg-white">
  <div class="container">
    <div class="text-center mb-4">
      <h2 class="h3">{{TEXT_TESTIMONIALS}}</h2>
      <p class="text-muted">{{TEXT_TESTIMONIALS_SUBTITLE}}</p>
    </div>
    <div class="row g-4" id="testimonialsGrid">
      <div class="col-md-4">
        <div class="border rounded p-3 h-100">
          <p class="mb-3 fst-italic">
            "{{TEXT_TESTIMONIAL_SAMPLE}}"
          </p>
          <div class="fw-semibold">John Doe</div>
          <div class="text-muted small">{{TEXT_TESTIMONIAL_ROLE}}</div>
        </div>
      </div>
    </div>
  </div>
</section>
EOF

# pricing.html
cat > "$PARTIALS_DIR/pricing.html" << 'EOF'
<section id="pricing" class="py-5 bg-light">
  <div class="container">
    <div class="text-center mb-4">
      <h2 class="h3">{{TEXT_PRICING}}</h2>
      <p class="text-muted">{{TEXT_PRICING_SUBTITLE}}</p>
    </div>
    <div class="row g-4" id="pricingGrid">
      <div class="col-md-4">
        <div class="card h-100 border">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{TEXT_PLAN_BASIC}}</h5>
            <h6 class="card-subtitle mb-2 text-muted">{{TEXT_PLAN_BASIC_SUBTITLE}}</h6>
            <p class="display-6 fw-bold my-3">
              29 {{CURRENCY_SYMBOL}}<small class="fs-6 text-muted">/{{TEXT_MONTH}}</small>
            </p>
            <ul class="list-unstyled small mb-4 flex-grow-1">
              <li>{{TEXT_FEATURE_1}}</li>
              <li>{{TEXT_FEATURE_2}}</li>
            </ul>
            <a href="#contact" class="btn btn-outline-primary mt-auto">
              {{TEXT_CHOOSE_PLAN}}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
EOF

# footer.html
cat > "$PARTIALS_DIR/footer.html" << 'EOF'
<footer class="py-4 border-top bg-white">
  <div class="container">
    <div class="row g-3 align-items-center">
      <div class="col-md-6">
        <div class="small text-muted">
          © <span id="footerYear"></span> {{SITE_TITLE}} – {{TEXT_ALL_RIGHTS_RESERVED}}
        </div>
      </div>
      <div class="col-md-6 text-md-end">
        <a href="#hero" class="small text-decoration-none me-3">{{TEXT_BACK_TO_TOP}}</a>
        <a href="{{PRIVACY_URL}}" class="small text-decoration-none me-2">{{TEXT_PRIVACY}}</a>
        <a href="{{TERMS_URL}}" class="small text-decoration-none">{{TEXT_TERMS}}</a>
      </div>
    </div>
  </div>
</footer>
<script>
  (function() {
    var y = new Date().getFullYear();
    var el = document.getElementById('footerYear');
    if (el) el.textContent = y;
  })();
</script>
EOF

echo "✅ [partials] Done."
