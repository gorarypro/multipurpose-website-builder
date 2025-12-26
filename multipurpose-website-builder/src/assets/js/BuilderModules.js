/* BuilderModules.js
   Full Module Stubs for Fusion Hub Builder Step 0 Testing
*/

// ==================== QuickView Module ====================
const QuickView = {
    init: () => console.log('[QuickView] Module initialized'),
    open: (productId) => console.log(`[QuickView] Open product ${productId}`),
    close: () => console.log('[QuickView] Close QuickView')
};

// ==================== Variants Module ====================
const Variants = {
    init: () => console.log('[Variants] Module initialized'),
    selectOption: (productId, option) => console.log(`[Variants] Product ${productId} option selected: ${option}`)
};

// ==================== Products Module ====================
const Products = {
    init: () => console.log('[Products] Module initialized'),
    fetchAll: () => console.log('[Products] Fetching all products'),
    fetchById: (id) => console.log(`[Products] Fetching product ${id}`)
};

// ==================== Cart Module ====================
const Cart = {
    init: () => console.log('[Cart] Module initialized'),
    addItem: (id, qty) => console.log(`[Cart] Add product ${id} qty ${qty}`),
    removeItem: (id) => console.log(`[Cart] Remove product ${id}`),
    checkout: () => console.log('[Cart] Checkout triggered')
};

// ==================== Wishlist Module ====================
const Wishlist = {
    init: () => console.log('[Wishlist] Module initialized'),
    add: (id) => console.log(`[Wishlist] Add product ${id}`),
    remove: (id) => console.log(`[Wishlist] Remove product ${id}`),
    list: () => console.log('[Wishlist] Listing items')
};

// ==================== Popup Module ====================
const Popup = {
    init: () => console.log('[Popup] Module initialized'),
    show: (content) => console.log(`[Popup] Showing content: ${content}`),
    hide: () => console.log('[Popup] Hide popup')
};

// ==================== Gallery Module ====================
const Gallery = {
    init: () => console.log('[Gallery] Module initialized'),
    open: (id) => console.log(`[Gallery] Open gallery ${id}`),
    close: () => console.log('[Gallery] Close gallery')
};

// ==================== Currency Module ====================
const Currency = {
    init: () => console.log('[Currency] Module initialized'),
    format: (value, symbol='$') => {
        console.log(`[Currency] Formatting ${value} with symbol ${symbol}`);
        return `${symbol}${parseFloat(value).toFixed(2)}`;
    }
};

// ==================== Modal-Guard Module ====================
const ModalGuard = {
    init: () => console.log('[ModalGuard] Module initialized'),
    preventClose: (modalId) => console.log(`[ModalGuard] Prevent close for modal ${modalId}`),
    allowClose: (modalId) => console.log(`[ModalGuard] Allow close for modal ${modalId}`)
};

// ==================== Step 0 Quick Test ====================
function runQuickTest() {
    console.log('--- Running Step 0 Quick Test ---');
    QuickView.init();
    Variants.init();
    Products.init();
    Cart.init();
    Wishlist.init();
    Popup.init();
    Gallery.init();
    Currency.init();
    ModalGuard.init();

    // Test basic functions
    QuickView.open(101); QuickView.close();
    Variants.selectOption(101, 'Red');
    Products.fetchAll(); Products.fetchById(101);
    Cart.addItem(101, 2); Cart.removeItem(101); Cart.checkout();
    Wishlist.add(101); Wishlist.remove(101); Wishlist.list();
    Popup.show('<p>Test Popup</p>'); Popup.hide();
    Gallery.open(5); Gallery.close();
    console.log(Currency.format(123.456, '$'));
    ModalGuard.preventClose('modal1'); ModalGuard.allowClose('modal1');
    console.log('--- Step 0 Quick Test Finished ---');
}

// Automatically run Quick Test when step 0 is active
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('step0')) runQuickTest();
});
