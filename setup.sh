#!/bin/bash

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

# Create website-types.json
cat > website-types.json <<'ENDOFFILE'
{
  "website_types": [
    {
      "name": "Business",
      "subcategories": ["Corporate", "Small Business", "Enterprise", "Startup"],
      "icon": "briefcase",
      "color": "#2c3e50",
      "features": ["about", "services", "team", "testimonials", "contact"]
    },
    {
      "name": "E-commerce",
      "subcategories": ["Online Store", "Marketplace", "Dropshipping", "Subscription Service"],
      "icon": "shopping-cart",
      "color": "#27ae60",
      "features": ["products", "cart", "checkout", "orders", "account"]
    },
    {
      "name": "Portfolio",
      "subcategories": ["Creative Portfolio", "Photography Portfolio", "Design Portfolio", "Artist Portfolio"],
      "icon": "palette",
      "color": "#8e44ad",
      "features": ["gallery", "projects", "about", "skills", "contact"]
    },
    {
      "name": "Blog",
      "subcategories": ["Personal Blog", "Tech Blog", "Travel Blog", "Food Blog", "Fashion Blog"],
      "icon": "journal-text",
      "color": "#e74c3c",
      "features": ["posts", "categories", "comments", "newsletter", "search"]
    }
  ]
}
ENDOFFILE

# Create README.md
cat > README.md <<'ENDOFFILE'
# Multipurpose Website Builder

A flexible, customizable website builder that supports multiple categories.

## Features
- 🎨 Multiple Website Types
- 🔧 Modular Components
- 📱 Responsive Design
- 🚀 Easy Deployment

## Quick Start
1. Set up Google Apps Script backend
2. Apply theme to Blogger
3. Configure your website type
4. Add content to Blogger

## Project Structure

## License
ENDOFFILE

# Create LICENSE
cat > LICENSE <<'ENDOFFILE'
MIT License

Copyright (c) 2024 Multipurpose Website Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
ENDOFFILE

echo "Creating core files..."

# Create core/apps-script/Code.gs
cat > core/apps-script/Code.gs <<'ENDOFFILE'
/**
 * =================================================================
 * CONFIGURATION
 * =================================================================
 */
const SPREADSHEET_ID = '1JEqIVnhjDaz7otgNAikpQj7Trw1SRG_0-iSfYMLQwtA';
const SHEET_NAME = 'Data';
const BLOG_FEED_URL = 'https://multipurpose-website-builder.blogspot.com/feeds/posts/default?alt=json&amp;max-results=50';
const NOTIFICATION_EMAIL = 'gorarypro@gmail.com';
const CACHE_EXPIRATION = 7200;

/**
 * =================================================================
 * HELPER FUNCTION - Creates JSONP response
 * =================================================================
 */
function createJsonpResponse(data, callback) {
  const jsonpData = callback + '(' + JSON.stringify(data) + ')';
  const output = ContentService.createTextOutput(jsonpData);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return output;
}

