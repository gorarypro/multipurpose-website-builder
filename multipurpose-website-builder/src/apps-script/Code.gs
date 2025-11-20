const SPREADSHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';
const SETTINGS_SHEET = 'Settings';
const ENTRIES_SHEET = 'Entries';
const TEXTMAPPING_SHEET = 'TextMapping';
const THEMES_SHEET = 'ThemeNames';

// ============= Entry Point =============
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || '';

  if (!action) {
    // Serve Builder UI by default
    return HtmlService
      .createTemplateFromFile('Builder')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  switch (action) {
    case 'getSettings':
      return jsonResponse(getSettings());
    case 'saveSettings':
      return jsonResponse(saveSettings(params.config));
    case 'getProducts':
      return jsonResponse(getProducts());
    case 'getTextMap':
      return jsonResponse(getTextMapping());
    case 'saveEntry':
      return jsonResponse(saveEntry(params.entry));
    case 'generateTheme':
      // Backwards compatibility: no name
      return jsonResponse({
        status: 'ok',
        themeXml: generateTheme()
      });
    case 'generateThemeNamed':
      return jsonResponse(generateThemeNamed(params.themeName));
    case 'isThemeNameAvailable':
      return jsonResponse({
        status: 'ok',
        available: isThemeNameAvailable(params.themeName)
      });
    default:
      return jsonResponse({ status: 'error', message: 'Unknown action' });
  }
}

function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

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

// ============= Settings =============
function getSettings() {
  const sheet = getSpreadsheet_().getSheetByName(SETTINGS_SHEET);
  if (!sheet) return { status: 'ok', settings: {} };

  const rows = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    const [key, value] = rows[i];
    if (key) map[key] = value;
  }
  return { status: 'ok', settings: map };
}

function saveSettings(configJson) {
  const config = JSON.parse(configJson);
  const ss = getSpreadsheet_();
  const sheet = getOrCreateSheet_(SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();

  const map = {};
  for (let i = 1; i < values.length; i++) {
    const [key] = values[i];
    if (key) map[key] = i;
  }

  Object.keys(config).forEach(key => {
    if (map[key] != null) {
      sheet.getRange(map[key] + 1, 2).setValue(config[key]);
    } else {
      const last = sheet.getLastRow() + 1;
      sheet.getRange(last, 1).setValue(key);
      sheet.getRange(last, 2).setValue(config[key]);
    }
  });

  return { status: 'ok' };
}

// ============= Products / Entries =============
function getProducts() {
  const settings = getSettings().settings || {};
  const source = settings.product_source || 'blogger'; // blogger|wordpress|woocommerce

  if (source === 'wordpress' || source === 'woocommerce') {
    return { status: 'ok', items: fetchFromWordpress_(settings) };
  }
  return { status: 'ok', items: fetchFromBlogger_(settings) };
}

function fetchFromBlogger_(settings) {
  const feedUrl = settings.blogger_feed_url;
  if (!feedUrl) return [];

  const resp = UrlFetchApp.fetch(feedUrl);
  const data = JSON.parse(resp.getContentText());
  const entries = (data.feed && data.feed.entry) || [];
  return entries.map(entry => normalizeBloggerEntry_(entry));
}

function normalizeBloggerEntry_(entry) {
  const title = entry.title ? entry.title.$t : '';
  const content = entry.content ? entry.content.$t : '';
  const labels = (entry.category || []).map(c => c.term);
  const image = extractImageFromHtml_(content);
  const price = extractPrice_(content, labels);
  const variants = extractVariantsFromLabels_(labels);

  return {
    id: entry.id ? entry.id.$t : '',
    title,
    content,
    labels,
    image,
    price,
    variants
  };
}

// TODO: Implement WordPress / WooCommerce mapping
function fetchFromWordpress_(settings) {
  // const wpUrl = settings.wp_api_url;
  // if (!wpUrl) return [];
  // const resp = UrlFetchApp.fetch(wpUrl);
  // const data = JSON.parse(resp.getContentText());
  // return data.map(item => normalizeWordpressItem_(item));
  return [];
}

function extractImageFromHtml_(html) {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractPrice_(content, labels) {
  const m = content.match(/price[:=]\s*([\d.,]+)/i);
  if (m) return m[1];

  const priceLabel = (labels || []).find(l => /^price[-:]/i.test(l));
  if (priceLabel) return priceLabel.split(/[-:]/)[1];
  return '';
}

function extractVariantsFromLabels_(labels) {
  const variants = {};
  (labels || []).forEach(label => {
    const idx = label.indexOf(':');
    if (idx > 0) {
      const group = label.slice(0, idx).trim();
      const option = label.slice(idx + 1).trim();
      if (!variants[group]) variants[group] = [];
      if (!variants[group].includes(option)) variants[group].push(option);
    }
  });
  return variants;
}

// ============= Text Mapping (Multi-language) =============
function getTextMapping() {
  const sheet = getOrCreateSheet_(TEXTMAPPING_SHEET);
  const values = sheet.getDataRange().getValues();
  if (!values.length) {
    return { status: 'ok', map: {} };
  }

  const headers = values.shift(); // key | default | en | fr | ar ...
  const result = {};
  values.forEach(row => {
    const key = row[0];
    if (!key) return;
    result[key] = {};
    result[key].default = row[1];
    for (let i = 2; i < headers.length; i++) {
      const lang = headers[i];
      if (!lang) continue;
      result[key][lang] = row[i];
    }
  });

  return { status: 'ok', map: result };
}

// ============= Entries (Orders / Forms) =============
function saveEntry(entryJson) {
  const entry = JSON.parse(entryJson);
  const sheet = getOrCreateSheet_(ENTRIES_SHEET);
  const row = [
    new Date(),
    entry.type || '',
    entry.productId || '',
    entry.title || '',
    entry.variants || '',
    entry.quantity || '',
    entry.price || '',
    entry.total || '',
    entry.name || '',
    entry.email || '',
    entry.phone || '',
    entry.message || ''
  ];
  sheet.appendRow(row);
  return { status: 'ok' };
}

// ============= Theme Name Registry =============
function isThemeNameAvailable(themeName) {
  if (!themeName) return false;
  const sheet = getOrCreateSheet_(THEMES_SHEET);
  const lastRow = sheet.getLastRow();
  if (!lastRow) return true;

  const values = sheet.getRange(1, 1, lastRow, 1).getValues();
  const target = themeName.toString().trim().toLowerCase();
  for (let i = 0; i < values.length; i++) {
    const existing = (values[i][0] || '').toString().trim().toLowerCase();
    if (existing && existing === target) {
      return false;
    }
  }
  return true;
}

function registerThemeName_(themeName) {
  const sheet = getOrCreateSheet_(THEMES_SHEET);
  sheet.appendRow([themeName, new Date()]);
}

// ============= Theme Generation =============
// Base: only returns XML string
function generateTheme() {
  const template = HtmlService.createTemplateFromFile('ThemeTemplate');
  const settings = getSettings().settings || {};
  template.settings = settings;
  const xml = template.evaluate().getContent();
  return xml;
}

// Named: checks uniqueness & registers
function generateThemeNamed(themeName) {
  if (!themeName) {
    return { status: 'error', message: 'themeName is required' };
  }
  if (!isThemeNameAvailable(themeName)) {
    return {
      status: 'error',
      code: 'NAME_TAKEN',
      message: 'Theme name already used. Please choose another name.'
    };
  }
  const xml = generateTheme();
  registerThemeName_(themeName);
  return {
    status: 'ok',
    themeXml: xml,
    themeName: themeName
  };
}

// ============= HTML Includes Helper =============
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
