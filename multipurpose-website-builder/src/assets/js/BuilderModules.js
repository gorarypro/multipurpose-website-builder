// BuilderModules.js
// Core modules for Fusion Hub Builder
// Each module exports a template function that can be inserted in the live preview

// ===== Module: Cart =====
function CartModule(options={}) {
  const enabled = options.enabled ?? true;
  return enabled ? `<div class="cart-module">Shopping Cart Loaded ✅</div>` : '';
}

// ===== Module: QuickView =====
function QuickViewModule(options={}) {
  const enabled = options.enabled ?? true;
  return enabled ? `<div class="quickview-module">QuickView Loaded ✅</div>` : '';
}

// ===== Module: Wishlist =====
function WishlistModule(options={}) {
  const enabled = options.enabled ?? true;
  return enabled ? `<div class="wishlist-module">Wishlist Loaded ✅</div>` : '';
}

// ===== Module: Popup =====
function PopupModule(options={}) {
  const enabled = options.enabled ?? true;
  const content = options.content ?? '<div>Popup Content</div>';
  const delay = options.delay ?? 5;
  if(!enabled) return '';
  return `
    <div class="popup-module" style="display:none;" id="popupModule">
      ${content}
    </div>
    <script>
      setTimeout(()=>{ document.getElementById('popupModule').style.display='block'; }, ${delay*1000});
    </script>
  `;
}

// ===== Module: Gallery =====
function GalleryModule(options={}) {
  const enabled = options.enabled ?? true;
  const images = options.images ?? [];
  if(!enabled) return '';
  const items = images.map(src=>`<img src="${src}" class="gallery-item" style="max-width:100px;margin:5px;">`).join('');
  return `<div class="gallery-module">${items}</div>`;
}

// ===== Module: Currency =====
function CurrencyModule(options={}) {
  const symbol = options.symbol ?? '$';
  return `<span class="currency-symbol">${symbol}</span>`;
}

// ===== Module: Search =====
function SearchModule(options={}) {
  const enabled = options.enabled ?? true;
  return enabled ? `<input type="search" placeholder="Search..." class="search-module">` : '';
}

// ===== Module: Analytics =====
function AnalyticsModule(options={}) {
  const id = options.id ?? '';
  if(!id) return '';
  return `<script>console.log("Analytics ID: ${id}")</script>`;
}

// ===== Module: Floating Buttons =====
function FloatingButtonsModule(options={}) {
  const enabled = options.enabled ?? true;
  if(!enabled) return '';
  return `
    <div class="floating-buttons">
      <button onclick="alert('Chat')">💬</button>
      <button onclick="alert('Help')">❓</button>
    </div>
  `;
}

// ===== Module Loader for Step 0 Test =====
function runModulesTest(options={}) {
  return `
    ${CartModule({enabled: options.cart})}
    ${QuickViewModule({enabled: options.quickview})}
    ${WishlistModule({enabled: options.wishlist})}
    ${PopupModule({enabled: options.popup, content: options.popupContent, delay: options.popupDelay})}
    ${GalleryModule({enabled: options.gallery, images: options.galleryImages})}
    ${CurrencyModule({symbol: options.currencySymbol})}
    ${SearchModule({enabled: options.search})}
    ${AnalyticsModule({id: options.analyticsId})}
    ${FloatingButtonsModule({enabled: options.floatingButtons})}
  `;
}

// ===== Export for GitHub or GAS integration =====
if(typeof module !== 'undefined') module.exports = {
  CartModule,
  QuickViewModule,
  WishlistModule,
  PopupModule,
  GalleryModule,
  CurrencyModule,
  SearchModule,
  AnalyticsModule,
  FloatingButtonsModule,
  runModulesTest
};
