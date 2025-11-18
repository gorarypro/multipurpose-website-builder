const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA'; // Ensure this ID is correct
const SETTINGS_SHEET = 'Settings';
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&max-results=50';

/**
 * Serves the Builder UI (Builder.html)
 */
function doGet(e) {
  // If no parameters, serve the HTML Builder
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutputFromFile('Builder')
      .setTitle('Website Builder Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  // API Handler (JSONP)
  const action = e.parameter.action;
  const callback = e.parameter.callback;

  if (!callback) {
    return ContentService.createTextOutput("Error: Callback missing").setMimeType(ContentService.MimeType.TEXT);
  }

  let result = {};

  if (action === 'getConfig') {
    // Get saved config, or return default if empty
    result = getSavedConfig();
  } 
  else if (action === 'getData') {
    // Fetch data based on type
    const type = e.parameter.type || 'Home Improvement';
    result = getBloggerData(type);
  }

  // Return JSONP
  const jsonString = JSON.stringify(result);
  return ContentService.createTextOutput(callback + '(' + jsonString + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**
 * Saves configuration from Builder to Sheet
 */
function saveConfigToSheet(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SETTINGS_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET);
    sheet.appendRow(['Key', 'Value']); // Header
  }
  
  // Clear old settings
  sheet.getRange('A2:B10').clearContent();
  
  // Save new settings
  sheet.appendRow(['type', config.type]);
  sheet.appendRow(['title', config.title]);
  sheet.appendRow(['color', config.color]);
  
  return "Saved";
}

/**
 * Reads configuration from Sheet
 */
function getSavedConfig() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SETTINGS_SHEET);
    
    // DEFAULT FALLBACK (Prevents "stuck loading" if sheet is empty)
    const defaultConfig = {
      type: "Home Improvement",
      title: "My New Website",
      color: "#e67e22"
    };

    if (!sheet) return defaultConfig;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return defaultConfig; // Only header exists

    const config = {};
    for (let i = 1; i < data.length; i++) {
      config[data[i][0]] = data[i][1];
    }
    
    return config;
  } catch (e) {
    // If sheet ID is wrong or permissions fail, return default to keep site alive
    return {
      type: "Home Improvement",
      title: "Default Site (Error Loading Config)",
      color: "#333"
    };
  }
}

/**
 * Fetches posts from Blogger
 */
function getBloggerData(type) {
  try {
    const response = UrlFetchApp.fetch(BLOG_FEED_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return [];
    
    const json = JSON.parse(response.getContentText());
    const posts = json.feed.entry || [];
    
    return posts.map(p => {
      let img = 'https://placehold.co/600x400/eee/999?text=No+Image';
      if (p.content && p.content.$t) {
         const match = p.content.$t.match(/<img[^>]+src="([^"]+)"/);
         if (match) img = match[1];
      }
      
      return {
        id: p.id.$t.split('.post-')[1],
        title: p.title.$t,
        excerpt: p.content ? p.content.$t.replace(/<[^>]+>/g, ' ').substring(0, 100) + '...' : '',
        image: img,
        date: new Date(p.published.$t).toLocaleDateString()
      };
    });
  } catch (e) {
    return [];
  }
}