/**
 * =================================================================
 * MAIN GET REQUEST HANDLER
 * =================================================================
 */
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  const websiteType = e.parameter.websiteType || 'business';

  if (!callback) {
    return ContentService.createTextOutput("Error: 'callback' parameter is missing.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (action === 'getWebsiteTypes') {
    try {
      const websiteTypes = getWebsiteTypes();
      return createJsonpResponse(websiteTypes, callback);
    } catch (error) {
      Logger.log('getWebsiteTypes Error: ' + error.message);
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'getData') {
    try {
      const data = getData(websiteType);
      return createJsonpResponse(data, callback);
    } catch (error) {
      Logger.log('getData Error: ' + error.message);
      return createJsonpResponse({ error: error.message }, callback);
    }
  }
  else if (action === 'saveData') {
    try {
      const data = {
        type: e.parameter.type,
        websiteType: websiteType,
        name: e.parameter.name,
        email: e.parameter.email,
        phone: e.parameter.phone,
        message: e.parameter.message
      };
      
      const result = saveDataToSheet(data);
      return createJsonpResponse(result, callback);
    } catch (error) {
      Logger.log('saveData Error: ' + error.message);
      return createJsonpResponse({ status: 'error', message: error.message }, callback);
    }
  }
  else {
    return createJsonpResponse({ error: 'Invalid action' }, callback);
  }
}

/**
 * Get website types from JSON
 */
function getWebsiteTypes() {
  const websiteTypes = {
    "website_types": [
      {
        "name": "Business",
        "subcategories": ["Corporate", "Small Business", "Enterprise", "Startup"],
        "icon": "briefcase",
        "color": "#2c3e50"
      },
      {
        "name": "E-commerce",
        "subcategories": ["Online Store", "Marketplace", "Dropshipping", "Subscription Service"],
        "icon": "shopping-cart",
        "color": "#27ae60"
      },
      {
        "name": "Portfolio",
        "subcategories": ["Creative Portfolio", "Photography Portfolio", "Design Portfolio", "Artist Portfolio"],
        "icon": "palette",
        "color": "#8e44ad"
      },
      {
        "name": "Blog",
        "subcategories": ["Personal Blog", "Tech Blog", "Travel Blog", "Food Blog", "Fashion Blog"],
        "icon": "journal-text",
        "color": "#e74c3c"
      }
    ]
  };
  
  return JSON.stringify(websiteTypes);
}

/**
 * Save data to sheet
 */
function saveDataToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (sheet.getLastRow() === 0) {
      const headers = ["Timestamp", "Website Type", "Type"].concat(Object.keys(data));
      sheet.appendRow(headers);
    }
    
    const timestamp = new Date();
    const row = [timestamp, data.websiteType, data.type].concat(Object.values(data));
    
    sheet.appendRow(row);
    
    return { status: 'success' };
  } catch (error) {
    Logger.log('Save error: ' + error.message);
    return { status: 'error', message: error.message };
  }
}

/**
 * Get data from blog feed
 */
function getData(websiteType) {
  const response = UrlFetchApp.fetch(BLOG_FEED_URL, {
    muteHttpExceptions: true
  });
  
  const responseCode = response.getResponseCode();
  const data = response.getContentText();
  
  if (responseCode !== 200) {
    throw new Error('Blogger API request failed with status ' + responseCode + ': ' + data);
  }
  
  const bloggerJson = JSON.parse(data);
  const posts = bloggerJson.feed.entry || [];
  
  // Process data based on website type
  if (websiteType === 'E-commerce') {
    return processProductData(posts);
  } else if (websiteType === 'Portfolio') {
    return processPortfolioData(posts);
  } else if (websiteType === 'Blog') {
    return processBlogData(posts);
  } else {
    return processGenericData(posts);
  }
}

