/*************************************************
 * VARIANTS ENGINE
 *************************************************/

window.FusionVariants = (function () {

  function createSelectors(variants, container) {
    container.innerHTML = '';
    const state = {};

    Object.keys(variants).forEach(type => {
      const wrap = document.createElement('div');
      wrap.className = 'variant-group';

      const label = document.createElement('label');
      label.textContent = type.toUpperCase();
      wrap.appendChild(label);

      const select = document.createElement('select');
      select.dataset.variant = type;

      variants[type].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        state[type] = select.value;
      });

      state[type] = variants[type][0];
      wrap.appendChild(select);
      container.appendChild(wrap);
    });

    return state;
  }

  function serialize(state) {
    return Object.keys(state)
      .map(k => `${k}:${state[k]}`)
      .join('|');
  }

  return {
    createSelectors,
    serialize
  };

})();
