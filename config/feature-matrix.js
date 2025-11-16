// Feature matrix for different website types
const FEATURE_MATRIX = {
  core: {
    "responsive-design": true,
    "seo-optimization": true
  },
  "business-corporate": {
    "about-section": true,
    "services": true
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = FEATURE_MATRIX;
}
