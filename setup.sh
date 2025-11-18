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
echo

# Create main directories
mkdir -p core/apps-script
mkdir -p core/blogger-theme/assets
mkdir -p core/css
mkdir -p core/js
mkdir -p website-types/business
mkdir -p website-types/ecommerce
mkdir -p website-types/portfolio
mkdir -p website-types/blog
mkdir -p components/navigation
mkdir -p components/hero
mkdir -p components/gallery
mkdir -p components/forms
mkdir -p components/footer
mkdir -p templates/business-corporate
mkdir -p templates/ecommerce-store
mkdir -p templates/portfolio-creative
mkdir -p templates/blog-personal
mkdir -p docs

echo "Creating root files..."

# Create website-types.json with ALL categories
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
    { "name": "Sustainability", "subcategories": ["Eco-Friendly Products", "Sustainable Practices", "Green Living Resources", "Environmental Activism"], "icon": "tree", "color": "#27ae60", "features": ["shop", "blog"] }
  ]
}
ENDOFFILE

# Create README.md
cat > README.md <<'ENDOFFILE'
# Multipurpose Website Builder

## Quick Start
1. Set up Google Apps Script backend (Copy code from core/apps-script/Code.gs)
2. Apply theme to Blogger (Copy code from core/blogger-theme/theme.xml)
3. Configure your website type using the dropdown in the dashboard
4. Add content to Blogger

## License
MIT License
ENDOFFILE

# Create LICENSE
cat > LICENSE <<'ENDOFFILE'
MIT License
Copyright (c) 2024 Multipurpose Website Builder
ENDOFFILE

echo "Creating core files..."

# Create core/apps-script/Code.gs
cat > core/apps-script/Code.gs <<'ENDOFFILE'
/**
 * CONFIGURATION
 */
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA';
const SHEET_NAME = 'Data';
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&max-results=50';

/**
 * HELPER FUNCTION - Creates JSONP response
 */
function createJsonpResponse(data, callback) {
  // Convert to string once here.
  const jsonString = JSON.stringify(data);
  const jsonpData = callback + '(' + jsonString + ')';
  const output = ContentService.createTextOutput(jsonpData);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return output;
}

