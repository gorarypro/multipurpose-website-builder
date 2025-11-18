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
