#!/bin/bash

echo "Multipurpose Website Builder Setup"
echo "=================================="
echo

# --- CLEANUP OPTION ---
read -p "⚠️  Do you want to delete all previous files and folders before starting? (y/n): " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo
    echo "🧹 Cleaning up previous files..."
    rm -rf core website-types components templates docs
    rm -f website-types.json README.md LICENSE
    echo "✓ Cleanup complete."
    echo
else
    echo
    echo "Start setup..."
    echo
fi
# --- END CLEANUP OPTION ---

echo "Creating Multipurpose Website Builder structure..."
mkdir -p core/apps-script
mkdir -p core/blogger-theme/assets
mkdir -p core/css
mkdir -p core/js
mkdir -p website-types
mkdir -p docs

echo "Creating root files..."

# Create website-types.json
cat > website-types.json <<'ENDOFFILE'
{
  "website_types": [
    { "name": "Home Improvement", "subcategories": ["DIY Projects", "Renovation Tips", "Interior Design Ideas", "Gardening"], "icon": "tools", "color": "#e67e22", "features": ["posts", "gallery"] },
    { "name": "Real Estate Investment", "subcategories": ["Property Management", "Landlord Resources", "Market Analysis", "Rental Listings"], "icon": "building", "color": "#2c3e50", "features": ["listings", "map"] },
    { "name": "Insurance", "subcategories": ["Policy Comparisons", "Claims Advice", "Insurance Types", "Risk Management"], "icon": "shield-check", "color": "#2980b9", "features": ["forms", "posts"] },
    { "name": "Self-Improvement", "subcategories": ["Personal Development Blogs", "Productivity Tools", "Goal Setting Resources", "Motivational Content"], "icon": "person-bounding-box", "color": "#16a085", "features": ["posts", "newsletter"] },
    { "name": "Cryptocurrency", "subcategories": ["Blockchain Technology", "Trading Platforms", "Cryptocurrency News", "Investment Strategies"], "icon": "currency-bitcoin", "color": "#f39c12", "features": ["charts", "posts"] },
    { "name": "Hobbies and Crafts", "subcategories": ["Crafting Tutorials", "Hobbyist Communities", "Supplies and Materials", "Project Ideas"], "icon": "scissors", "color": "#d35400", "features": ["gallery", "tutorials"] },
    { "name": "Events and Conferences", "subcategories": ["Event Listings", "Event Planning Resources", "Conference Reviews", "Networking Opportunities"], "icon": "calendar-event", "color": "#8e44ad", "features": ["calendar", "tickets"] },
    { "name": "Dance", "subcategories": ["Dance Studios", "Choreography Tutorials", "Dance Competitions", "Styles and Techniques"], "icon": "music-note-beamed", "color": "#e84393", "features": ["video", "classes"] },
    { "name": "Music", "subcategories": ["Music Streaming Services", "Artist Highlights", "Music Theory Resources", "Concert and Festival Information"], "icon": "music-note", "color": "#0984e3", "features": ["player", "playlist"] },
    { "name": "Philosophy", "subcategories": ["Philosophical Discussions", "Ethics Resources", "Book Recommendations", "Historical Philosophy"], "icon": "book", "color": "#6c5ce7", "features": ["posts", "forum"] },
    { "name": "Mythology", "subcategories": ["Mythological Stories", "Cultural Significance", "Comparative Mythology", "Modern Adaptations"], "icon": "lightning-charge", "color": "#fdcb6e", "features": ["stories", "wiki"] },
    { "name": "Survival Skills", "subcategories": ["Outdoor Survival Guides", "Wilderness Training", "Emergency Preparedness", "Camping Tips"], "icon": "fire", "color": "#d63031", "features": ["guides", "checklist"] },
    { "name": "Fashion Design", "subcategories": ["Design Portfolios", "Fashion Shows", "Trend Analysis", "Fashion Illustration Techniques"], "icon": "handbag", "color": "#e17055", "features": ["gallery", "lookbook"] },
    { "name": "Culinary Arts", "subcategories": ["Professional Cooking Schools", "Culinary Competitions", "Chef Profiles", "Food Photography"], "icon": "egg-fried", "color": "#f1c40f", "features": ["recipes", "menu"] },
    { "name": "Film and Television", "subcategories": ["Film Festivals", "TV Show Reviews", "Filmmaking Resources", "Genre Analyses"], "icon": "film", "color": "#2d3436", "features": ["reviews", "trailers"] },
    { "name": "Spirituality", "subcategories": ["Meditation Resources", "Holistic Living", "Spiritual Practices", "Community Support"], "icon": "flower1", "color": "#00b894", "features": ["meditation", "blog"] },
    { "name": "Digital Marketing", "subcategories": ["SEO Strategies", "Social Media Marketing", "Content Marketing", "Email Marketing Solutions"], "icon": "graph-up", "color": "#0984e3", "features": ["analytics", "services"] },
    { "name": "Women’s Interests", "subcategories": ["Empowerment Resources", "Women in Leadership", "Health and Wellness for Women", "Fashion and Lifestyle for Women"], "icon": "gender-female", "color": "#e84393", "features": ["community", "blog"] },
    { "name": "Men’s Interests", "subcategories": ["Grooming and Lifestyle", "Fitness for Men", "Fatherhood Resources", "Men's Fashion Trends"], "icon": "gender-male", "color": "#34495e", "features": ["lifestyle", "blog"] },
    { "name": "Aging and Senior Care", "subcategories": ["Elder Care Resources", "Retirement Planning", "Health and Wellness for Seniors", "Activities for Seniors"], "icon": "heart-pulse", "color": "#74b9ff", "features": ["resources", "care"] },
    { "name": "Travel Hacking", "subcategories": ["Travel Deals", "Frequent Flyer Tips", "Budget Travel Strategies", "Travel Rewards Programs"], "icon": "airplane", "color": "#00cec9", "features": ["deals", "guides"] },
    { "name": "Food and Beverage", "subcategories": ["Brewery and Winery Reviews", "Food Blogging", "Specialty Foods", "Beverage Pairings"], "icon": "cup-straw", "color": "#d63031", "features": ["reviews", "menu"] },
    { "name": "Urban Exploration", "subcategories": ["Abandoned Places", "City Guides", "Photography from Urban Settings", "History of Urban Spaces"], "icon": "building", "color": "#636e72", "features": ["map", "gallery"] },
    { "name": "Alternative Energy", "subcategories": ["Solar and Wind Energy Resources", "Sustainable Living Tips", "Reviews on Renewable Technologies", "Policy and Advocacy"], "icon": "sun", "color": "#f1c40f", "features": ["tech", "news"] },
    { "name": "Sustainability", "subcategories": ["Eco-Friendly Products", "Sustainable Practices", "Green Living Resources", "Environmental Activism"], "icon": "tree", "color": "#27ae60" }
    ]
}
ENDOFFILE

