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

# Create website-types.json
cat > website-types.json <<'ENDOFFILE'
{
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
}
ENDOFFILE

# Create core/apps-script/Code.gs
cat > core/apps-script/Code.gs <<'ENDOFFILE'
/**
 * CONFIGURATION
 */
// PASTE YOUR SHEET ID HERE:
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA'; 
const SHEET_NAME = 'Data';
// PASTE YOUR BLOG URL HERE (e.g. https://yourblog.blogspot.com):
const BLOG_URL_BASE = 'https://multipurpose-website-builder.blogspot.com'; 
const BLOG_FEED_URL = BLOG_URL_BASE + '/feeds/posts/default?alt=json&max-results=50';

/**
 * HELPER FUNCTION - Creates JSONP response
 */
function createJsonpResponse(data, callback) {
  // Ensure data is stringified exactly once
  const jsonString = (typeof data === 'string') ? data : JSON.stringify(data);
  const jsonpData = callback + '(' + jsonString + ')';
  const output = ContentService.createTextOutput(jsonpData);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return output;
}

function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  const websiteType = e.parameter.websiteType;

  if (!callback) {
    return ContentService.createTextOutput("Error: 'callback' missing").setMimeType(ContentService.MimeType.TEXT);
  }

  if (action === 'getWebsiteTypes') {
    try {
      return createJsonpResponse(getWebsiteTypes(), callback);
    } catch (error) {
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'getData') {
    try {
      const typeToFetch = websiteType || 'Home Improvement';
      const data = getData(typeToFetch);
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
  return createJsonpResponse({ error: 'Invalid action' }, callback);
}

function getWebsiteTypes() {
  // Returns object directly
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

function saveDataToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Website Type", "Type", "Name", "Email", "Phone", "Message"]);
    }
    sheet.appendRow([new Date(), data.websiteType, data.type, data.name, data.email, data.phone, data.message]);
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

function getData(websiteType) {
  const response = UrlFetchApp.fetch(BLOG_FEED_URL, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('Blogger API failed');
  
  const bloggerJson = JSON.parse(response.getContentText());
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
    
    // Extract labels to return for filtering
    let labels = [];
    if (post.category) {
      labels = post.category.map(c => c.term);
    }

    postsArray.push({
      id: post.id.$t.split('.post-')[1],
      title: title,
      content: content,
      excerpt: content.replace(/<[^>]+>/g, ' ').trim().substring(0, 150) + '...',
      imageUrl: imageUrl,
      publishedDate: new Date(post.published.$t).toLocaleDateString(),
      labels: labels // Pass labels to frontend for filtering
    });
  });
  return postsArray;
}
ENDOFFILE

# Create core/blogger-theme/theme.xml
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
           <option value="" disabled="disabled" selected="selected">Loading categories...</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Subcategory Display -->
  <div class='container mb-4 text-center' id='subcategoryContainer'></div>

  <!-- Loading Container -->
  <div class='loading-container' id='loadingContainer' style='display:flex;'>
    <div class='loading-spinner'></div>
    <div class='loading-text'>Loading content...</div>
  </div>

  <!-- Main Content -->
  <section class='container' id='mainContent' style='display:none;'>
    <!-- Content will be loaded here dynamically -->
  </section>

  <!-- Required Blogger Widget (Left Empty to avoid conflicts) -->
  <b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
    <b:widget id='HTML1' locked='true' title='App Container' type='HTML' version='1'>
      <b:widget-settings>
        <b:widget-setting name='content'/>
      </b:widget-settings>
      <b:includable id='main'>
        <!-- Empty content here, real content is in body above -->
      </b:includable>
    </b:widget>
  </b:section>

  <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'/>
  <script>
  //<![CDATA[
    // Configuration
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxBOuXmYcOpeijxpBMwEV5clzoUg1zYG6hwQ93AFj5FRjXE3rHPR5fdauhInRh4uB00BA/exec';
    let currentWebsiteType = '';
    let currentSubFilter = ''; // Store the active subcategory filter
    let websiteTypesConfig = [];
    let allPostsData = []; // Cache fetched posts

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
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
       
       // Parse logic: "12" -> Cat 1, Sub 2. "1-12" -> Cat 1, Sub 12.
       if (cleanInput.match(/[\-\.\s]/)) {
           const parts = cleanInput.split(/[\-\.\s]+/);
           catIndex = parseInt(parts[0]) - 1; 
           if(parts[1]) subIndex = parseInt(parts[1]) - 1;
       } else {
           if (cleanInput.length > 0) {
              catIndex = parseInt(cleanInput.charAt(0)) - 1;
              if (cleanInput.length > 1) {
                 // If length is 2, e.g. "12", it is Cat 1, Sub 2
                 subIndex = parseInt(cleanInput.substring(1)) - 1;
              }
           }
       }
       
       if (websiteTypesConfig[catIndex]) {
           const typeName = websiteTypesConfig[catIndex].name;
           const selector = document.getElementById('websiteTypeSelector');
           selector.value = typeName;
           
           currentWebsiteType = typeName;
           
           // Determine Subcategory Name for filtering
           currentSubFilter = '';
           if(subIndex > -1 && websiteTypesConfig[catIndex].subcategories[subIndex]) {
               currentSubFilter = websiteTypesConfig[catIndex].subcategories[subIndex];
           }

           // Update UI
           updateSubcategories(currentWebsiteType, subIndex);
           
           // Fetch Data (which will then filter based on currentSubFilter)
           fetchData();
           
           document.getElementById('matrixCodeInput').value = '';
       } else {
           alert('Invalid Matrix Code. Category not found.');
       }
    }

    // Fetch website types
    function fetchWebsiteTypes() {
      const script = document.createElement('script');
      script.src = WEB_APP_URL + '?action=getWebsiteTypes&callback=handleWebsiteTypes';
      document.body.appendChild(script);
    }

    // Handle website types response
    function handleWebsiteTypes(data) {
      if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { console.error(e); return; }
      }
      
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
        
        // Set default
        currentWebsiteType = websiteTypesConfig[0].name;
        updateSubcategories(currentWebsiteType);
        fetchData();
      }
    }
    
    function updateSubcategories(typeName, activeIndex = -1) {
       const config = websiteTypesConfig.find(t => t.name === typeName);
       const container = document.getElementById('subcategoryContainer');
       if (container) {
         if(config && config.subcategories) {
           container.innerHTML = config.subcategories.map((sub, idx) => {
             // Highlight logic
             const isActive = (idx === activeIndex);
             const bgClass = isActive ? 'bg-primary' : 'bg-secondary';
             return `<span class="badge ${bgClass} me-1 mb-1" style="font-size:0.9rem;">[${idx + 1}] ${sub}</span>`;
           }).join('');
         } else {
           container.innerHTML = '';
         }
       }
    }

    // Fetch data for current website type
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

    // Handle data response
    function handleDataResponse(data) {
      if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { console.error(e); return; }
      }

      allPostsData = data; // Store for local filtering if needed
      
      const loadingEl = document.getElementById('loadingContainer');
      const contentEl = document.getElementById('mainContent');
      
      if(loadingEl) loadingEl.style.display = 'none';
      if(contentEl) contentEl.style.display = 'block';
      
      generateGenericHTML(data);
    }

    function generateGenericHTML(posts) {
      let html = '<div class="blog-container">';
      
      // FILTERING LOGIC:
      // If currentSubFilter is set (via Matrix Code), filter the posts.
      // We assume posts have labels/categories matching the subcategory name.
      // If no filter, show all.
      
      let filteredPosts = posts;
      if (currentSubFilter && Array.isArray(posts)) {
          filteredPosts = posts.filter(post => {
              // Check if any label matches the subcategory
              // This relies on Code.gs returning 'labels' array in the post object
              if (post.labels && Array.isArray(post.labels)) {
                  return post.labels.includes(currentSubFilter);
              }
              return false; // No labels, or no match
          });
          
          // UI Feedback for filtering
          html = `<div class="alert alert-info">Showing results for: <strong>${currentSubFilter}</strong></div>` + html;
      }

      if (Array.isArray(filteredPosts) && filteredPosts.length > 0) {
        filteredPosts.forEach(function(post) {
          html += '<article class="blog-post">';
          if(post.imageUrl) html += '<img src="' + post.imageUrl + '" style="max-height:200px; width:100%; object-fit:cover; border-radius:4px;" />';
          html += '<h3 class="mt-2">' + post.title + '</h3>';
          html += '<p>' + post.excerpt + '</p>';
          html += '<small class="text-muted">' + post.publishedDate + '</small>';
          // Show labels for clarity
          if(post.labels && post.labels.length > 0) {
              html += '<div class="mt-2">';
              post.labels.forEach(l => html += `<span class="badge bg-light text-dark border me-1">${l}</span>`);
              html += '</div>';
          }
          html += '</article>';
        });
      } else {
        html += '<p class="text-muted p-3">No content found.</p>';
        if (currentSubFilter) {
            html += `<p class="small text-muted ms-3">Tip: Ensure your Blogger posts have the label "<strong>${currentSubFilter}</strong>".</p>`;
        }
      }
      html += '</div>';
      
      const contentEl = document.getElementById('mainContent');
      if (contentEl) contentEl.innerHTML = html;
    }

    // Website type selector change
    const selectorEl = document.getElementById('websiteTypeSelector');
    if (selectorEl) {
      selectorEl.addEventListener('change', function() {
        currentWebsiteType = this.value;
        currentSubFilter = ''; // Clear subcategory filter on main category change
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

</body>
</html>
ENDOFFILE

echo
echo "========================================"
echo "All files created successfully with Matrix Filtering!"
echo "========================================"
echo "IMPORTANT: You MUST update your Apps Script deployment and paste the NEW URL into theme.xml line 108."