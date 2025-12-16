/** ========================================================
 * Multipurpose Website Builder – Backend (Code.gs)
 * SAFE VERSION — JSONP + Base64 theme XML
 * ========================================================
 */

// --- CONFIGURATION CONSTANTS (Adjust these if necessary) ---
const SPREADSHEET_ID    = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA';
const SETTINGS_SHEET    = 'Settings';
const ENTRIES_SHEET     = 'Entries';
const TEXTMAPPING_SHEET = 'TextMapping';
const THEMES_SHEET      = 'Themes';

// GitHub Defaults (Settings sheet values override these)
const GITHUB_REPO       = 'gorarypro/multipurpose-website-builder';
const GITHUB_BRANCH     = 'main';
const GITHUB_ENABLED    = true;

// Fallback Blogger feed URL
const BLOG_FEED_URL     = 'https://eventsushi.blogspot.com/feeds/posts/default?alt=json&max-results=50';
// -------------------------------------------------------------


/* ========================================================
 * doGet — serves Builder UI or JSON/JSONP API
 * ======================================================== */
function doGet(e) {
  const params = e && e.parameter ?
    e.parameter : {};
  const action = params.action || '';

  // No action → serve the Builder UI
  if (!action) {
    return HtmlService
      .createTemplateFromFile('Builder')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // API actions
  switch (action) {
    case 'getSettings':
      return json(getSettings(), e);
    case 'saveSettings':
      return json(saveSettings(params.config), e);

    case 'getProducts':
      return json(getProducts(), e);
    case 'getTextMap':
      return json(getTextMapping(), e);

    case 'saveEntry':
      return json(saveEntry(params.entry), e); // Dispatcher

    case 'generateTheme':
      return json(generateTheme(params.name), e);
    case 'saveThemeXml':
      return json(saveThemeXml(params.name, params.xml), e);
    case 'pushThemeToGitHub':
      return json(pushThemeToGitHub(params.name), e);
    default:
      return json(
        { status: 'error', message: 'Unknown action: ' + action },
        e
      );
  }
}

/**
 * json(obj, e)
 * - If e.parameter.callback exists → JSONP (callback(<json>);)
 * - Else → normal JSON
 */
function json(obj, e) {
  const callback =
    e && e.parameter && typeof e.parameter.callback === 'string'
      ?
      e.parameter.callback
      : null;

  const text = JSON.stringify(obj);
  if (callback) {
    // JSONP
    return ContentService
      .createTextOutput(callback + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Plain JSON
  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Sheet Helpers ---
function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet_(name) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Helper to convert HEX color string (without #) to R, G, B string for CSS variables.
 * @param {string} hex The 6-digit hex string (e.g., "ff0000" or "#ff0000").
 * @returns {string} The RGB string (e.g., "255, 0, 0").
 */
function hexToRgb_(hex) {
  // Ensure we only use 6 characters
  const h = (String(hex) || '000000').replace(/^#/, '');

  if (h.length !== 6) {
    // Fallback to Bootstrap default blue RGB if input is invalid
    return '13, 110, 253'; 
  }

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  return r + ', ' + g + ', ' + b;
}

/**
 * Provides necessary default settings for new keys.
 */
function getLoaderDefaults_() {
  return {
    primary_color: '0d6efd',
    secondary_color: '6c757d', // Default Bootstrap Secondary
    color_mode: 'light',       // NEW: Default to Light mode
    loader_bg_color: '#1E2733',
    loader_bg_text: 'Loading Website...',
    asset_base_url: 'https://cdn.jsdelivr.net/gh/gorarypro/multipurpose-website-builder@main/multipurpose-website-builder/src/assets'
  };
}

/**
 * Calculates primary, secondary, and general theme colors based on settings.
 * Note: This function is called by ThemeTemplate.html.
 */
function calculateThemeColors(settings) {
  // Get values from settings, using defaults if necessary
  const primaryHex = (settings.primary_color || '0d6efd').replace(/^#/, '');
  const secondaryHex = (settings.secondary_color || '6c757d').replace(/^#/, ''); 
  const mode = (settings.color_mode || 'light').toLowerCase();

  const colors = {
    // Primary
    PRIMARY_HEX: primaryHex,
    PRIMARY_RGB: hexToRgb_(primaryHex),
    
    // Secondary
    SECONDARY_HEX: secondaryHex,
    SECONDARY_RGB: hexToRgb_(secondaryHex),
    
    // Theme Mode Overrides (for background and text)
    THEME_BG: '#ffffff',
    THEME_TEXT: '#212529'
  };

  if (mode === 'dark') {
    colors.THEME_BG = '#212529'; // Dark gray background
    colors.THEME_TEXT = '#f8f9fa'; // Light text (Bootstrap white)
  }
  
  // Pass all calculated colors to the template
  return colors;
}


/* ========================================================
 * SETTINGS
 * ======================================================== */
function getSettings() {
  const sheet = getOrCreateSheet_(SETTINGS_SHEET);
  const rows = sheet.getDataRange().getValues();
  
  // Start with defaults to ensure new keys exist
  const map = getLoaderDefaults_(); 

  // Row 0 = header, start from 1
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    const value = rows[i][1];
    if (key) map[key] = value;
  }

  return { status: 'ok', settings: map };
}

function saveSettings(jsonConfig) {
  const config = JSON.parse(jsonConfig);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet_(SETTINGS_SHEET);
  const rows = sheet.getDataRange().getValues();
  const indexMap = {};
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    if (key) indexMap[key] = i + 1; // 1-based
  }

  Object.keys(config).forEach(key => {
    if (indexMap[key]) {
      sheet.getRange(indexMap[key], 2).setValue(config[key]);
    } else {
      const last = sheet.getLastRow() + 1;
      sheet.getRange(last, 1).setValue(key);
      sheet.getRange(last, 2).setValue(config[key]);
    }
  });
  return { status: 'ok' };
}

/* ========================================================
 * PRODUCTS (Blogger / WordPress)
 * ======================================================== */
function getProducts() {
  const settings = getSettings().settings;
  const source = settings.product_source || 'blogger';

  if (source === 'wordpress' || source === 'woocommerce') {
    return { status: 'ok', items: fetchFromWordPress(settings) };
  }

  // Default: Blogger
  return { status: 'ok', items: fetchFromBlogger(settings) };
}

function fetchFromBlogger(settings) {
  // Prefer Settings sheet value, fallback to BLOG_FEED_URL constant
  const feedUrl = settings.blogger_feed_url ||
    BLOG_FEED_URL;
  if (!feedUrl) return [];

  const resp = UrlFetchApp.fetch(feedUrl);
  const data = JSON.parse(resp.getContentText());

  const entries = (data.feed && data.feed.entry) ||
    [];
  return entries.map(entry => normalizeBloggerEntry(entry));
}

function normalizeBloggerEntry(entry) {
  const title   = entry.title  && entry.title.$t  ?
    entry.title.$t  : '';
  const content = entry.content && entry.content.$t ? entry.content.$t : '';
  const labels  = (entry.category || []).map(c => c.term);

  return {
    id      : entry.id && entry.id.$t ?
      entry.id.$t : '',
    title   : title,
    content : content,
    labels  : labels,
    image   : extractImageFromHtml(content),
    price   : extractPrice(content, labels),
    variants: extractVariantsFromLabels(labels)
  };
}

function extractImageFromHtml(html) {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractPrice(content, labels) {
  const m = content.match(/price[:=]\s*([\d.,]+)/i);
  if (m) return m[1];

  const label = labels.find(l => /^price[-:]/i.test(l));
  return label ? label.split(/[-:]/)[1] : '';
}

function extractVariantsFromLabels(labels) {
  const map = {};
  (labels || []).forEach(label => {
    const p = label.indexOf(':');
    if (p > 0) {
      const group  = label.slice(0, p).trim();
      const option = label.slice(p + 1).trim();
      if (!map[group]) map[group]
        = [];
      if (!map[group].includes(option)) map[group].push(option);
    }
  });
  return map;
}

function fetchFromWordPress(settings) {
  // Placeholder for WordPress fetching logic
  return [];
}

/* ========================================================
 * TEXT MAPPING
 * ======================================================== */
function getTextMapping() {
  const sheet = getOrCreateSheet_(TEXTMAPPING_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();  // first row = header
  const result = {};
  data.forEach(row => {
    const key = row[0];
    if (!key) return;

    result[key] = { default: row[1] };
    for (let i = 2; i < headers.length; i++) {
      const lang = headers[i];
      if (lang) {
        result[key][lang] = row[i];
      }
    }
  });
  return { status: 'ok', map: result };
}

/* ========================================================
 * SAVE ENTRIES (orders / forms) - Dispatcher
 * ======================================================== */
function saveEntry(entryJson) {
  const entry = JSON.parse(entryJson);
  const type = (entry.type || '').toLowerCase();

  switch (type) {
    case 'order':
      return saveOrderEntry(entry);
    case 'contact':
      return saveContactEntry(entry);
    default:
      // Fallback for unexpected types
      return saveOrderEntry(entry);
  }
}

function saveOrderEntry(entry) {
  const sheet = getOrCreateSheet_(ENTRIES_SHEET);
  // Log all available order fields
  sheet.appendRow([
    new Date(),
    entry.type      || '',
    entry.product_id || '',
    entry.title     || '',
    entry.variants  || '',
    entry.qty       || '',
    entry.price     || '',
    entry.total     || '',
    entry.name      || '',
    entry.email     || '',
    entry.phone     || '',
    entry.message   || ''
  ]);
  return { status: 'ok' };
}

function saveContactEntry(entry) {
  const sheet = getOrCreateSheet_(ENTRIES_SHEET);
  // Log only relevant contact fields, leaving order fields blank
  const row = [
    new Date(),
    entry.type      || 'contact', // type
    '',                             // product_id
    '',                             // title
    '',                             // variants
    '',                             // qty
    '',                             // price
    '',                             // total
    entry.name      || '',          // name
    entry.email     || '',          // email
    entry.phone     || '',          // phone
    entry.message   || ''           // message
  ];
  sheet.appendRow(row);
  return { status: 'ok' };
}


/* ========================================================
 * THEME GENERATION — SAFE BASE64 VERSION
 * ======================================================== */
function generateTheme(name) {
  try {
    const template = HtmlService.createTemplateFromFile('ThemeTemplate');
    template.settings = getSettings().settings;

    // Render full Blogger theme XML
    const xml = template.evaluate().getContent();
    // Encode before sending to frontend (IMPORTANT)
    const encoded = Utilities.base64Encode(xml);
    return {
      status: 'ok',
      xml   : encoded,
      name  : name
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/* ========================================================
 * SAVE THEME XML TO SHEET
 * ======================================================== */
function saveThemeXml(name, xmlPlain) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(THEMES_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(THEMES_SHEET);
      sheet.appendRow(['theme_name', 'xml', 'timestamp']);
    }

    sheet.appendRow([name, xmlPlain, new Date()]);
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/* ========================================================
 * PUSH THEME TO GITHUB (SHA LOOKUP ADDED)
 * ======================================================== */
function pushThemeToGitHub(name) {
  try {
    const settings = getSettings().settings;
    // Prefer sheet settings; fallback to constants
    const enabledFlag = (settings.github_enabled || '').toString().toLowerCase();
    const repo   = settings.github_repo   || GITHUB_REPO;
    const branch = settings.github_branch || GITHUB_BRANCH;
    const token  = settings.github_token  || null;

    if (!token || !repo || enabledFlag === 'no') {
      return { status: 'error', message: 'GitHub not configured' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(THEMES_SHEET);
    if (!sheet) {
      return { status: 'error', message: 'Themes sheet not found.' };
    }

    const rows = sheet.getDataRange().getValues();
    const row = rows.find(r => r[0] === name);
    if (!row) {
      return { status: 'error', message: 'Theme not found in sheet.' };
    }

    const xml  = row[1];
    const path = 'themes/' + name + '.xml';
    const url = 'https://api.github.com/repos/' + repo + '/contents/' + path;
    
    // --- STEP 1: Check for existing file and retrieve SHA ---
    let currentSha = null;
    try {
      const getOptions = {
        method: 'get',
        headers: {
          Authorization: 'token ' + token,
          Accept: 'application/vnd.github.v3+json'
        },
        // We mute exceptions to handle 404 (file not found) gracefully
        muteHttpExceptions: true 
      };
      // Fetch the file metadata on the target branch
      const existingFileResp = UrlFetchApp.fetch(url + '?ref=' + branch, getOptions);
      const existingFileData = JSON.parse(existingFileResp.getContentText());

      // If the file exists (status 200) and has a sha, store it
      if (existingFileResp.getResponseCode() === 200 && existingFileData.sha) {
        currentSha = existingFileData.sha;
      }
    } catch (e) {
      Logger.log('Error during SHA retrieval: ' + e.toString());
    }
    
    // --- STEP 2: Prepare PUT Request Body ---
    const body = {
      message: currentSha ? 'Update existing Blogger theme XML: ' + name : 'Initial upload Blogger theme XML: ' + name,
      content: Utilities.base64Encode(xml),
      branch : branch
    };
    
    // CRITICAL: Add SHA only if we found an existing file
    if (currentSha) {
      body.sha = currentSha;
    }

    const options = {
      method : 'put',
      headers: {
        Authorization: 'token ' + token,
        Accept      : 'application/vnd.github+json'
      },
      payload           : JSON.stringify(body),
      muteHttpExceptions: true
    };
    
    // --- STEP 3: Execute PUT Request ---
    const resp = UrlFetchApp.fetch(url, options);
    const jsonResp = JSON.parse(resp.getContentText());

    if (jsonResp.content && jsonResp.content.path) {
      return { status: 'ok', path: jsonResp.content.path };
    }
    
    // Return GitHub error details for client debugging
    return { 
      status: 'error', 
      message: JSON.stringify(jsonResp),
      github_status: jsonResp.status
    };
    
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/* ========================================================
 * HTML Includes for Template()
 * ======================================================== */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ========================================================
 * Helpers (Provided for context/debugging)
 * ======================================================== */

/**
 * escapeXml(str)
 * Safely escape user / settings content before injecting into XML.
 */
function escapeXml(str) {
  if (!str) return '';
  // Note: Your original working template code implies this function is used
  // to escape sensitive user input.
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/&&/g, '&amp;&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function manualGithubAuth() {
  UrlFetchApp.fetch('https://api.github.com');
}

function testBloggerFetch() {
  const settings = getSettings().settings;
  const feedUrl = settings.blogger_feed_url || BLOG_FEED_URL;
  const resp
    = UrlFetchApp.fetch(feedUrl);
  Logger.log(resp.getResponseCode());
}

function debugGithubSettings() {
  const s = getSettings().settings;
  Logger.log('github_repo = ' + s.github_repo);
  Logger.log('github_token = ' + (s.github_token ? 'present' : 'MISSING'));
  Logger.log('github_branch = ' + s.github_branch);
  Logger.log('github_enabled = ' + s.github_enabled);
}
