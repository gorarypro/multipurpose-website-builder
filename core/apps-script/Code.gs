/**
 * =================================================================
 * CONFIGURATION
 * =================================================================
 */
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA';
const SHEET_NAME = 'Data';
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&max-results=50';
const NOTIFICATION_EMAIL = 'gorarypro@gmail.com';
const CACHE_EXPIRATION = 7200;

/**
 * =================================================================
 * HELPER FUNCTION - Creates JSONP response
 * =================================================================
 */
function createJsonpResponse(data, callback) {
  const jsonpData = `${callback}(${JSON.stringify(data)})`;
  const output = ContentService.createTextOutput(jsonpData);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return output;
}

/**
 * =================================================================
 * MAIN GET REQUEST HANDLER
 * =================================================================
 */
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  const websiteType = e.parameter.websiteType || 'business';

  if (!callback) {
    return ContentService.createTextOutput("Error: 'callback' parameter is missing.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (action === 'getWebsiteTypes') {
    try {
      const websiteTypes = getWebsiteTypes();
      return createJsonpResponse(websiteTypes, callback);
    } catch (error) {
      Logger.log(`getWebsiteTypes Error: ${error.message}`);
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'getData') {
    try {
      const data = getData(websiteType);
      return createJsonpResponse(data, callback);
    } catch (error) {
      Logger.log(`getData Error: ${error.message}`);
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'saveData') {
    try {
      const data = {
        type: e.parameter.type,
        websiteType: websiteType,
        name: e.parameter.name,
        email: e.parameter.email,
        phone: e.parameter.phone,
        message: e.parameter.message
      };
      
      const result = saveDataToSheet(data);
      return createJsonpResponse(result, callback);
    } catch (error) {
      Logger.log(`saveData Error: ${error.message}`);
      return createJsonpResponse({ status: 'error', message: error.message }, callback);
    }
  }
  else {
    return createJsonpResponse({ error: 'Invalid action' }, callback);
  }
}

/**
 * Get website types from JSON
 */
function getWebsiteTypes() {
  const websiteTypes = {
    "website_types": [
      {
        "name": "Business",
        "subcategories": ["Corporate", "Small Business", "Enterprise", "Startup"],
        "icon": "briefcase",
        "color": "#2c3e50"
      },
      {
        "name": "E-commerce",
        "subcategories": ["Online Store", "Marketplace", "Dropshipping", "Subscription Service"],
        "icon": "shopping-cart",
        "color": "#27ae60"
      },
      {
        "name": "Portfolio",
        "subcategories": ["Creative Portfolio", "Photography Portfolio", "Design Portfolio", "Artist Portfolio"],
        "icon": "palette",
        "color": "#8e44ad"
      },
      {
        "name": "Blog",
        "subcategories": ["Personal Blog", "Tech Blog", "Travel Blog", "Food Blog", "Fashion Blog"],
        "icon": "journal-text",
        "color": "#e74c3c"
      }
    ]
  };
  
  return JSON.stringify(websiteTypes);
}

/**
 * Save data to sheet
 */
function saveDataToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (sheet.getLastRow() === 0) {
      const headers = ["Timestamp", "Website Type", "Type", ...Object.keys(data)];
      sheet.appendRow(headers);
    }
    
    const timestamp = new Date();
    const row = [timestamp, data.websiteType, data.type, ...Object.values(data)];
    
    sheet.appendRow(row);
    
    return { status: 'success' };
  } catch (error) {
    Logger.log(`Save error: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}
