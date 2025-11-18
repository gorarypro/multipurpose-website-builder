#!/bin/bash

echo "Multipurpose Website Builder Setup (Final Generator Edition)"
echo "=========================================================="
echo

# --- CLEANUP ---
rm -rf core website-types components templates docs
rm -f website-types.json README.md LICENSE

# --- DIRECTORIES ---
mkdir -p core/apps-script

echo "Creating files..."

# ==========================================
# 1. THEME TEMPLATE (Stored in Apps Script)
# ==========================================
# This is the raw XML that will be customized and downloaded
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
  <!-- DYNAMIC CSS VARIABLES -->
  <style id="dynamic-styles">
    :root {
      --primary-color: {{SITE_COLOR}};
    }
  </style>
  <b:skin><![CDATA[ 
    body { background-color: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
    #app-header { padding: 80px 0 40px; background-color: var(--primary-color, #333); color: white; text-align: center; margin-bottom: 40px; transition: background 0.3s; }
    .matrix-container { max-width: 400px; margin: -30px auto 30px; }
    .matrix-input-group { background: white; padding: 8px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; }
    .matrix-input { border: none; outline: none; flex-grow: 1; padding: 5px 15px; font-size: 1.1rem; }
    .btn-go { border-radius: 50px; padding: 8px 25px; background: var(--primary-color, #333); color: white; border: none; }
    .post-card { background: white; border-radius: 12px; overflow: hidden; height: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .post-card:hover { transform: translateY(-5px); }
    .post-img { height: 200px; width: 100%; object-fit: cover; }
    .post-body { padding: 20px; }
    .badge-sub { cursor: pointer; transition: 0.2s; }
    .badge-sub:hover { opacity: 0.8; }
    .loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: white; z-index: 9999; display: flex; justify-content: center; align-items: center; flex-direction: column; }
    
    /* Feature Toggles CSS */
    .feature-hidden { display: none !important; }
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
      <!-- Default Title injected from Builder -->
      <h1 class="display-4 fw-bold" id="app-title">{{SITE_TITLE}}</h1>
      <p class="lead opacity-75" id="app-subtitle">{{SITE_TYPE}}</p>
    </div>
  </header>

  <!-- Matrix Navigation -->
  <div class="container matrix-container {{MATRIX_CLASS}}">
    <div class="matrix-input-group">
      <span class="ms-2 align-self-center text-muted"><i class="bi bi-grid-3x3-gap-fill"></i></span>
      <input type="text" id="matrixInput" class="matrix-input" placeholder="Matrix Code (e.g. 1 or 2)" />
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
    // ** AUTO-INJECTED URL FROM BUILDER **
    const WEB_APP_URL = '{{WEB_APP_URL}}';

    let siteConfig = {};
    let allTypes = [];
    let allPosts = [];
    let currentTypeConfig = null;

    document.addEventListener('DOMContentLoaded', () => {
        
        // Load Data
        const p1 = new Promise(r => fetchJsonp(WEB_APP_URL + '?action=getConfig', r));
        const p2 = new Promise(r => fetchJsonp(WEB_APP_URL + '?action=getWebsiteTypes', r));
        const p3 = new Promise(r => fetchJsonp(WEB_APP_URL + '?action=getData', r));

        Promise.all([p1, p2, p3]).then(([configData, typesData, postsData]) => {
            
            siteConfig = configData || { title: "{{SITE_TITLE}}", type: "{{SITE_TYPE}}", color: "{{SITE_COLOR}}" };
            allTypes = typesData.website_types || [];
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
        
        const color = siteConfig.color || '#333';
        document.documentElement.style.setProperty('--primary-color', color);
        
        // Feature Toggles
        if(siteConfig.featMatrix === 'false') document.querySelector('.matrix-container').style.display = 'none';
        
        // Render Subcategory Badges
        if (currentTypeConfig && currentTypeConfig.subcategories) {
            const html = currentTypeConfig.subcategories.map((sub, i) => 
                `<span class="badge bg-secondary badge-sub me-1 mb-1" onclick="filterByMatrix(${i+1})">[${i+1}] ${sub}</span>`
            ).join('');
            document.getElementById('subcat-badges').innerHTML = html;
        }
    }

    function runMatrix() {
        const val = document.getElementById('matrixInput').value.trim();
        const index = parseInt(val);
        if (index && index > 0) {
            filterByMatrix(index);
        } else {
            alert("Please enter a valid number");
        }
    }

    function filterByMatrix(index) {
        if (!currentTypeConfig || !currentTypeConfig.subcategories) return;
        const subName = currentTypeConfig.subcategories[index - 1];
        if (!subName) { alert("Code not found."); return; }

        const filtered = allPosts.filter(p => {
            if (!p.labels) return false;
            return p.labels.some(l => l.toLowerCase() === subName.toLowerCase());
        });

        renderPosts(filtered);
        
        const badges = document.querySelectorAll('.badge-sub');
        badges.forEach(b => { b.classList.remove('bg-primary'); b.classList.add('bg-secondary'); });
        if(badges[index-1]) { badges[index-1].classList.remove('bg-secondary'); badges[index-1].classList.add('bg-primary'); }

        document.getElementById('app-subtitle').innerHTML = `Filtering: <strong>${subName}</strong> <a href="#" onclick="resetFilter(); return false;" class="text-white small">(Reset)</a>`;
    }
    
    function resetFilter() {
        renderPosts(allPosts);
        document.getElementById('app-subtitle').innerText = siteConfig.type;
        document.querySelectorAll('.badge-sub').forEach(b => { b.classList.remove('bg-primary'); b.classList.add('bg-secondary'); });
    }

    function renderPosts(posts) {
        const grid = document.getElementById('content-area');
        if (!posts || posts.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center p-5"><h3>No results.</h3><p class="text-muted">Ensure posts have Labels matching: ' + (currentTypeConfig ? currentTypeConfig.subcategories.join(', ') : '') + '</p></div>';
            return;
        }

        grid.innerHTML = posts.map(p => `
            <div class="col-md-4 col-sm-6">
                <div class="post-card">
                    <img src="${p.image}" class="post-img" alt="${p.title}">
                    <div class="post-body">
                        <h5 class="card-title">${p.title}</h5>
                        <p class="card-text small text-muted">${p.excerpt}</p>
                        <div class="mt-2">
                           ${p.labels.map(l => `<span class="badge bg-light text-dark border me-1">${l}</span>`).join('')}
                        </div>
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
        script.onerror = () => { console.error("JSONP Error"); delete window[callbackName]; callback(null); };
        document.body.appendChild(script);
    }
  //]]>
  </script>
</body>
</html>
ENDOFFILE

# ==========================================
# 2. BUILDER DASHBOARD (Admin Panel)
# ==========================================
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
        <p class="text-muted">Configure and Download your Theme</p>
      </div>
      
      <form id="builderForm">
        <!-- Identity -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Website Title</label>
            <input type="text" class="form-control" id="siteTitle" value="My New Website">
          </div>
          <div class="col-md-6">
            <label class="form-label">Primary Color</label>
            <input type="color" class="form-control form-control-color w-100" id="siteColor" value="#0d6efd">
          </div>
        </div>

        <!-- Category -->
        <div class="mb-3">
          <label class="form-label">Select Category</label>
          <select class="form-select" id="websiteType" onchange="updatePreview()">
            <option value="" disabled selected>Loading...</option>
          </select>
        </div>
        
        <div class="mb-4 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="featMatrix" checked>
            <label class="form-check-label" for="featMatrix">Enable Matrix Navigation</label>
        </div>

        <!-- Actions -->
        <div class="d-grid gap-2">
          <button type="button" class="btn btn-success btn-lg" onclick="saveConfig()">
            💾 Save Settings
          </button>
          <button type="button" class="btn btn-dark btn-lg" onclick="downloadTheme()">
            📥 Download Blogger Theme
          </button>
        </div>
        <div id="status" class="mt-3 text-center"></div>
      </form>
    </div>

    <script>
      let allTypes = [];

      // Load categories
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
        
        // Load saved config
        google.script.run.withSuccessHandler(config => {
           if(config.title) document.getElementById('siteTitle').value = config.title;
           if(config.color) document.getElementById('siteColor').value = config.color;
           if(config.type) {
              select.value = config.type;
              updatePreview();
           }
        }).getSavedConfig();
        
      }).getWebsiteTypes();

      function updatePreview() {
        const typeName = document.getElementById('websiteType').value;
        const config = allTypes.find(t => t.name === typeName);
        if(config) document.getElementById('siteColor').value = config.color || '#000000';
      }

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
        btn.innerText = "Generating XML...";
        
        // Pass current UI values directly to generator so download works even without saving
        const config = {
          type: document.getElementById('websiteType').value || "Home Improvement",
          title: document.getElementById('siteTitle').value || "My Site",
          color: document.getElementById('siteColor').value || "#333",
          featMatrix: document.getElementById('featMatrix').checked.toString()
        };

        google.script.run.withSuccessHandler(xmlContent => {
           downloadFile("theme-" + config.type.replace(/\s+/g, '-').toLowerCase() + ".xml", xmlContent);
           btn.disabled = false;
           btn.innerText = "📥 Download Blogger Theme";
        }).generateThemeXml(config);
      }

      function downloadFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    </script>
  </body>
</html>
ENDOFFILE

# ==========================================
# 3. APPS SCRIPT BACKEND (Code.gs)
# ==========================================
cat > core/apps-script/Code.gs <<'ENDOFFILE'
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA'; 
const SETTINGS_SHEET = 'Settings';
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&max-results=50';

function doGet(e) {
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutputFromFile('Builder')
      .setTitle('Website Builder Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  // JSONP API Logic
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

// --- THEME GENERATOR ---
function generateThemeXml(uiConfig) {
  // 1. Read the raw template file
  let xml = HtmlService.createHtmlOutputFromFile('ThemeTemplate').getContent();
  
  // 2. Get current Web App URL dynamically
  const url = ScriptApp.getService().getUrl();
  
  // 3. Replace placeholders
  xml = xml.replace('{{WEB_APP_URL}}', url);
  xml = xml.replace('{{SITE_TITLE}}', uiConfig.title);
  xml = xml.replace('{{SITE_TYPE}}', uiConfig.type);
  xml = xml.replace('{{SITE_COLOR}}', uiConfig.color);
  
  // 4. Handle Feature Logic
  const matrixClass = (uiConfig.featMatrix === 'true') ? '' : 'feature-hidden';
  xml = xml.replace('{{MATRIX_CLASS}}', matrixClass);

  return xml;
}

// --- DATABASE ---
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
echo "5. Open the Web App URL -> Customize -> Click 'Download Blogger Theme'."
echo "6. Upload that XML file to Blogger."