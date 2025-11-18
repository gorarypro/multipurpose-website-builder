// CONFIGURATION
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA'; // <-- YOUR SHEET ID
const SETTINGS_SHEET = 'Settings';
// CHANGE THIS TO YOUR BLOG URL
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&max-results=50';

/**
 * SERVE HTML
 */
function doGet(e) {
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutputFromFile('Builder')
      .setTitle('Website Builder Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  const callback = e.parameter.callback;
  if (!callback) return ContentService.createTextOutput("Error: Callback missing");

  let result = {};
  const action = e.parameter.action;

  try {
    if (action === 'getConfig') {
      result = getSavedConfig();
    } 
    else if (action === 'getWebsiteTypes') {
      result = getWebsiteTypes(); 
    }
    else if (action === 'getData') {
      result = getBloggerData();
    }
  } catch (err) {
    result = { error: err.message };
  }

  // JSONP Response
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**
 * MASTER LIST OF CATEGORIES
 */
function getWebsiteTypes() {
  return {
    "website_types": [
      { "name": "Home Improvement", "subcategories": ["DIY Projects", "Renovation Tips", "Interior Design", "Gardening"], "color": "#e67e22" },
      { "name": "Real Estate", "subcategories": ["Property Management", "Landlord Resources", "Market Analysis", "Rentals"], "color": "#2c3e50" },
      { "name": "Insurance", "subcategories": ["Policy Comparisons", "Claims Advice", "Types", "Risk Management"], "color": "#2980b9" },
      { "name": "Self-Improvement", "subcategories": ["Productivity", "Motivation", "Goals", "Personal Dev"], "color": "#16a085" },
      { "name": "Technology", "subcategories": ["Gadgets", "Software", "AI", "Coding"], "color": "#3498db" },
      { "name": "Food", "subcategories": ["Recipes", "Reviews", "Diet", "Baking"], "color": "#e74c3c" }
    ]
  };
}

/**
 * DATABASE FUNCTIONS
 */
function saveConfigToSheet(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) { sheet = ss.insertSheet(SETTINGS_SHEET); sheet.appendRow(['Key', 'Value']); }
  
  sheet.getRange('A2:B10').clearContent();
  sheet.appendRow(['type', config.type]);
  sheet.appendRow(['title', config.title]);
  sheet.appendRow(['color', config.color]);
}

function getSavedConfig() {
  // DEFAULT CONFIG (Used if Sheet is empty)
  const defaultConfig = { 
    type: "Home Improvement", 
    title: "My New Website", 
    color: "#333333" 
  };

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SETTINGS_SHEET);
    if (!sheet) return defaultConfig;
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return defaultConfig; // No data rows

    const config = {};
    for (let i = 1; i < data.length; i++) config[data[i][0]] = data[i][1];
    
    // Merge with defaults to prevent undefined
    return { ...defaultConfig, ...config };
  } catch (e) {
    return defaultConfig;
  }
}

function getBloggerData() {
  try {
    const response = UrlFetchApp.fetch(BLOG_FEED_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return [];
    
    const json = JSON.parse(response.getContentText());
    return (json.feed.entry || []).map(p => {
      let img = 'https://placehold.co/600x400/eee/999?text=No+Image';
      if (p.content && p.content.$t) {
         const match = p.content.$t.match(/<img[^>]+src="([^"]+)"/);
         if (match) img = match[1];
      }
      // Check labels
      let labels = [];
      if (p.category) labels = p.category.map(c => c.term);

      return {
        id: p.id.$t.split('.post-')[1],
        title: p.title.$t,
        excerpt: p.content ? p.content.$t.replace(/<[^>]+>/g, ' ').substring(0, 100) + '...' : '',
        image: img,
        labels: labels,
        date: new Date(p.published.$t).toLocaleDateString()
      };
    });
  } catch (e) { return []; }
}
