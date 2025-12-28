/*************************************************
 * PRODUCTS ENGINE (Blogger Feed → Products)
 *************************************************/

window.FusionProducts = (function () {

  function extractPrice(labels) {
    const p = labels.find(l => l.startsWith('price:'));
    return p ? parseFloat(p.split(':')[1]) : 0;
  }

  function extractVariants(labels) {
    const map = {};
    labels.forEach(l => {
      if (!l.startsWith('variant:')) return;
      const parts = l.split(':'); // variant:type:value
      if (parts.length < 3) return;
      const type = parts[1];
      const value = parts.slice(2).join(':');
      if (!map[type]) map[type] = [];
      map[type].push(value);
    });
    return map;
  }

  function normalizePost(post) {
    const labels = post.labels || [];
    return {
      id: post.id,
      title: post.title,
      description: post.content || '',
      image: post.images?.[0]?.url || '',
      price: extractPrice(labels),
      variants: extractVariants(labels),
      url: post.url
    };
  }

  async function fetchFeed(feedUrl) {
    const res = await fetch(feedUrl + '?alt=json');
    const json = await res.json();
    return json.feed.entry.map(e => normalizePost({
      id: e.id.$t,
      title: e.title.$t,
      content: e.content?.$t || '',
      labels: e.category?.map(c => c.term) || [],
      images: e.media$thumbnail ? [{ url: e.media$thumbnail.url }] : [],
      url: e.link.find(l => l.rel === 'alternate').href
    }));
  }

  return {
    fetchFeed
  };

})();
