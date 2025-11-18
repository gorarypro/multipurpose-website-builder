#!/bin/bash

echo "Multipurpose Website Builder Setup (Unified Edition)"
echo "=================================================="
echo

# --- CLEANUP ---
rm -rf core website-types components templates docs
rm -f website-types.json README.md LICENSE

# --- DIRECTORIES ---
mkdir -p core/apps-script
mkdir -p core/blogger-theme

# ==========================================
# 1. BUILDER DASHBOARD (Admin Panel)
# ==========================================
cat > core/apps-script/Builder.html <<'ENDOFFILE'
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Website Builder Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { background-color: #f0f2f5; font-family: sans-serif; padding: 20px; }
      .card { border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
      .preview-box { background: #fff; border: 2px dashed #ddd; border-radius: 8px; padding: 15px; margin-top: 10px; min-height: 60px; }
    </style>
  </head>
  <body>
    <div class="card p-4">
      <h2 class="text-center mb-4">🛠️ Website Builder Admin</h2>
      
      <form id="builderForm">
        <!-- 1. Identity -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Website Title</label>
            <input type="text" class="form-control" id="siteTitle" placeholder="My Awesome Site">
          </div>
          <div class="col-md-6">
            <label class="form-label">Primary Color</label>
            <input type="color" class="form-control form-control-color w-100" id="siteColor" value="#0d6efd">
          </div>
        </div>

        <!-- 2. Category -->
        <div class="mb-3">
          <label class="form-label">Select Website Category</label>
          <select class="form-select" id="websiteType" onchange="updatePreview()">
            <option value="" disabled selected>Loading categories...</option>
          </select>
          <div id="subcatPreview" class="preview-box text-muted text-center small mt-2">
            Select a category to see Matrix codes...
          </div>
        </div>

        <!-- 3. Publish -->
        <div class="d-grid">
          <button type="button" class="btn btn-primary btn-lg" onclick="saveConfig()">
            Publish Changes
          </button>
        </div>
        <div id="status" class="mt-3 text-center"></div>
      </form>
    </div>

    <script>
      // Fetch categories from Code.gs on load
      google.script.run.withSuccessHandler(populateTypes).getWebsiteTypes();

      let allTypes = [];

      function populateTypes(data) {
        allTypes = data.website_types;
        const select = document.getElementById('websiteType');
        select.innerHTML = '<option value="" disabled selected>Choose a category...</option>';
        
        allTypes.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.name;
          opt.textContent = t.name;
          select.appendChild(opt);
        });
      }

      function updatePreview() {
        const typeName = document.getElementById('websiteType').value;
        const config = allTypes.find(t => t.name === typeName);
        if (config) {
          document.getElementById('subcatPreview').innerHTML = config.subcategories.map((sub, i) => 
            `<span class="badge bg-secondary me-1">[${i+1}] ${sub}</span>`
          ).join(' ');
          document.getElementById('siteColor').value = config.color || '#000000';
        }
      }

      function saveConfig() {
        const btn = document.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Publishing...";
        
        const config = {
          type: document.getElementById('websiteType').value,
          title: document.getElementById('siteTitle').value,
          color: document.getElementById('siteColor').value
        };

        if(!config.type) { alert("Select a category"); btn.disabled=false; return; }

        google.script.run.withSuccessHandler(() => {
           document.getElementById('status').innerHTML = '<div class="alert alert-success">✅ Saved! Refresh your Blogger site.</div>';
           btn.disabled = false; 
           btn.innerText = "Publish Changes";
        }).saveConfigToSheet(config);
      }
    </script>
  </body>
</html>
ENDOFFILE

# ==========================================
# 2. APPS SCRIPT BACKEND (Code.gs)
# ==========================================
cat > core/apps-script/Code.gs <<'ENDOFFILE'
// CONFIGURATION
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA'; // <-- YOUR SHEET ID
const SETTINGS_SHEET = 'Settings';
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
      // Wrap in the expected structure "website_types"
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
 * This is the source of truth for the Builder AND the Theme Matrix Logic
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
      // Add more here...
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
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SETTINGS_SHEET);
    if (!sheet) return { type: "Home Improvement", title: "Default Site", color: "#333" };
    
    const data = sheet.getDataRange().getValues();
    const config = {};
    for (let i = 1; i < data.length; i++) config[data[i][0]] = data[i][1];
    return config;
  } catch (e) {
    return { type: "Home Improvement", title: "Error Loading Config", color: "#e74c3c" };
  }
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
ENDOFFILE