function processProductData(posts) {
  const categories = {};
  
  posts.forEach(function(post) {
    const title = post.title.$t;
    let description = '';
    if (post.content && post.content.$t) {
      description = post.content.$t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    let imageUrl = 'https://placehold.co/600x400/fe7301/white?text=No+Image';
    if (post.content && post.content.$t) {
      const match = post.content.$t.match(/<img[^>]+src="([^"]+)"/);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }
    
    let price = 0;
    let currency = 'USD';
    let postCategory = 'Products';
    
    if (post.category) {
      post.category.forEach(function(cat) {
        const term = cat.term;
        
        if (!categories[term]) {
          categories[term] = {
            title: term,
            icon: '📦',
            description: term + ' items',
            color: term.toLowerCase(),
            posts: []
          };
        }
        
        postCategory = term;
        
        if (term.indexOf('price-') === 0) {
          price = parseFloat(term.replace('price-', ''));
        } else if (term.indexOf('currency-') === 0) {
          currency = term.replace('currency-', '');
        }
      });
    }
    
    if (categories[postCategory]) {
      const postId = post.id.$t.split('.post-')[1];
      categories[postCategory].posts.push({
        id: postId,
        title: title,
        description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
        category: postCategory,
        imageUrl: imageUrl,
        price: price,
        currency: currency
      });
    }
  });

  return JSON.stringify(Object.values(categories));
}

function processPortfolioData(posts) {
  const projects = [];
  
  posts.forEach(function(post) {
    const title = post.title.$t;
    let description = '';
    if (post.content && post.content.$t) {
      description = post.content.$t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    let imageUrl = 'https://placehold.co/600x400/fe7301/white?text=No+Image';
    if (post.content && post.content.$t) {
      const match = post.content.$t.match(/<img[^>]+src="([^"]+)"/);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }
    
    const postId = post.id.$t.split('.post-')[1];
    projects.push({
      id: postId,
      title: title,
      description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
      imageUrl: imageUrl,
      projectType: 'Design'
    });
  });
  
  return JSON.stringify(projects);
}

function processBlogData(posts) {
  const postsArray = [];
  
  posts.forEach(function(post) {
    const title = post.title.$t;
    let content = '';
    if (post.content && post.content.$t) {
      content = post.content.$t;
    }
    
    let imageUrl = 'https://placehold.co/600x400/fe7301/white?text=No+Image';
    if (post.content && post.content.$t) {
      const match = post.content.$t.match(/<img[^>]+src="([^"]+)"/);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }
    
    const postId = post.id.$t.split('.post-')[1];
    const publishedDate = new Date(post.published.$t);
    
    postsArray.push({
      id: postId,
      title: title,
      content: content,
      excerpt: content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 150) + '...',
      imageUrl: imageUrl,
      publishedDate: publishedDate.toLocaleDateString()
    });
  });
  
  return JSON.stringify(postsArray);
}

function processGenericData(posts) {
  return processBlogData(posts);
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

  <b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
    <b:widget id='HTML1' locked='true' title='SPA Body' type='HTML' version='1'>
      <b:widget-settings>
        <b:widget-setting name='content'/>
      </b:widget-settings>
      <b:includable id='main'>

        <!-- Website Type Selector -->
        <div class='container website-type-selector'>
          <div class='selector-group'>
            <div>
              <label class='selector-label'>Website Type:</label>
              <select class='selector-select' id='websiteTypeSelector'>
                <option value='Business'>Business</option>
                <option value='E-commerce'>E-commerce</option>
                <option value='Portfolio'>Portfolio</option>
                <option value='Blog'>Blog</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading Container -->
        <div class='loading-container' id='loadingContainer' style='display:flex;'>
          <div class='loading-spinner'/>
          <div class='loading-text'>Loading website content...</div>
        </div>

        <!-- Main Content -->
        <section class='container' id='mainContent' style='display:none;'>
          <!-- Content will be loaded here dynamically -->
        </section>

      </b:includable>
    </b:widget>
  </b:section>

  <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'/>
  <script>
    // Configuration
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxBOuXmYcOpeijxpBMwEV5clzoUg1zYG6hwQ93AFj5FRjXE3rHPR5fdauhInRh4uB00BA/exec';
    let currentWebsiteType = 'Business';
    let allData = [];

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      fetchWebsiteTypes();
    });

    // Fetch website types
    function fetchWebsiteTypes() {
      const script = document.createElement('script');
      script.src = WEB_APP_URL + '?action=getWebsiteTypes&amp;callback=handleWebsiteTypes';
      document.body.appendChild(script);
    }

    // Handle website types response
    function handleWebsiteTypes(data) {
      // Fetch initial data
      fetchData();
    }

    // Fetch data for current website type
    function fetchData() {
      const oldScript = document.getElementById('jsonp-data-script');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.id = 'jsonp-data-script';
      script.src = WEB_APP_URL + '?action=getData&websiteType=' + currentWebsiteType + '&callback=handleDataResponse';
      document.body.appendChild(script);
    }

    // Handle data response
    function handleDataResponse(data) {
      allData = data;
      document.getElementById('loadingContainer').style.display = 'none';
      document.getElementById('mainContent').style.display = 'block';
      
      // Generate HTML based on website type
      if (currentWebsiteType === 'E-commerce') {
        generateEcommerceHTML(data);
      } else if (currentWebsiteType === 'Portfolio') {
        generatePortfolioHTML(data);
      } else if (currentWebsiteType === 'Blog') {
        generateBlogHTML(data);
      } else {
        generateGenericHTML(data);
      }
    }

    // Generate HTML functions
    function generateEcommerceHTML(categories) {
      let html = '<div class="product-grid">';
      categories.forEach(function(category) {
        category.posts.forEach(function(product) {
          html += '<div class="product-item"><h3>' + product.title + '</h3><p>' + product.description + '</p><p>Price: ' + product.price + ' ' + product.currency + '</p></div>';
        });
      });
      html += '</div>';
      document.getElementById('mainContent').innerHTML = html;
    }

    function generatePortfolioHTML(projects) {
      let html = '<div class="portfolio-grid">';
      projects.forEach(function(project) {
        html += '<div class="portfolio-item"><h3>' + project.title + '</h3><p>' + project.description + '</p></div>';
      });
      html += '</div>';
      document.getElementById('mainContent').innerHTML = html;
    }

    function generateBlogHTML(posts) {
      let html = '<div class="blog-container">';
      posts.forEach(function(post) {
        html += '<article class="blog-post"><h3>' + post.title + '</h3><p>' + post.excerpt + '</p><small>' + post.publishedDate + '</small></article>';
      });
      html += '</div>';
      document.getElementById('mainContent').innerHTML = html;
    }

    function generateGenericHTML(data) {
      generateBlogHTML(data);
    }

    // Website type selector change
    document.getElementById('websiteTypeSelector').addEventListener('change', function() {
      currentWebsiteType = this.value;
      document.getElementById('loadingContainer').style.display = 'flex';
      document.getElementById('mainContent').style.display = 'none';
      fetchData();
    });
  </script>
  <style>
    .website-type-selector { margin: 20px 0; }
    .selector-group { display: flex; gap: 15px; align-items: center; }
    .selector-label { font-weight: 600; }
    .selector-select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .loading-container { display: flex; justify-content: center; align-items: center; padding: 50px; }
    .loading-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .product-grid, .portfolio-grid, .blog-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    .product-item, .portfolio-item, .blog-post { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  </style>

</body>
</html>
ENDOFFILE

# Create core/css/base.css
cat > core/css/base.css <<'ENDOFFILE'
/* Base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

img {
    max-width: 100%;
    height: auto;
}
ENDOFFILE

# Create core/js/app.js
cat > core/js/app.js <<'ENDOFFILE'
// Main application logic
console.log('Multipurpose Website Builder loaded');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
});
ENDOFFILE

echo "Creating website type configurations..."

# Create website-types/business/config.js
cat > website-types/business/config.js <<'ENDOFFILE'
const BUSINESS_CONFIG = {
  websiteType: "Business",
  icon: "briefcase",
  color: "#2c3e50",
  hero: {
    title: "Business Name",
    tagline: "Professional Services for Your Success"
  },
  services: [
    { name: "Consulting", description: "Expert advice to grow your business" },
    { name: "Strategy", description: "Strategic planning for success" },
    { name: "Implementation", description: "Turn plans into reality" }
  ]
};
ENDOFFILE

# Create website-types/ecommerce/config.js
cat > website-types/ecommerce/config.js <<'ENDOFFILE'
const ECOMMERCE_CONFIG = {
  websiteType: "E-commerce",
  icon: "shopping-cart",
  color: "#27ae60",
  hero: {
    title: "Store Name",
    tagline: "Quality Products at Great Prices"
  },
  features: ["products", "cart", "checkout", "orders"]
};
ENDOFFILE

# Create website-types/portfolio/config.js
cat > website-types/portfolio/config.js <<'ENDOFFILE'
const PORTFOLIO_CONFIG = {
  websiteType: "Portfolio",
  icon: "palette",
  color: "#8e44ad",
  hero: {
    title: "Your Name",
    tagline: "Creative Professional"
  },
  features: ["gallery", "projects", "about", "contact"]
};
ENDOFFILE

# Create website-types/blog/config.js
cat > website-types/blog/config.js <<'ENDOFFILE'
const BLOG_CONFIG = {
  websiteType: "Blog",
  icon: "journal-text",
  color: "#e74c3c",
  hero: {
    title: "Blog Name",
    tagline: "Sharing thoughts and ideas"
  },
  features: ["posts", "categories", "comments"]
};
ENDOFFILE

echo "Creating documentation..."

# Create docs/getting-started.md
cat > docs/getting-started.md <<'ENDOFFILE'
# Getting Started

## Prerequisites
- Google Account
- Blogger Account
- GitHub Account

## Installation
1. Clone this repository
2. Set up Google Apps Script
3. Configure Blogger theme
4. Add content to Blogger

## Configuration
Update the configuration files with your details.
ENDOFFILE

echo
echo "========================================"
echo "All files created successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Open GitHub Desktop"
echo "2. Go to your repository folder"
echo "3. Review the changes"
echo "4. Commit with message: 'Initial setup - Add multipurpose website builder structure'"
echo "5. Push to GitHub"