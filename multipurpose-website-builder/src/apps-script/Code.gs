const SPREADSHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';  // <- replace with your real Sheet ID
const SETTINGS_SHEET = 'Settings';
const ENTRIES_SHEET = 'Entries';
const TEXTMAPPING_SHEET = 'TextMapping';
const THEMES_SHEET = 'Themes';

// ============= Entry Point =============
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
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
      return jsonResponse(generateTheme());
    // Step 4: builder calls this
    case 'generateThemeAndSave':
      return jsonResponse(generateThemeAndSave(params.themeName, params.pushToGitHub === 'true'));
    default:
      return jsonResponse({ status: 'error', message: 'Unknown action' });
  }
}

function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj || {}));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============= Settings =============
function getSettings() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SETTINGS_SHEET);
  const rows = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const key = row[0];
    const value = row[1];
    if (key) map[key] = value;
  }
  return { status: 'ok', settings: map };
}

function saveSettings(configJson) {
  if (!configJson) {
    return { status: 'error', message: 'Missing config JSON' };
  }
  const config = JSON.parse(configJson);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();

  const rowIndexByKey = {};
  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    if (key) rowIndexByKey[key] = i + 1; // 1-based
  }

  Object.keys(config).forEach(function(key) {
    const v = config[key];
    if (rowIndexByKey[key]) {
      sheet.getRange(rowIndexByKey[key], 2).setValue(v);
    } else {
      const lastRow = sheet.getLastRow() + 1;
      sheet.getRange(lastRow, 1).setValue(key);
      sheet.getRange(lastRow, 2).setValue(v);
    }
  });

  return { status: 'ok' };
}

// ============= Products / Entries =============
function getProducts() {
  const settingsObj = getSettings();
  const settings = settingsObj.settings || {};
  const source = settings.product_source || 'blogger'; // blogger|wordpress|woocommerce

  if (source === 'wordpress' || source === 'woocommerce') {
    return { status: 'ok', items: fetchFromWordpress(settings) };
  }
  return { status: 'ok', items: fetchFromBlogger(settings) };
}

function fetchFromBlogger(settings) {
  const feedUrl = settings.blogger_feed_url;
  if (!feedUrl) return [];

  const resp = UrlFetchApp.fetch(feedUrl);
  const data = JSON.parse(resp.getContentText());
  const entries = (data.feed && data.feed.entry) || [];
  return entries.map(function(entry) {
    return normalizeBloggerEntry(entry);
  });
}

function normalizeBloggerEntry(entry) {
  const title = entry.title ? entry.title.$t : '';
  const content = entry.content ? entry.content.$t : '';
  const labels = (entry.category || []).map(function(c) { return c.term; });
  const image = extractImageFromHtml(content);
  const price = extractPrice(content, labels);
  const variants = extractVariantsFromLabels(labels);

  return {
    id: entry.id ? entry.id.$t : '',
    title: title,
    content: content,
    labels: labels,
    image: image,
    price: price,
    variants: variants
  };
}

// TODO: Implement WordPress / WooCommerce mapping if needed
function fetchFromWordpress(settings) {
  // const wpUrl = settings.wp_api_url;
  // if (!wpUrl) return [];
  // const resp = UrlFetchApp.fetch(wpUrl);
  // const data = JSON.parse(resp.getContentText());
  // return data.map(normalizeWordpressItem);
  return [];
}

function extractImageFromHtml(html) {
  const m = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractPrice(content, labels) {
  if (content) {
    const m = content.match(/price[:=]\s*([\d.,]+)/i);
    if (m) return m[1];
  }

  const priceLabel = (labels || []).find(function(l) {
    return /^price[-:]/i.test(l);
  });
  if (priceLabel) {
    return priceLabel.split(/[-:]/)[1];
  }
  return '';
}

function extractVariantsFromLabels(labels) {
  const variants = {};
  (labels || []).forEach(function(label) {
    const idx = label.indexOf(':');
    if (idx > 0) {
      const group = label.slice(0, idx).trim();
      const option = label.slice(idx + 1).trim();
      if (!variants[group]) variants[group] = [];
      if (variants[group].indexOf(option) === -1) {
        variants[group].push(option);
      }
    }
  });
  return variants;
}

// ============= Text Mapping (Multi-language) =============
function getTextMapping() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TEXTMAPPING_SHEET);
  const values = sheet.getDataRange().getValues();
  if (!values || values.length === 0) {
    return { status: 'ok', map: {} };
  }

  const headers = values[0]; // key | default | en | fr | ar ...
  const result = {};
  for (var r = 1; r < values.length; r++) {
    const row = values[r];
    const key = row[0];
    if (!key) continue;
    const entry = {};
    entry.default = row[1];
    for (var c = 2; c < headers.length; c++) {
      const lang = headers[c];
      if (!lang) continue;
      entry[lang] = row[c];
    }
    result[key] = entry;
  }

  return { status: 'ok', map: result };
}

