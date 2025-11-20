/**
 * Variants from labels (e.g., "Size:M", "Color:Red")
 */
window.Variants = {
  fromLabels(labels) {
    const map = {};
    (labels || []).forEach(label => {
      const idx = label.indexOf(':');
      if (idx <= 0) return;
      const group = label.slice(0, idx).trim();
      const option = label.slice(idx + 1).trim();
      if (!map[group]) map[group] = [];
      if (!map[group].includes(option)) map[group].push(option);
    });
    return map;
  }
};
