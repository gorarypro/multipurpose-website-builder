// Website category hierarchy
const CATEGORY_HIERARCHY = {
  "business-corporate": {
    name: "Business & Corporate",
    subcategories: {
      "company": "Company/Corporate Websites",
      "portfolio": "Business Portfolios",
      "startup": "Startup Websites",
      "franchise": "Franchise Websites"
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CATEGORY_HIERARCHY;
}
