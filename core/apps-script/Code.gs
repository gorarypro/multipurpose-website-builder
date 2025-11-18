const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA';
const SETTINGS_SHEET_NAME = 'Settings';
const DATA_SHEET_NAME = 'Data';
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&max-results=50';

function doGet(e) {
  // If no parameters, serve the Builder HTML
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutputFromFile('Builder')
        .setTitle('Website Builder')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // JSONP API for the Blog
  const action = e.parameter.action;
  const callback = e.parameter.callback;

  if (action === 'getConfig') {
    return createJsonpResponse(getConfig(), callback);
  } 
  else if (action === 'getData') {
    // Fetch data based on the Saved Config, OR an override
    const config = getConfig();
    const type = e.parameter.type || config.type || 'Home Improvement';
    const data = getBloggerData(type);
    return createJsonpResponse(data, callback);
  }
}

// --- Builder Functions ---
function saveConfig(config) {
  const sheet = getSheet(SETTINGS_SHEET_NAME);
  sheet.clear(); // Overwrite previous settings
  sheet.appendRow(['Key', 'Value']);
  sheet.appendRow(['type', config.type]);
  sheet.appendRow(['title', config.title]);
  sheet.appendRow(['color', config.color]);
  return "Success";
}

function getConfig() {
  const sheet = getSheet(SETTINGS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const config = {};
  // Skip header, read rows
  for (let i = 1; i < data.length; i++) {
    config[data[i][0]] = data[i][1];
  }
  return config;
}

// --- Helper Functions ---
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function createJsonpResponse(data, callback) {
  const jsonString = JSON.stringify(data);
  const jsonpData = callback + '(' + jsonString + ')';
  const output = ContentService.createTextOutput(jsonpData);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return output;
}

function getBloggerData(websiteType) {
  const response = UrlFetchApp.fetch(BLOG_FEED_URL, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) return [];
  
  const bloggerJson = JSON.parse(response.getContentText());
  const posts = bloggerJson.feed.entry || [];
  
  // Simple processing (In a real app, you would filter by label 'websiteType')
  return posts.map(post => {
    let imageUrl = 'https://placehold.co/600x400/e67e22/white?text=No+Image';
    if (post.content && post.content.$t) {
      const match = post.content.$t.match(/<img[^>]+src="([^"]+)"/);
      if (match && match[1]) imageUrl = match[1];
    }
    return {
      id: post.id.$t.split('.post-')[1],
      title: post.title.$t,
      excerpt: post.content ? post.content.$t.replace(/<[^>]+>/g, ' ').substring(0, 120) + '...' : '',
      imageUrl: imageUrl,
      date: new Date(post.published.$t).toLocaleDateString()
    };
  });
}
