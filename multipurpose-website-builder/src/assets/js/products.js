/**
 * FUSION ENGINE v13.1.0 - products.js
 * Blogger Feed → Robust Product/Content Objects
 * -----------------------------------------------------
 * Responsibilities:
 * - Fetching JSON feed with cache-busting
 * - Normalizing labels (price:100, variant:size:XL)
 * - Upgrading image resolution
 * - Global Catalog management
 */

window.FusionProducts = (function () {

  /**
   * Extract numeric attributes using Regex
   * Handles: "price:99", "Price: 99", "price-99"
   */
  function extractAttribute(labels, key, defaultValue = 0) {
    const regex = new RegExp(`${key}[:\\- ]\\s*(\\d+(\\.\\d+)?)`, 'i');
    for (const label of labels) {
      const match = label.match(regex);
      if (match) return parseFloat(match[1]);
    }
    return defaultValue;
  }

  /**
   * Extract complex variants
   * Format: "variant:Type:Value" (e.g., variant:Color:Red)
   */
  function extractVariants(labels) {
    const map = {};
    // Regex for variant:category:value
    const regex = /^variant[:\- ]\s*([^:]+)\s*[:\- ]\s*(.+)$/i;

    labels.forEach(l => {
      const match = l.match(regex);
      if (!match) return;
      
      const type = match[1].trim().toLowerCase();
      const value = match[2].trim();
      
      if (!map[type]) map[type] = [];
      if (!map[type].includes(value)) map[type].push(value);
    });
    return map;
  }

  /**
   * Convert Blogger post into a standardized Fusion object
   */
  function normalizePost(post) {
    const labels = post.labels || [];
    
    // Convert low-res thumbnail (/s72-c/) to high-res (/s1600/)
    const rawImage = post.images?.[0]?.url || '';
    const highResImage = rawImage.replace(/\/s\d+(-c)?\//, '/s1600/');

    return {
      id: post.id.split('post-')[1] || post.id, // Extract numeric ID
      title: post.title,
      description: post.content || '',
      image: highResImage,
      price: extractAttribute(labels, 'price', 0),
      discount: extractAttribute(labels, 'discount', null),
      variants: extractVariants(labels),
      url: post.url,
      labels: labels
    };
  }

  /**
   * Main Fetcher
   * Includes cache-busting to prevent stale data
   */
  async function fetchFeed(feedUrl) {
    try {
      const cacheBust = `&cb=${new Date().getTime()}`;
      const url = feedUrl.includes('?') ? `${feedUrl}${cacheBust}` : `${feedUrl}?alt=json${cacheBust}`;
      
      const res = await fetch(url);
      const json = await res.json();
      const entries = json.feed.entry || [];
      
      const products = entries.map(e => normalizePost({
        id: e.id.$t,
        title: e.title.$t,
        content: e.content ? e.content.$t : (e.summary ? e.summary.$t : ''),
        labels: e.category ? e.category.map(c => c.term) : [],
        images: e.media$thumbnail ? [{ url: e.media$thumbnail.url }] : [],
        url: e.link.find(l => l.rel === 'alternate').href
      }));

      // Store in Global Catalog for modules (QuickView, Cart)
      window.FusionCatalog = products;
      
      // Notify System
      window.dispatchEvent(new CustomEvent('fusion:products_ready', { detail: products }));
      
      return products;
    } catch (err) {
      console.error("FusionProducts: Error fetching or parsing feed.", err);
      return [];
    }
  }

  return {
    fetchFeed
  };

})();
