// =====================
// BuilderModules.js
// =====================

// QuickView Module
const QuickView = {
    open: function(productId){
        console.log(`QuickView: Opening product ${productId}`);
        alert(`QuickView: Product ${productId} previewed`);
    }
};

// Variants Module
const Variants = {
    selectOption: function(productId, option){
        console.log(`Variants: Product ${productId} option selected ${option}`);
        alert(`Variants: Product ${productId} option "${option}" selected`);
    }
};

// Products Module
const Products = {
    fetchAll: function(){
        console.log("Products: Fetching all products...");
        alert("Products: All products fetched (mock)");
    }
};

// Cart Module
const Cart = {
    addItem: function(productId, quantity){
        console.log(`Cart: Adding product ${productId}, quantity ${quantity}`);
        alert(`Cart: Product ${productId} added (${quantity})`);
    },
    removeItem: function(productId){
        console.log(`Cart: Removing product ${productId}`);
        alert(`Cart: Product ${productId} removed`);
    }
};

// Wishlist Module
const Wishlist = {
    add: function(productId){
        console.log(`Wishlist: Adding product ${productId}`);
        alert(`Wishlist: Product ${productId} added`);
    },
    remove: function(productId){
        console.log(`Wishlist: Removing product ${productId}`);
        alert(`Wishlist: Product ${productId} removed`);
    }
};

// Popup Module
const Popup = {
    show: function(html){
        console.log("Popup: Showing popup", html);
        alert("Popup: Displayed content (mock)");
    },
    hide: function(){
        console.log("Popup: Hide");
        alert("Popup hidden");
    }
};

// Gallery Module
const Gallery = {
    open: function(galleryId){
        console.log(`Gallery: Open gallery ${galleryId}`);
        alert(`Gallery: Opened gallery ${galleryId}`);
    }
};

// Currency Module
const Currency = {
    format: function(amount, symbol="$"){
        const formatted = `${symbol}${amount.toFixed(2)}`;
        console.log(`Currency: Formatting amount ${amount} => ${formatted}`);
        return formatted;
    }
};

// Modal Guard
const ModalGuard = {
    preventClose: function(modalId){
        console.log(`ModalGuard: Prevent closing ${modalId}`);
        alert(`ModalGuard: Closing prevented for ${modalId}`);
    }
};

// Export Modules for GitHub usage
if(typeof module !== 'undefined') {
    module.exports = {
        QuickView,
        Variants,
        Products,
        Cart,
        Wishlist,
        Popup,
        Gallery,
        Currency,
        ModalGuard
    };
}
