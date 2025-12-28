/*************************************************
 * PRODUCT CARD RENDERER
 *************************************************/

function renderProductCard(product, mount) {
  const card = document.createElement('div');
  card.className = 'product-card';

  card.innerHTML = `
    <img src="${product.image}" />
    <h3>${product.title}</h3>
    <div class="price">${product.price}</div>
    <div class="variants"></div>
    <button>Add to Cart</button>
  `;

  const variantBox = card.querySelector('.variants');
  const state = FusionVariants.createSelectors(
    product.variants,
    variantBox
  );

  card.querySelector('button').onclick = () => {
    FusionCart.add(product, state);
  };

  mount.appendChild(card);
}