/**
 * MAIN GET REQUEST HANDLER
 */
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  const websiteType = e.parameter.websiteType;

  if (!callback) {
    return ContentService.createTextOutput("Error: 'callback' parameter is missing.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (action === 'getWebsiteTypes') {
    try {
      const websiteTypes = getWebsiteTypes();
      // websiteTypes is an OBJECT now
      return createJsonpResponse(websiteTypes, callback);
    } catch (error) {
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'getData') {
    try {
      const typeToFetch = websiteType || 'Home Improvement';
      const data = getData(typeToFetch);
      // data is an ARRAY of objects now
      return createJsonpResponse(data, callback);
    } catch (error) {
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'saveData') {
    try {
      const result = saveDataToSheet(e.parameter);
      return createJsonpResponse(result, callback);
    } catch (error) {
      return createJsonpResponse({ status: 'error', message: error.message }, callback);
    }
  }
  else {
    return createJsonpResponse({ error: 'Invalid action' }, callback);
  }
}

/**
 * Get website types from JSON
 * FIX: Return Object, do not stringify
 */
function getWebsiteTypes() {
  return {
    "website_types": [
      { "name": "Home Improvement", "subcategories": ["DIY Projects", "Renovation Tips", "Interior Design Ideas", "Gardening"], "icon": "tools", "color": "#e67e22" },
      { "name": "Real Estate Investment", "subcategories": ["Property Management", "Landlord Resources", "Market Analysis", "Rental Listings"], "icon": "building", "color": "#2c3e50" },
      { "name": "Insurance", "subcategories": ["Policy Comparisons", "Claims Advice", "Insurance Types", "Risk Management"], "icon": "shield-check", "color": "#2980b9" },
      { "name": "Self-Improvement", "subcategories": ["Personal Development Blogs", "Productivity Tools", "Goal Setting Resources", "Motivational Content"], "icon": "person-bounding-box", "color": "#16a085" },
      { "name": "Cryptocurrency", "subcategories": ["Blockchain Technology", "Trading Platforms", "Cryptocurrency News", "Investment Strategies"], "icon": "currency-bitcoin", "color": "#f39c12" },
      { "name": "Hobbies and Crafts", "subcategories": ["Crafting Tutorials", "Hobbyist Communities", "Supplies and Materials", "Project Ideas"], "icon": "scissors", "color": "#d35400" },
      { "name": "Events and Conferences", "subcategories": ["Event Listings", "Event Planning Resources", "Conference Reviews", "Networking Opportunities"], "icon": "calendar-event", "color": "#8e44ad" },
      { "name": "Dance", "subcategories": ["Dance Studios", "Choreography Tutorials", "Dance Competitions", "Styles and Techniques"], "icon": "music-note-beamed", "color": "#e84393" },
      { "name": "Music", "subcategories": ["Music Streaming Services", "Artist Highlights", "Music Theory Resources", "Concert and Festival Information"], "icon": "music-note", "color": "#0984e3" },
      { "name": "Philosophy", "subcategories": ["Philosophical Discussions", "Ethics Resources", "Book Recommendations", "Historical Philosophy"], "icon": "book", "color": "#6c5ce7" },
      { "name": "Mythology", "subcategories": ["Mythological Stories", "Cultural Significance", "Comparative Mythology", "Modern Adaptations"], "icon": "lightning-charge", "color": "#fdcb6e" },
      { "name": "Survival Skills", "subcategories": ["Outdoor Survival Guides", "Wilderness Training", "Emergency Preparedness", "Camping Tips"], "icon": "fire", "color": "#d63031" },
      { "name": "Fashion Design", "subcategories": ["Design Portfolios", "Fashion Shows", "Trend Analysis", "Fashion Illustration Techniques"], "icon": "handbag", "color": "#e17055" },
      { "name": "Culinary Arts", "subcategories": ["Professional Cooking Schools", "Culinary Competitions", "Chef Profiles", "Food Photography"], "icon": "egg-fried", "color": "#f1c40f" },
      { "name": "Film and Television", "subcategories": ["Film Festivals", "TV Show Reviews", "Filmmaking Resources", "Genre Analyses"], "icon": "film", "color": "#2d3436" },
      { "name": "Spirituality", "subcategories": ["Meditation Resources", "Holistic Living", "Spiritual Practices", "Community Support"], "icon": "flower1", "color": "#00b894" },
      { "name": "Digital Marketing", "subcategories": ["SEO Strategies", "Social Media Marketing", "Content Marketing", "Email Marketing Solutions"], "icon": "graph-up", "color": "#0984e3" },
      { "name": "Women’s Interests", "subcategories": ["Empowerment Resources", "Women in Leadership", "Health and Wellness for Women", "Fashion and Lifestyle for Women"], "icon": "gender-female", "color": "#e84393" },
      { "name": "Men’s Interests", "subcategories": ["Grooming and Lifestyle", "Fitness for Men", "Fatherhood Resources", "Men's Fashion Trends"], "icon": "gender-male", "color": "#34495e" },
      { "name": "Aging and Senior Care", "subcategories": ["Elder Care Resources", "Retirement Planning", "Health and Wellness for Seniors", "Activities for Seniors"], "icon": "heart-pulse", "color": "#74b9ff" },
      { "name": "Travel Hacking", "subcategories": ["Travel Deals", "Frequent Flyer Tips", "Budget Travel Strategies", "Travel Rewards Programs"], "icon": "airplane", "color": "#00cec9" },
      { "name": "Food and Beverage", "subcategories": ["Brewery and Winery Reviews", "Food Blogging", "Specialty Foods", "Beverage Pairings"], "icon": "cup-straw", "color": "#d63031" },
      { "name": "Urban Exploration", "subcategories": ["Abandoned Places", "City Guides", "Photography from Urban Settings", "History of Urban Spaces"], "icon": "building", "color": "#636e72" },
      { "name": "Alternative Energy", "subcategories": ["Solar and Wind Energy Resources", "Sustainable Living Tips", "Reviews on Renewable Technologies", "Policy and Advocacy"], "icon": "sun", "color": "#f1c40f" },
      { "name": "Sustainability", "subcategories": ["Eco-Friendly Products", "Sustainable Practices", "Green Living Resources", "Environmental Activism"], "icon": "tree", "color": "#27ae60" }
    ]
  };
}

/**
 * Save data to sheet
 */
function saveDataToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      const headers = ["Timestamp", "Website Type", "Type", "Name", "Email", "Phone", "Message"];
      sheet.appendRow(headers);
    }
    const timestamp = new Date();
    const row = [timestamp, data.websiteType, data.type, data.name, data.email, data.phone, data.message];
    sheet.appendRow(row);
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

/**
 * Get data from blog feed
 * FIX: Return Array, do not stringify
 */
function getData(websiteType) {
  const response = UrlFetchApp.fetch(BLOG_FEED_URL, { muteHttpExceptions: true });
  const responseCode = response.getResponseCode();
  const data = response.getContentText();
  
  if (responseCode !== 200) throw new Error('Blogger API failed');
  
  const bloggerJson = JSON.parse(data);
  const posts = bloggerJson.feed.entry || [];
  return processGenericData(posts, websiteType);
}

function processGenericData(posts, websiteType) {
  const postsArray = [];
  posts.forEach(function(post) {
    const title = post.title.$t;
    let content = post.content ? post.content.$t : '';
    let imageUrl = 'https://placehold.co/600x400/fe7301/white?text=No+Image';
    if (content) {
      const match = content.match(/<img[^>]+src="([^"]+)"/);
      if (match && match[1]) imageUrl = match[1];
    }
    postsArray.push({
      id: post.id.$t.split('.post-')[1],
      title: title,
      content: content,
      excerpt: content.replace(/<[^>]+>/g, ' ').trim().substring(0, 150) + '...',
      imageUrl: imageUrl,
      publishedDate: new Date(post.published.$t).toLocaleDateString()
    });
  });
  return postsArray;
}
ENDOFFILE

