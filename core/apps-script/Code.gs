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
