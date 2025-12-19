/**
 * FUSION v5.0 - search.js
 * Client-side search module that filters the rendered product grid.
 */

const SearchModule = {
    init: () => {
        const input = document.getElementById('shop-search');
        if (!input) return;

        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            // Filter the master product list
            const filtered = ProductsModule.allProducts.filter(product => {
                return product.title.toLowerCase().includes(term);
            });

            // Re-render the grid with the filtered list
            ProductsModule.render(filtered);
        });
        
        console.log("SearchModule: Input listener attached.");
    }
};