// ============= Entries (Orders / Forms) =============
function saveEntry(entryJson) {
  const entry = JSON.parse(entryJson || '{}');
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ENTRIES_SHEET);
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

// ============= Theme Generation (Step 4 support) =============

/**
 * Internal: Builds the theme XML using ThemeTemplate.html
 */
function generateThemeXml_() {
  const settingsObj = getSettings();
  const settings = settingsObj.settings || {};
  const template = HtmlService.createTemplateFromFile('ThemeTemplate');
  template.settings = settings;
  const xml = template.evaluate().getContent();
  return xml;
}

/**
 * Old endpoint, kept for compatibility: just returns xml.
 */
function generateTheme() {
  const xml = generateThemeXml_();
  return { status: 'ok', themeXml: xml };
}

/**
 * Ensure Themes sheet exists and has basic header.
 */
function ensureThemesSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(THEMES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(THEMES_SHEET);
    sheet.appendRow(['timestamp', 'theme_name', 'xml']);
  }
  return sheet;
}

/**
 * Find row index (1-based) for a theme name in Themes sheet.
 * Returns 0 if not found.
 */
function findThemeRowByName_(themeName) {
  const sheet = ensureThemesSheet_();
  const values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (values[r][1] === themeName) {
      return r + 1; // 1-based row index
    }
  }
  return 0;
}

/**
 * Step 4 main function: generate XML, save into Themes sheet,
 * optionally push to GitHub.
 */
function generateThemeAndSave(themeName, pushToGitHub) {
  themeName = (themeName || '').trim();
  if (!themeName) {
    return { status: 'error', message: 'Theme name is required.' };
  }

  const sheet = ensureThemesSheet_();
  const existingRow = findThemeRowByName_(themeName);
  if (existingRow) {
    return {
      status: 'name-exists',
      message: 'Theme name already exists. Please choose another name.'
    };
  }

  const xml = generateThemeXml_();

  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1).setValue(new Date());
  sheet.getRange(newRow, 2).setValue(themeName);
  sheet.getRange(newRow, 3).setValue(xml);

  var githubResult = { status: 'skipped' };
  if (pushToGitHub) {
    githubResult = pushThemeToGitHub_(themeName, xml);
  }

  return {
    status: 'ok',
    themeName: themeName,
    sheetRow: newRow,
    github: githubResult
  };
}

/**
 * Optional GitHub push.
 * Uses Settings keys:
 *   github_enabled (yes/no)
 *   github_repo    (e.g. user/repo)
 *   github_token   (PAT)
 *   github_branch  (e.g. themes or main)
 *
 * This is intentionally simple and defensive.
 */
function pushThemeToGitHub_(themeName, xml) {
  var settingsObj = getSettings();
  var settings = settingsObj.settings || {};

  var enabled = (settings.github_enabled || '').toString().toLowerCase();
  if (enabled !== 'yes') {
    return { status: 'skipped', message: 'GitHub integration not enabled in Settings.' };
  }

  var repo = settings.github_repo;
  var token = settings.github_token;
  var branch = settings.github_branch || 'main';

  if (!repo || !token) {
    return { status: 'error', message: 'Missing github_repo or github_token in Settings.' };
  }

  try {
    var contentBase64 = Utilities.base64Encode(xml);
    var filePath = 'themes/' + themeName + '.xml';

    var url = 'https://api.github.com/repos/' + repo + '/contents/' + encodeURIComponent(filePath);
    var options = {
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json'
      },
      muteHttpExceptions: true,
      contentType: 'application/json',
      payload: JSON.stringify({
        message: 'Add/update theme ' + themeName,
        content: contentBase64,
        branch: branch
      })
    };

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      return { status: 'ok', message: 'Theme pushed to GitHub.' };
    } else {
      return {
        status: 'error',
        message: 'GitHub API error: ' + code + ' ' + response.getContentText()
      };
    }
  } catch (e) {
    return { status: 'error', message: 'Exception while pushing to GitHub: ' + e };
  }
}

// ============= HTML Includes Helper =============
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
