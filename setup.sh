#!/bin/bash

echo "Multipurpose Website Builder Setup (Generator Edition)"
echo "===================================================="
echo

# --- CLEANUP ---
rm -rf core website-types components templates docs
rm -f website-types.json README.md LICENSE

# --- DIRECTORIES ---
mkdir -p core/apps-script
mkdir -p core/blogger-theme

# ======================================================
# 1. THEME TEMPLATE (The Blueprint)
# ======================================================
# This file is read by Code.gs, filled with your settings, and downloaded.
cat > core/apps-script/ThemeTemplate.html <<'ENDOFFILE'
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:responsive='true' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1.0' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'/>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css' rel='stylesheet'/>
  
  <!-- DYNAMIC STYLES FROM BUILDER -->
  <style>
    :root {
      --primary: {{SITE_COLOR}}; 
      --secondary: #e3622f;
      --dark: #4d200d;
    }
  </style>

  <b:skin><![CDATA[ 
    body { background-color: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
    #app-header { padding: 80px 0 40px; background-color: var(--primary); color: white; text-align: center; margin-bottom: 40px; transition: background 0.3s; }
    .matrix-container { max-width: 400px; margin: -30px auto 30px; }
    .matrix-input-group { background: white; padding: 8px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; }
    .matrix-input { border: none; outline: none; flex-grow: 1; padding: 5px 15px; font-size: 1.1rem; }
    .btn-go { border-radius: 50px; padding: 8px 25px; background: var(--primary); color: white; border: none; }
    .post-card { background: white; border-radius: 12px; overflow: hidden; height: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .post-card:hover { transform: translateY(-5px); }
    .post-img { height: 200px; width: 100%; object-fit: cover; }
    .post-body { padding: 20px; }
    .badge-sub { cursor: pointer; transition: 0.2s; }
    .badge-sub:hover { opacity: 0.8; }
    .loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: white; z-index: 9999; display: flex; justify-content: center; align-items: center; flex-direction: column; }
    
    /* Hides matrix if disabled */
    .matrix-hidden { display: none !important; }
  ]]></b:skin>
</head>
<body>

  <!-- Loader -->
  <div id="siteLoader" class="loader-overlay">
    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
    <p class="mt-3 text-muted">Building your site...</p>
  </div>

  <!-- Header -->
  <header id="app-header">
    <div class="container">
      <h1 class="display-4 fw-bold" id="app-title">{{SITE_TITLE}}</h1>
      <p class="lead opacity-75" id="app-subtitle">{{SITE_TYPE}}</p>
    </div>
  </header>

  <!-- Matrix Navigation -->
  <div class="container matrix-container {{MATRIX_CLASS}}" id="matrixContainer">
    <div class="matrix-input-group">
      <span class="ms-2 text-muted"><i class="bi bi-grid-3x3-gap-fill"></i></span>
      <input type="text" id="matrixInput" class="matrix-input" placeholder="Matrix Code (e.g. 1-2)" />
      <button class="btn-go" id="matrixBtn" onclick="runMatrix()">Go</button>
    </div>
  </div>

  <!-- Subcategories Display -->
  <div class="container text-center mb-4">
     <div id="subcat-badges"></div>
  </div>

  <!-- Content -->
  <div class="container mb-5">
    <div id="content-area" class="row g-4"></div>
  </div>

  <!-- Required Widget -->
  <b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
    <b:widget id='HTML1' locked='true' title='App' type='HTML' version='1'>
      <b:widget-settings><b:widget-setting name='content'/></b:widget-settings>
      <b:includable id='main'></b:includable>
    </b:widget>
  </b:section>

  <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'></script>
  <script>
  //<![CDATA[
    // ** AUTO-INJECTED URL **
    const WEB_APP_URL = '{{WEB_APP_URL}}';

    let siteConfig = {};
    let allTypes = [];
    let allPosts = [];
    let currentTypeConfig = null;

    document.addEventListener('DOMContentLoaded', () => {
        // Fallback Config if API fails
        siteConfig = { title: "{{SITE_TITLE}}", type: "{{SITE_TYPE}}", color: "{{SITE_COLOR}}" };

        const p1 = new Promise(r => fetchJsonp(WEB_APP_URL + '?action=getConfig', r));
        const p2 = new Promise(r => fetchJsonp(WEB_APP_URL + '?action=getWebsiteTypes', r));
        const p3 = new Promise(r => fetchJsonp(WEB_APP_URL + '?action=getData', r));

        Promise.all([p1, p2, p3]).then(([configData, typesData, postsData]) => {
            // Merge live config with baked-in defaults
            if(configData && !configData.error) siteConfig = configData;
            
            allTypes = (typesData && typesData.website_types) ? typesData.website_types : [];
            allPosts = postsData || [];

            const typeName = siteConfig.type || "{{SITE_TYPE}}";
            currentTypeConfig = allTypes.find(t => t.name === typeName);

            applyTheme();
            renderPosts(allPosts);
            document.getElementById('siteLoader').style.display = 'none';
        });

        const input = document.getElementById('matrixInput');
        if(input) input.addEventListener('keypress', (e) => { if(e.key === 'Enter') runMatrix(); });
    });

    function applyTheme() {
        document.getElementById('app-title').innerText = siteConfig.title;
        document.getElementById('app-subtitle').innerText = siteConfig.type;
        const color = siteConfig.color || '{{SITE_COLOR}}';
        document.documentElement.style.setProperty('--primary', color);
        
        if (currentTypeConfig && currentTypeConfig.subcategories) {
            const html = currentTypeConfig.subcategories.map((sub, i) => 
                `<span class="badge bg-secondary badge-sub me-1 mb-1" onclick="filterByMatrix(${i+1})">[${i+1}] ${sub}</span>`
            ).join('');
            document.getElementById('subcat-badges').innerHTML = html;
        }
    }

    function runMatrix() {
        const val = document.getElementById('matrixInput').value.trim();
        const clean = val.replace(/[^0-9]/g, '');
        let index = -1;
        
        if (clean.length >= 2) index = parseInt(clean.substring(1)) - 1;
        else index = parseInt(clean) - 1;

        if (index > -1) filterByMatrix(index + 1);
        else alert("Please enter a valid number");
    }

    function filterByMatrix(index) {
        if (!currentTypeConfig || !currentTypeConfig.subcategories) return;
        const subName = currentTypeConfig.subcategories[index - 1];
        if (!subName) { alert("Code " + index + " not found."); return; }

        const filtered = allPosts.filter(p => {
            if (!p.labels) return false;
            return p.labels.some(l => l.toLowerCase() === subName.toLowerCase());
        });

        renderPosts(filtered);
    }

    function renderPosts(posts) {
        const grid = document.getElementById('content-area');
        if (!posts || posts.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center p-5"><h3>No posts found.</h3><p class="text-muted">Ensure Blogger posts have Labels.</p></div>';
            return;
        }
        grid.innerHTML = posts.map(p => `
            <div class="col-md-4 col-sm-6">
                <div class="post-card">
                    <img src="${p.image}" class="post-img" alt="${p.title}">
                    <div class="post-body">
                        <h5 class="card-title">${p.title}</h5>
                        <p class="card-text small text-muted">${p.excerpt}</p>
                        <div class="mt-2">${p.labels.map(l => `<span class="badge bg-light text-dark border me-1">${l}</span>`).join('')}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function fetchJsonp(url, callback) {
        const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(data);
        };
        const script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        script.onerror = () => { delete window[callbackName]; callback(null); };
        document.body.appendChild(script);
    }
  //]]>
  </script>
</body>
</html>
ENDOFFILE

# ======================================================
# 2. BUILDER DASHBOARD (Admin Panel)
# ======================================================
cat > core/apps-script/Builder.html <<'ENDOFFILE'
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Website Builder Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { background-color: #f0f2f5; font-family: sans-serif; padding: 20px; }
      .card { border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div class="card p-4">
      <div class="text-center mb-4">
        <h2>🛠️ Website Builder Admin</h2>
        <p class="text-muted">Configure and Download</p>
      </div>
      
      <form id="builderForm">
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Website Title</label>
            <input type="text" class="form-control" id="siteTitle" value="Event Sushi">
          </div>
          <div class="col-md-6">
            <label class="form-label">Primary Color</label>
            <input type="color" class="form-control form-control-color w-100" id="siteColor" value="#fe7301">
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Select Category</label>
          <select class="form-select" id="websiteType">
            <option value="" disabled selected>Loading...</option>
          </select>
        </div>
        
        <div class="mb-4 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="featMatrix" checked>
            <label class="form-check-label" for="featMatrix">Enable Matrix Navigation</label>
        </div>

        <div class="d-grid gap-2">
          <button type="button" class="btn btn-success btn-lg" onclick="saveConfig()">💾 Save Settings</button>
          <button type="button" class="btn btn-dark btn-lg" onclick="downloadTheme()">📥 Download Theme XML</button>
        </div>
        <div id="status" class="mt-3 text-center"></div>
      </form>
    </div>

    <script>
      let allTypes = [];

      google.script.run.withSuccessHandler(data => {
        allTypes = data.website_types;
        const select = document.getElementById('websiteType');
        select.innerHTML = '<option value="" disabled selected>Choose a category...</option>';
        allTypes.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.name;
          opt.textContent = t.name;
          select.appendChild(opt);
        });
        
        google.script.run.withSuccessHandler(config => {
           if(config.title) document.getElementById('siteTitle').value = config.title;
           if(config.color) document.getElementById('siteColor').value = config.color;
           if(config.type) select.value = config.type;
        }).getSavedConfig();
        
      }).getWebsiteTypes();

      function saveConfig() {
        const btn = document.querySelector('.btn-success');
        btn.disabled = true;
        btn.innerText = "Saving...";
        
        const config = {
          type: document.getElementById('websiteType').value,
          title: document.getElementById('siteTitle').value,
          color: document.getElementById('siteColor').value,
          featMatrix: document.getElementById('featMatrix').checked.toString()
        };

        google.script.run.withSuccessHandler(() => {
           document.getElementById('status').innerHTML = '<div class="alert alert-success">Settings Saved!</div>';
           btn.disabled = false; 
           btn.innerText = "💾 Save Settings";
        }).saveConfigToSheet(config);
      }

      function downloadTheme() {
        const btn = document.querySelector('.btn-dark');
        btn.disabled = true;
        btn.innerText = "Generating...";
        
        const config = {
          type: document.getElementById('websiteType').value || "Home Improvement",
          title: document.getElementById('siteTitle').value || "My Site",
          color: document.getElementById('siteColor').value || "#333",
          featMatrix: document.getElementById('featMatrix').checked.toString()
        };

        google.script.run.withSuccessHandler(xmlContent => {
           const filename = "theme-" + config.type.replace(/\s+/g, '-').toLowerCase() + ".xml";
           const element = document.createElement('a');
           element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlContent));
           element.setAttribute('download', filename);
           element.style.display = 'none';
           document.body.appendChild(element);
           element.click();
           document.body.removeChild(element);
           
           btn.disabled = false;
           btn.innerText = "📥 Download Theme XML";
        }).generateThemeXml(config);
      }
    </script>
  </body>
</html>
ENDOFFILE

# ======================================================
# 3. APPS SCRIPT BACKEND (Code.gs)
# ======================================================
cat > core/apps-script/Code.gs <<'ENDOFFILE'
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA'; 
const SETTINGS_SHEET = 'Settings';
const BLOG_FEED_URL = 'https://eventsushi1.blogspot.com/feeds/posts/default?alt=json&max-results=50';

function doGet(e) {
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutputFromFile('Builder')
      .setTitle('Website Builder Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  if (!callback) return ContentService.createTextOutput("Error");
  
  let result = {};
  if (action === 'getConfig') result = getSavedConfig();
  else if (action === 'getWebsiteTypes') result = getWebsiteTypes();
  else if (action === 'getData') result = getBloggerData();
  
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

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

// --- GENERATOR FUNCTION ---
function generateThemeXml(uiConfig) {
  let xml = HtmlService.createHtmlOutputFromFile('ThemeTemplate').getContent();
  const url = ScriptApp.getService().getUrl();
  
  // Replace Placeholders with Actual Data
  xml = xml.replace('{{WEB_APP_URL}}', url);
  xml = xml.replace('{{SITE_TITLE}}', uiConfig.title);
  xml = xml.replace('{{SITE_TYPE}}', uiConfig.type);
  xml = xml.replace('{{SITE_COLOR}}', uiConfig.color);
  
  const matrixClass = (uiConfig.featMatrix === 'true') ? '' : 'matrix-hidden';
  xml = xml.replace('{{MATRIX_CLASS}}', matrixClass);

  return xml;
}

function saveConfigToSheet(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) { sheet = ss.insertSheet(SETTINGS_SHEET); sheet.appendRow(['Key', 'Value']); }
  sheet.getRange('A2:B20').clearContent();
  sheet.appendRow(['type', config.type]);
  sheet.appendRow(['title', config.title]);
  sheet.appendRow(['color', config.color]);
  sheet.appendRow(['featMatrix', config.featMatrix]);
}

function getSavedConfig() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SETTINGS_SHEET);
    if (!sheet) return {};
    const data = sheet.getDataRange().getValues();
    const config = {};
    for (let i = 1; i < data.length; i++) config[data[i][0]] = data[i][1];
    return config;
  } catch (e) { return {}; }
}

function getBloggerData() {
  try {
    const response = UrlFetchApp.fetch(BLOG_FEED_URL, { muteHttpExceptions: true });
    const json = JSON.parse(response.getContentText());
    return (json.feed.entry || []).map(p => {
      let img = 'https://placehold.co/600x400/eee/999?text=No+Image';
      if (p.content && p.content.$t) {
         const match = p.content.$t.match(/<img[^>]+src="([^"]+)"/);
         if (match) img = match[1];
      }
      let labels = p.category ? p.category.map(c => c.term) : [];
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
ENDOFFILE

echo
echo "=================================================================="
echo " Setup Complete! "
echo "=================================================================="
echo "1. Push to GitHub."
echo "2. In Apps Script: Create 3 files (Code.gs, Builder.html, ThemeTemplate.html)"
echo "3. Paste the content from the 'core/apps-script' folder into them."
echo "4. Deploy as Web App (Anyone)."
echo "5. Open the Web App URL -> Customize -> Click 'Download Theme XML'."
echo "6. Upload that XML file to Blogger."