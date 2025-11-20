/**
 * Basic SEO helper
 */
window.SEO = {
  applyBasic(settings) {
    if (!settings) return;
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  }
};