# ==========================================
# 3. BLOGGER THEME (theme.xml)
# ==========================================
cat > core/blogger-theme/theme.xml <<'ENDOFFILE'
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:responsive='true' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1.0' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'/>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css' rel='stylesheet'/>
  <b:skin><![CDATA[ 
    body { background-color: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
    #app-header { padding: 60px 0 40px; color: white; text-align: center; margin-bottom: 40px; transition: background 0.3s; }
    .matrix-container { max-width: 400px; margin: -30px auto 30px; }
    .matrix-input-group { background: white; padding: 8px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; }
    .matrix-input { border: none; outline: none; flex-grow: 1; padding: 5px 15px; font-size: 1.1rem; }
    .btn-go { border-radius: 50px; padding: 8px 25px; background: #333; color: white; border: none; }
    .post-card { background: white; border-radius: 12px; overflow: hidden; height: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .post-card:hover { transform: translateY(-5px); }
    .post-img { height: 200px; width: 100%; object-fit: cover; }
    .post-body { padding: 20px; }
    .badge-sub { cursor: pointer; transition: 0.2s; }
    .badge-sub:hover { opacity: 0.8; }
    .loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: white; z-index: 9999; display: flex; justify-content: center; align-items: center; flex-direction: column; }
  ]]></b:skin>
</head>
<body>

  <!-- Loader -->
  <div id="siteLoader" class="loader-overlay">
    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
    <p class="mt-3 text-muted">Building your site...</p>
  </div>

  <!-- Header -->
  <header id="app-header" style="background-color: #333;">
    <div class="container">
      <h1 class="display-4 fw-bold" id="app-title">...</h1>
      <p class="lead opacity-75" id="app-subtitle">...</p>
    </div>
  </header>

  <!-- Matrix Navigation -->
  <div class="container matrix-container">
    <div class="matrix-input-group">
      <span class="ms-2 align-self-center text-muted"><i class="bi bi-grid-3x3-gap-fill"></i></span>
      <!-- FIX: Self-closing input -->
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
    // ** IMPORTANT: PASTE YOUR NEW WEB APP URL HERE **
    const API_URL = 'https://script.google.com/macros/s/AKfycbxBOuXmYcOpeijxpBMwEV5clzoUg1zYG6hwQ93AFj5FRjXE3rHPR5fdauhInRh4uB00BA/exec';

    let siteConfig = {};
    let allTypes = [];
    let allPosts = [];
    let currentTypeConfig = null;

    document.addEventListener('DOMContentLoaded', () => {
        
        // 1. Load everything in parallel
        const p1 = new Promise(r => fetchJsonp(API_URL + '?action=getConfig', r));
        const p2 = new Promise(r => fetchJsonp(API_URL + '?action=getWebsiteTypes', r));
        const p3 = new Promise(r => fetchJsonp(API_URL + '?action=getData', r));

        Promise.all([p1, p2, p3]).then(([configData, typesData, postsData]) => {
            
            // Store data
            siteConfig = configData;
            allTypes = typesData.website_types || [];
            allPosts = postsData || [];

            // Determine Current Type (from Config)
            const typeName = siteConfig.type || "Home Improvement";
            currentTypeConfig = allTypes.find(t => t.name === typeName);

            // Apply Theme
            applyTheme();
            
            // Initial Render (Show all posts matching main category logic if needed, or just all)
            // For simplicity, we show all posts initially
            renderPosts(allPosts);

            document.getElementById('siteLoader').style.display = 'none';
        });

        // Input Enter Key
        const input = document.getElementById('matrixInput');
        if(input) input.addEventListener('keypress', (e) => { if(e.key === 'Enter') runMatrix(); });
    });

    function applyTheme() {
        document.getElementById('app-title').innerText = siteConfig.title;
        document.getElementById('app-subtitle').innerText = siteConfig.type;
        
        const color = siteConfig.color || '#333';
        document.getElementById('app-header').style.backgroundColor = color;
        document.getElementById('matrixBtn').style.backgroundColor = color;
        
        // Render Subcategory Badges with Matrix Numbers
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
            alert("Please enter a valid number (e.g., 1, 2, 3)");
        }
    }

    function filterByMatrix(index) {
        if (!currentTypeConfig || !currentTypeConfig.subcategories) return;
        
        // Array is 0-indexed, Matrix is 1-indexed
        const subName = currentTypeConfig.subcategories[index - 1];
        
        if (!subName) {
            alert("Code " + index + " not found for this category.");
            return;
        }

        // Filter Logic
        const filtered = allPosts.filter(p => {
            if (!p.labels) return false;
            // Check if post labels include the subcategory name (case insensitive)
            return p.labels.some(l => l.toLowerCase() === subName.toLowerCase());
        });

        // Update UI
        renderPosts(filtered);
        
        // Highlight Badge
        const badges = document.querySelectorAll('.badge-sub');
        badges.forEach(b => {
            b.classList.remove('bg-primary');
            b.classList.add('bg-secondary');
        });
        if(badges[index-1]) {
             badges[index-1].classList.remove('bg-secondary');
             badges[index-1].classList.add('bg-primary');
        }

        // Show alert toast/message
        const subtitle = document.getElementById('app-subtitle');
        subtitle.innerHTML = `Filtering: <strong>${subName}</strong> <a href="#" onclick="resetFilter(); return false;" class="text-white small">(Reset)</a>`;
    }
    
    function resetFilter() {
        renderPosts(allPosts);
        document.getElementById('app-subtitle').innerText = siteConfig.type;
        document.querySelectorAll('.badge-sub').forEach(b => {
             b.classList.remove('bg-primary'); 
             b.classList.add('bg-secondary'); 
        });
    }

    function renderPosts(posts) {
        const grid = document.getElementById('content-area');
        if (!posts || posts.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center p-5"><h3>No results.</h3><p class="text-muted">Ensure your Blogger posts have the correct Labels.</p></div>';
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

    // JSONP Fetcher
    function fetchJsonp(url, callback) {
        const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(data);
        };
        const script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        script.onerror = () => { console.error("JSONP Error"); delete window[callbackName]; };
        document.body.appendChild(script);
    }
  //]]>
  </script>
</body>
</html>
ENDOFFILE

echo
echo "======================================================="
echo "Setup Complete! (Unified Builder + Matrix Navigation)"
echo "======================================================="