echo "Creating core files..."

# 1. CREATE THE BUILDER HTML (The Dashboard)
cat > core/apps-script/Builder.html <<'ENDOFFILE'
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { background-color: #f8f9fa; }
      .builder-card { max-width: 800px; margin: 50px auto; padding: 30px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
      .icon-preview { font-size: 2rem; color: #6c757d; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="builder-card">
        <h2 class="text-center mb-4">🏗️ Website Builder</h2>
        <p class="text-center text-muted mb-4">Select a category to transform your Blogger site instantly.</p>
        
        <form id="builderForm">
          <div class="mb-4">
            <label class="form-label fw-bold">1. Select Website Type</label>
            <select class="form-select form-select-lg" id="websiteType" onchange="updatePreview()">
              <option value="" disabled selected>Choose a category...</option>
              <!-- Options populated by JS -->
            </select>
          </div>

          <div class="mb-4">
             <label class="form-label fw-bold">2. Subcategories Available</label>
             <div id="subcatPreview" class="p-3 bg-light rounded text-muted">Select a type above...</div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">3. Customization</label>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Site Title</label>
                <input type="text" class="form-control" id="siteTitle" placeholder="My Awesome Site">
              </div>
              <div class="col-md-6">
                <label class="form-label">Primary Color</label>
                <input type="color" class="form-control form-control-color w-100" id="siteColor" value="#0d6efd" title="Choose your color">
              </div>
            </div>
          </div>

          <div class="d-grid gap-2">
            <button type="button" class="btn btn-primary btn-lg" onclick="saveConfig()">
              🚀 Publish Website
            </button>
          </div>
          <div id="status" class="mt-3 text-center"></div>
        </form>
      </div>
    </div>

    <script>
      // Categories Config (Should match website-types.json)
      const types = [
        { name: "Home Improvement", sub: ["DIY Projects", "Renovation"], color: "#e67e22" },
        { name: "Real Estate Investment", sub: ["Property Management", "Rentals"], color: "#2c3e50" },
        { name: "Insurance", sub: ["Policy Comparisons", "Claims"], color: "#2980b9" },
        { name: "Self-Improvement", sub: ["Productivity", "Motivation"], color: "#16a085" },
        { name: "Cryptocurrency", sub: ["Blockchain", "Trading"], color: "#f39c12" },
        { name: "Hobbies and Crafts", sub: ["Tutorials", "Supplies"], color: "#d35400" },
        { name: "Events and Conferences", sub: ["Listings", "Planning"], color: "#8e44ad" },
        { name: "Dance", sub: ["Studios", "Tutorials"], color: "#e84393" },
        { name: "Music", sub: ["Streaming", "Artists"], color: "#0984e3" },
        { name: "Philosophy", sub: ["Ethics", "Discussions"], color: "#6c5ce7" },
        { name: "Mythology", sub: ["Stories", "Culture"], color: "#fdcb6e" },
        { name: "Survival Skills", sub: ["Guides", "Gear"], color: "#d63031" },
        { name: "Fashion Design", sub: ["Portfolios", "Trends"], color: "#e17055" },
        { name: "Culinary Arts", sub: ["Recipes", "Chefs"], color: "#f1c40f" },
        { name: "Film and Television", sub: ["Reviews", "Filmmaking"], color: "#2d3436" },
        { name: "Spirituality", sub: ["Meditation", "Yoga"], color: "#00b894" },
        { name: "Digital Marketing", sub: ["SEO", "Social Media"], color: "#0984e3" },
        { name: "Women’s Interests", sub: ["Health", "Lifestyle"], color: "#e84393" },
        { name: "Men’s Interests", sub: ["Fitness", "Grooming"], color: "#34495e" },
        { name: "Aging and Senior Care", sub: ["Health", "Retirement"], color: "#74b9ff" },
        { name: "Travel Hacking", sub: ["Deals", "Tips"], color: "#00cec9" },
        { name: "Food and Beverage", sub: ["Reviews", "Specialty"], color: "#d63031" },
        { name: "Urban Exploration", sub: ["Abandoned", "City Guides"], color: "#636e72" },
        { name: "Alternative Energy", sub: ["Solar", "Wind"], color: "#f1c40f" },
        { "name": "Sustainability", "subcategories": ["Eco-Friendly Products", "Sustainable Practices"], "color": "#27ae60" }
      ];

      // Populate Dropdown
      const select = document.getElementById('websiteType');
      types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.name;
        opt.textContent = t.name;
        select.appendChild(opt);
      });

      function updatePreview() {
        const typeName = select.value;
        const config = types.find(t => t.name === typeName);
        if (config) {
          document.getElementById('subcatPreview').innerText = config.sub ? config.sub.join(', ') : "Generic";
          document.getElementById('siteColor').value = config.color;
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

        if(!config.type) { alert("Please select a website type"); btn.disabled=false; return; }

        google.script.run.withSuccessHandler(function(res) {
           document.getElementById('status').innerHTML = '<div class="alert alert-success">✅ Website Updated! Refresh your blog to see changes.</div>';
           btn.innerText = "Published";
           btn.disabled = false;
        }).withFailureHandler(function(err) {
           document.getElementById('status').innerHTML = '<div class="alert alert-danger">Error: ' + err + '</div>';
           btn.disabled = false;
        }).saveConfig(config);
      }
    </script>
  </body>
</html>
ENDOFFILE

# 2. CREATE BACKEND (Code.gs)
cat > core/apps-script/Code.gs <<'ENDOFFILE'
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
ENDOFFILE

# 3. CREATE THEME (theme.xml)
# This theme simply fetches the config and renders itself.
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
    body { background-color: #f5f5f5; font-family: sans-serif; } 
    .site-header { padding: 60px 0; text-align: center; color: white; margin-bottom: 30px; }
    .post-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .post-card img { width: 100%; height: 200px; object-fit: cover; }
    .post-card-body { padding: 20px; }
  ]]></b:skin>
</head>
<body>
  
  <div id="app">
    <!-- Header -->
    <header id="dynamicHeader" class="site-header" style="background-color: #333;">
      <div class="container">
        <h1 id="siteTitle">Loading Website...</h1>
        <p id="siteType" class="badge bg-light text-dark">Please wait</p>
      </div>
    </header>

    <!-- Matrix Code Input (For user quick nav) -->
    <div class="container mb-4">
        <div class="input-group" style="max-width: 300px; margin: 0 auto;">
            <span class="input-group-text">#</span>
            <input type="text" id="matrixInput" class="form-control" placeholder="Enter code (e.g. 12)" />
            <button class="btn btn-dark" onclick="handleMatrix()">Go</button>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="container">
      <div id="contentGrid" class="row">
         <div class="col-12 text-center p-5">
           <div class="spinner-border text-secondary" role="status"></div>
         </div>
      </div>
    </div>
  </div>

  <!-- Required Widget -->
  <b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
    <b:widget id='HTML1' locked='true' title='App' type='HTML' version='1'>
      <b:widget-settings><b:widget-setting name='content'/></b:widget-settings>
      <b:includable id='main'></b:includable>
    </b:widget>
  </b:section>

  <script>
  //<![CDATA[
    // ** UPDATE THIS URL AFTER DEPLOYING **
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxBOuXmYcOpeijxpBMwEV5clzoUg1zYG6hwQ93AFj5FRjXE3rHPR5fdauhInRh4uB00BA/exec';
    
    document.addEventListener('DOMContentLoaded', () => {
       loadSiteConfig();
    });

    function loadSiteConfig() {
       const script = document.createElement('script');
       script.src = WEB_APP_URL + '?action=getConfig&callback=applyConfig';
       document.body.appendChild(script);
    }

    function applyConfig(config) {
       if(config.title) document.getElementById('siteTitle').textContent = config.title;
       if(config.type) document.getElementById('siteType').textContent = config.type;
       if(config.color) document.getElementById('dynamicHeader').style.backgroundColor = config.color;
       
       // Now load content based on type
       loadContent(config.type);
    }

    function loadContent(type) {
       const script = document.createElement('script');
       script.src = WEB_APP_URL + '?action=getData&type=' + encodeURIComponent(type) + '&callback=renderContent';
       document.body.appendChild(script);
    }

    function renderContent(posts) {
       const grid = document.getElementById('contentGrid');
       if(!posts || posts.length === 0) {
           grid.innerHTML = '<div class="col-12 text-center text-muted">No posts found for this category.</div>';
           return;
       }
       
       let html = '';
       posts.forEach(post => {
           html += `
             <div class="col-md-4">
               <div class="post-card">
                 <img src="${post.imageUrl}" alt="${post.title}">
                 <div class="post-card-body">
                   <h5>${post.title}</h5>
                   <p class="small text-muted">${post.date}</p>
                   <p>${post.excerpt}</p>
                   <button class="btn btn-sm btn-outline-dark">Read More</button>
                 </div>
               </div>
             </div>
           `;
       });
       grid.innerHTML = html;
    }

    function handleMatrix() {
        const code = document.getElementById('matrixInput').value;
        if(code === '12') alert("Navigating to Matrix Shortcut 12...");
        // Implement full matrix logic here if needed
    }
  //]]>
  </script>
</body>
</html>
ENDOFFILE

echo
echo "========================================"
echo "Builder Architecture Created!"
echo "========================================"
echo "1. Push to GitHub."
echo "2. Open core/apps-script/Code.gs in Google Apps Script."
echo "3. Create a file named 'Builder.html' in Apps Script and paste content from core/apps-script/Builder.html"
echo "4. Deploy as Web App (Anyone)."
echo "5. Open the Web App URL to see the BUILDER."
echo "6. Update theme.xml with the Web App URL and save to Blogger."