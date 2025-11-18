#!/bin/bash

echo "Multipurpose Website Builder Setup (CMS Edition)"
echo "================================================"
echo

# --- CLEANUP OPTION ---
read -p "⚠️  Do you want to delete all previous files and folders before starting? (y/n): " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo "🧹 Cleaning up..."
    rm -rf core website-types components templates docs
    rm -f website-types.json README.md LICENSE
    echo "✓ Cleanup complete."
else
    echo "Starting setup..."
fi

mkdir -p core/apps-script
mkdir -p core/blogger-theme
mkdir -p docs

# ==========================================
# 1. BUILDER DASHBOARD (The Admin Panel)
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
      body { background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .builder-container { max-width: 900px; margin: 40px auto; }
      .card { border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
      .card-header { background: white; border-bottom: 1px solid #eee; padding: 20px 30px; }
      .card-body { padding: 30px; }
      .preview-box { background: #fff; border: 2px dashed #ddd; border-radius: 8px; padding: 20px; margin-top: 10px; min-height: 100px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #888; transition: all 0.3s; }
      .preview-box.active { border-color: #0d6efd; background-color: #f8fbff; color: #0d6efd; }
      .form-label { font-weight: 600; color: #444; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
      .btn-publish { padding: 12px 30px; font-weight: 600; font-size: 1.1rem; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="builder-container">
      <div class="text-center mb-5">
        <h1 class="fw-bold display-5">🛠️ Website Builder</h1>
        <p class="lead text-muted">Configure your Blogger site instantly.</p>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="m-0">Configuration</h5>
          <span class="badge bg-success bg-opacity-10 text-success">v2.0 CMS</span>
        </div>
        <div class="card-body">
          <form id="builderForm">
            
            <!-- Site Identity -->
            <div class="row mb-4">
              <div class="col-md-6">
                <label class="form-label">Website Title</label>
                <input type="text" class="form-control form-control-lg" id="siteTitle" placeholder="e.g., Modern Living">
              </div>
              <div class="col-md-6">
                <label class="form-label">Primary Brand Color</label>
                <input type="color" class="form-control form-control-color w-100" id="siteColor" value="#2c3e50" style="height: 48px;">
              </div>
            </div>

            <!-- Website Type Selection -->
            <div class="mb-4">
              <label class="form-label">Select Website Category</label>
              <select class="form-select form-select-lg" id="websiteType" onchange="updatePreview()">
                <option value="" disabled selected>Choose a category...</option>
                <!-- Populated by JS -->
              </select>
              <div id="subcatPreview" class="preview-box mt-3">
                <small>Select a category above to see available subcategories</small>
              </div>
            </div>

            <!-- Matrix Code Info -->
            <div class="alert alert-info d-flex align-items-center" role="alert">
              <div style="font-size: 1.5rem; margin-right: 15px;">🔢</div>
              <div>
                <strong>Matrix Navigation Enabled</strong>
                <div class="small">Your visitors can type codes (e.g., <strong>1-2</strong>) to jump to specific subcategories instantly.</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-grid gap-2 mt-5">
              <button type="button" class="btn btn-primary btn-publish" onclick="saveConfig()">
                Publish Changes to Live Site
              </button>
            </div>
            <div id="status" class="mt-3 text-center"></div>

          </form>
        </div>
      </div>
    </div>

    <script>
      // Configuration Data
      const types = [
        { name: "Home Improvement", sub: ["DIY Projects", "Renovation Tips", "Interior Design", "Gardening"], color: "#e67e22" },
        { name: "Real Estate Investment", sub: ["Property Management", "Landlord Resources", "Market Analysis", "Rentals"], color: "#2c3e50" },
        { name: "Insurance", sub: ["Policy Comparisons", "Claims Advice", "Types", "Risk Management"], color: "#2980b9" },
        { name: "Self-Improvement", sub: ["Productivity", "Motivation", "Goals", "Personal Dev"], color: "#16a085" },
        { name: "Cryptocurrency", sub: ["Blockchain", "Trading", "News", "Strategies"], color: "#f39c12" },
        { name: "Hobbies and Crafts", sub: ["Tutorials", "Communities", "Supplies", "Projects"], color: "#d35400" },
        { name: "Events and Conferences", sub: ["Listings", "Planning", "Reviews", "Networking"], color: "#8e44ad" },
        { name: "Dance", sub: ["Studios", "Tutorials", "Competitions", "Techniques"], color: "#e84393" },
        { name: "Music", sub: ["Streaming", "Artists", "Theory", "Concerts"], color: "#0984e3" },
        { name: "Philosophy", sub: ["Discussions", "Ethics", "Books", "History"], color: "#6c5ce7" },
        { name: "Mythology", sub: ["Stories", "Culture", "Comparative", "Modern"], color: "#fdcb6e" },
        { name: "Survival Skills", sub: ["Guides", "Wilderness", "Emergency", "Camping"], color: "#d63031" },
        { name: "Fashion Design", sub: ["Portfolios", "Shows", "Trends", "Illustration"], color: "#e17055" },
        { name: "Culinary Arts", sub: ["Schools", "Competitions", "Chefs", "Photography"], color: "#f1c40f" },
        { name: "Film and Television", sub: ["Festivals", "Reviews", "Filmmaking", "Analysis"], color: "#2d3436" },
        { name: "Spirituality", sub: ["Meditation", "Holistic", "Practices", "Community"], color: "#00b894" },
        { name: "Digital Marketing", sub: ["SEO", "Social Media", "Content", "Email"], color: "#0984e3" },
        { name: "Women’s Interests", sub: ["Empowerment", "Leadership", "Health", "Fashion"], color: "#e84393" },
        { name: "Men’s Interests", sub: ["Grooming", "Fitness", "Fatherhood", "Fashion"], color: "#34495e" },
        { name: "Aging and Senior Care", sub: ["Elder Care", "Retirement", "Health", "Activities"], color: "#74b9ff" },
        { name: "Travel Hacking", sub: ["Deals", "Flyer Tips", "Budget", "Rewards"], color: "#00cec9" },
        { name: "Food and Beverage", sub: ["Reviews", "Blogging", "Specialty", "Pairings"], color: "#d63031" },
        { name: "Urban Exploration", sub: ["Abandoned", "Guides", "Photography", "History"], color: "#636e72" },
        { name: "Alternative Energy", sub: ["Solar/Wind", "Sustainable Living", "Reviews", "Policy"], color: "#f1c40f" },
        { name: "Sustainability", sub: ["Eco-Products", "Practices", "Green Living", "Activism"], color: "#27ae60" }
      ];

      // Initialize
      const select = document.getElementById('websiteType');
      types.forEach((t, index) => {
        const opt = document.createElement('option');
        opt.value = t.name;
        opt.text = `[${index + 1}] ${t.name}`;
        select.appendChild(opt);
      });

      // Update Preview
      function updatePreview() {
        const typeName = select.value;
        const config = types.find(t => t.name === typeName);
        const previewBox = document.getElementById('subcatPreview');
        
        if (config) {
          previewBox.innerHTML = `
            <strong style="color:${config.color}">${config.name}</strong>
            <div class="mt-2">
              ${config.sub.map((s, i) => `<span class="badge bg-secondary me-1 mb-1">[${i+1}] ${s}</span>`).join('')}
            </div>
          `;
          previewBox.classList.add('active');
          document.getElementById('siteColor').value = config.color;
        }
      }

      // Save to Google Sheets
      function saveConfig() {
        const btn = document.querySelector('.btn-publish');
        const status = document.getElementById('status');
        
        const config = {
          type: document.getElementById('websiteType').value,
          title: document.getElementById('siteTitle').value || "My Website",
          color: document.getElementById('siteColor').value
        };

        if (!config.type) {
          alert("Please select a website type first.");
          return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Publishing...';
        status.innerHTML = '';

        google.script.run
          .withSuccessHandler(function() {
             status.innerHTML = '<div class="alert alert-success">✅ <strong>Success!</strong> Your Blogger site has been updated. Refresh it to see changes.</div>';
             btn.innerText = "Published Successfully";
             btn.classList.remove('btn-primary');
             btn.classList.add('btn-success');
             setTimeout(() => { btn.disabled = false; btn.innerText = "Publish Changes to Live Site"; btn.classList.add('btn-primary'); btn.classList.remove('btn-success'); }, 3000);
          })
          .withFailureHandler(function(err) {
             status.innerHTML = '<div class="alert alert-danger">❌ Error: ' + err + '</div>';
             btn.disabled = false;
             btn.innerText = "Try Again";
          })
          .saveConfigToSheet(config);
      }
    </script>
  </body>
</html>
ENDOFFILE

# ==========================================
# 2. APPS SCRIPT BACKEND (Code.gs)
# ==========================================
cat > core/apps-script/Code.gs <<'ENDOFFILE'
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
    #app-header { padding: 80px 0 40px; color: white; text-align: center; margin-bottom: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .matrix-bar { max-width: 400px; margin: -25px auto 30px; background: white; padding: 10px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; }
    .matrix-input { border: none; outline: none; flex-grow: 1; padding: 5px 15px; font-size: 1.1rem; }
    .matrix-btn { border-radius: 50px; padding: 8px 25px; }
    .post-card { background: white; border: none; border-radius: 12px; overflow: hidden; transition: transform 0.3s; height: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .post-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .post-img { height: 200px; width: 100%; object-fit: cover; }
    .post-body { padding: 20px; }
    .loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: white; z-index: 9999; display: flex; justify-content: center; align-items: center; flex-direction: column; }
  ]]></b:skin>
</head>
<body>

  <!-- Loader -->
  <div id="siteLoader" class="loader-overlay">
    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
    <p class="mt-3 text-muted">Building your site...</p>
  </div>

  <!-- Header (Dynamic Color) -->
  <header id="app-header" style="background-color: #333;">
    <div class="container">
      <h1 class="display-4 fw-bold" id="app-title">Loading...</h1>
      <p class="lead opacity-75" id="app-subtitle">...</p>
    </div>
  </header>

  <!-- Matrix Navigation -->
  <div class="container">
    <div class="matrix-bar">
      <span class="ms-2 text-muted"><i class="bi bi-grid-3x3-gap-fill"></i></span>
      <input type="text" id="matrixInput" class="matrix-input" placeholder="Matrix Code (e.g. 1-2)" />
      <button class="btn btn-primary matrix-btn" id="matrixBtn" onclick="runMatrix()">Go</button>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="container mb-5">
    <div id="content-area" class="row g-4">
      <!-- Posts injected here -->
    </div>
  </div>

  <!-- Required Blogger Widget (Hidden) -->
  <b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
    <b:widget id='HTML1' locked='true' title='App' type='HTML' version='1'>
      <b:widget-settings><b:widget-setting name='content'/></b:widget-settings>
      <b:includable id='main'></b:includable>
    </b:widget>
  </b:section>

  <script>
  //<![CDATA[
    // ** IMPORTANT: PASTE YOUR NEW WEB APP URL HERE **
    const API_URL = 'https://script.google.com/macros/s/AKfycbxBOuXmYcOpeijxpBMwEV5clzoUg1zYG6hwQ93AFj5FRjXE3rHPR5fdauhInRh4uB00BA/exec';

    let siteConfig = {};

    document.addEventListener('DOMContentLoaded', () => {
        // 1. Fetch Configuration
        fetchJsonp(API_URL + '?action=getConfig', (config) => {
            siteConfig = config;
            applyTheme(config);
            // 2. Fetch Content
            fetchJsonp(API_URL + '?action=getData&type=' + encodeURIComponent(config.type), renderPosts);
        });

        // Matrix Input Enter Key
        document.getElementById('matrixInput').addEventListener('keypress', (e) => {
            if(e.key === 'Enter') runMatrix();
        });
    });

    function applyTheme(config) {
        document.getElementById('app-title').innerText = config.title;
        document.getElementById('app-subtitle').innerText = config.type;
        document.getElementById('app-header').style.backgroundColor = config.color;
        document.getElementById('matrixBtn').style.backgroundColor = config.color;
        document.getElementById('matrixBtn').style.borderColor = config.color;
        document.title = config.title;
    }

    function renderPosts(posts) {
        const grid = document.getElementById('content-area');
        document.getElementById('siteLoader').style.display = 'none'; // Hide loader
        
        if (!posts || posts.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center p-5"><h3>No posts found.</h3><p class="text-muted">Add posts to your Blogger backend.</p></div>';
            return;
        }

        grid.innerHTML = posts.map(p => `
            <div class="col-md-4 col-sm-6">
                <div class="post-card">
                    <img src="${p.image}" class="post-img" alt="${p.title}">
                    <div class="post-body">
                        <h5 class="card-title">${p.title}</h5>
                        <p class="card-text small text-muted">${p.excerpt}</p>
                        <button class="btn btn-sm btn-outline-secondary mt-2">Read More</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function runMatrix() {
        const code = document.getElementById('matrixInput').value;
        alert("Matrix Code " + code + " triggered! (Add specific logic here)");
    }

    // Simple JSONP implementation
    function fetchJsonp(url, callback) {
        const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(data);
        };
        const script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        document.body.appendChild(script);
    }
  //]]>
  </script>
</body>
</html>
ENDOFFILE

echo
echo "=========================================="
echo "Setup Complete! Follow these steps:"
echo "=========================================="
echo "1. Push these files to GitHub."
echo "2. Go to Apps Script, create 'Builder.html' and paste content from core/apps-script/Builder.html"
echo "3. Paste content from core/apps-script/Code.gs into Code.gs"
echo "4. Deploy as Web App (Me / Anyone)."
echo "5. OPEN THE WEB APP URL -> You will see the Builder. Select a type and click PUBLISH."
echo "6. Update theme.xml with the Web App URL and save to Blogger."