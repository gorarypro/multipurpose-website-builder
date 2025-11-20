/**
 * Simple lightbox/gallery
 */
window.Gallery = {
  init() {
    document.querySelectorAll('[data-lightbox]').forEach(img => {
      img.addEventListener('click', () => this.open(img.src));
    });
  },
  open(src) {
    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.innerHTML = `<img src="${src}" class="lightbox-img" alt="">`;
    backdrop.addEventListener('click', () => backdrop.remove());
    document.body.appendChild(backdrop);
  }
};

document.addEventListener('DOMContentLoaded', () => Gallery.init());
