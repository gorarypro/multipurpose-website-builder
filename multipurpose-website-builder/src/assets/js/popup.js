/**
 * Timed popup logic
 */
window.Popup = {
  init(settings) {
    const enabled = (settings.popup_included || 'no') === 'yes';
    if (!enabled) return;
    const delay = parseInt(settings.popup_delay_seconds || '60', 10) * 1000;
    setTimeout(() => {
      const el = document.getElementById('timedPopup');
      if (!el) return;
      const modal = new bootstrap.Modal(el);
      modal.show();
    }, delay);
  }
};
