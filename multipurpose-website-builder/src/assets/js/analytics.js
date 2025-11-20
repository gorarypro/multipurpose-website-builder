/**
 * Basic GA4 / GTM injection
 */
window.Analytics = {
  init(settings) {
    const gaId = settings.ga_id || '';
    if (!gaId) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  }
};