# Create core/blogger-theme/theme.xml
# FIX: Moved HTML inside b:includable and b:widget
# FIX: Added mobile='yes' to widget
# FIX: JS logic handles objects instead of parsing strings again
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
  <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&amp;display=swap' rel='stylesheet'/>

  <b:skin><![CDATA[
    body { background-color:#f5f5f5; }
  ]]></b:skin>
</head>

<body>

  <b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
    <b:widget id='HTML1' locked='false' title='App Container' type='HTML' mobile='yes'>
      <b:widget-settings>
        <b:widget-setting name='content'/>
      </b:widget-settings>
      <b:includable id='main'>

        <!-- Matrix Code Input -->
        <div class='container mt-4'>
           <div class='input-group mb-3' style='max-width: 400px; margin: 0 auto;'>
             <span class='input-group-text bg-primary text-white'><i class="bi bi-grid-3x3-gap-fill"></i></span>
             <input type='text' class='form-control' id='matrixCodeInput' placeholder='Enter Matrix Code (e.g. 12 or 1-2)' />
             <button class='btn btn-primary' type='button' onclick='applyMatrixCode()'>Go</button>
           </div>
        </div>

        <!-- Website Type Selector -->
        <div class='container website-type-selector'>
          <div class='selector-group'>
            <div>
              <label class='selector-label'>Website Type:</label>
              <select class='selector-select' id='websiteTypeSelector'>
                <option value="" disabled='disabled' selected='selected'>Loading categories...</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Subcategory Display -->
        <div class='container mb-4' id='subcategoryContainer'></div>

        <!-- Loading Container -->
        <div class='loading-container' id='loadingContainer' style='display:flex;'>
          <div class='loading-spinner'/>
          <div class='loading-text'>Loading content...</div>
        </div>

        <!-- Main Content -->
        <section class='container' id='mainContent' style='display:none;'>
          <!-- Content will be loaded here dynamically -->
        </section>

        <!-- SCRIPTS inside widget to ensure execution context -->
        <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'/>
        <script>
        //<![CDATA[
          // Configuration
          const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxBOuXmYcOpeijxpBMwEV5clzoUg1zYG6hwQ93AFj5FRjXE3rHPR5fdauhInRh4uB00BA/exec';
          let currentWebsiteType = '';
          let websiteTypesConfig = [];

          document.addEventListener('DOMContentLoaded', function() {
            console.log("App initializing...");
            fetchWebsiteTypes();
            
            const matrixInput = document.getElementById('matrixCodeInput');
            if (matrixInput) {
              matrixInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                  applyMatrixCode();
                }
              });
            }
          });
          
          // --- MATRIX CODE LOGIC ---
          function applyMatrixCode() {
             const rawInput = document.getElementById('matrixCodeInput').value;
             let cleanInput = rawInput.replace(/[^0-9\-\.\s]/g, '');
             if(!cleanInput) return;
             
             let catIndex = -1;
             let subIndex = -1;
             
             if (cleanInput.match(/[\-\.\s]/)) {
                 const parts = cleanInput.split(/[\-\.\s]+/);
                 catIndex = parseInt(parts[0]) - 1;
                 if(parts[1]) subIndex = parseInt(parts[1]) - 1;
             } else {
                 if (cleanInput.length > 0) {
                    catIndex = parseInt(cleanInput.charAt(0)) - 1;
                    if (cleanInput.length > 1) {
                       subIndex = parseInt(cleanInput.charAt(1)) - 1;
                    }
                 }
             }
             
             if (websiteTypesConfig[catIndex]) {
                 const typeName = websiteTypesConfig[catIndex].name;
                 const selector = document.getElementById('websiteTypeSelector');
                 selector.value = typeName;
                 
                 currentWebsiteType = typeName;
                 updateSubcategories(currentWebsiteType);
                 fetchData();
                 
                 if(subIndex > -1 && websiteTypesConfig[catIndex].subcategories[subIndex]) {
                     setTimeout(() => {
                        const badges = document.querySelectorAll('#subcategoryContainer .badge');
                        if(badges[subIndex]) {
                            badges[subIndex].classList.remove('bg-secondary');
                            badges[subIndex].classList.add('bg-primary');
                        }
                     }, 100);
                 }
                 
                 document.getElementById('matrixCodeInput').value = '';
             } else {
                 alert('Invalid Matrix Code');
             }
          }

          function fetchWebsiteTypes() {
            const script = document.createElement('script');
            script.src = WEB_APP_URL + '?action=getWebsiteTypes&callback=handleWebsiteTypes';
            script.onerror = function() { console.error("Failed to load website types. Check Code.gs deployment."); };
            document.body.appendChild(script);
          }

          function handleWebsiteTypes(data) {
            console.log("Received types:", data);
            // No JSON.parse needed anymore if Code.gs is fixed
            
            if (!data || !data.website_types) {
                console.error("Invalid data structure", data);
                return;
            }

            websiteTypesConfig = data.website_types;
            const selector = document.getElementById('websiteTypeSelector');
            
            if (selector) {
              selector.innerHTML = ''; 
              websiteTypesConfig.forEach((type, index) => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = `[${index + 1}] ${type.name}`;
                selector.appendChild(option);
              });
              
              currentWebsiteType = websiteTypesConfig[0].name;
              updateSubcategories(currentWebsiteType);
              fetchData();
            }
          }
          
          function updateSubcategories(typeName) {
             const config = websiteTypesConfig.find(t => t.name === typeName);
             const container = document.getElementById('subcategoryContainer');
             if (container) {
               if(config && config.subcategories) {
                 container.innerHTML = config.subcategories.map((sub, idx) => 
                   `<span class="badge bg-secondary me-1 mb-1">[${idx + 1}] ${sub}</span>`
                 ).join('');
               } else {
                 container.innerHTML = '';
               }
             }
          }

          function fetchData() {
            const loadingEl = document.getElementById('loadingContainer');
            const contentEl = document.getElementById('mainContent');
            
            if(loadingEl) loadingEl.style.display = 'flex';
            if(contentEl) contentEl.style.display = 'none';
            
            const oldScript = document.getElementById('jsonp-data-script');
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.id = 'jsonp-data-script';
            script.src = WEB_APP_URL + '?action=getData&websiteType=' + encodeURIComponent(currentWebsiteType) + '&callback=handleDataResponse';
            document.body.appendChild(script);
          }

          function handleDataResponse(data) {
            const loadingEl = document.getElementById('loadingContainer');
            const contentEl = document.getElementById('mainContent');
            
            if(loadingEl) loadingEl.style.display = 'none';
            if(contentEl) contentEl.style.display = 'block';
            
            generateGenericHTML(data);
          }

          function generateGenericHTML(posts) {
            let html = '<div class="blog-container">';
            if (Array.isArray(posts)) {
              posts.forEach(function(post) {
                html += '<article class="blog-post">';
                if(post.imageUrl) html += '<img src="' + post.imageUrl + '" style="max-height:200px; width:100%; object-fit:cover; border-radius:4px;" />';
                html += '<h3 class="mt-2">' + post.title + '</h3>';
                html += '<p>' + post.excerpt + '</p>';
                html += '<small class="text-muted">' + post.publishedDate + '</small>';
                html += '</article>';
              });
            } else {
              html += '<p>No content found.</p>';
            }
            html += '</div>';
            
            const contentEl = document.getElementById('mainContent');
            if (contentEl) contentEl.innerHTML = html;
          }

          const selectorEl = document.getElementById('websiteTypeSelector');
          if (selectorEl) {
            selectorEl.addEventListener('change', function() {
              currentWebsiteType = this.value;
              updateSubcategories(currentWebsiteType);
              fetchData();
            });
          }
        //]]>
        </script>
        <style>
          .website-type-selector { margin: 20px 0; }
          .selector-group { display: flex; gap: 15px; align-items: center; justify-content: center; }
          .selector-label { font-weight: 600; }
          .selector-select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
          .loading-container { display: flex; justify-content: center; align-items: center; padding: 50px; }
          .loading-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .blog-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
          .blog-post { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: transform 0.2s; }
          .blog-post:hover { transform: translateY(-5px); }
        </style>

      </b:includable>
    </b:widget>
  </b:section>

</body>
</html>
ENDOFFILE

echo
echo "========================================"
echo "All files created successfully!"
echo "========================================"
echo "IMPORTANT: You MUST update your Apps Script deployment and paste the NEW URL into theme.xml."