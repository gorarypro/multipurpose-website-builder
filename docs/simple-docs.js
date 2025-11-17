const fs = require('fs');
const path = require('path');

// Simple documentation generator
function generateSimpleDocs() {
  console.log('📚 Generating simple documentation...');
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync('./docs')) {
    fs.mkdirSync('./docs');
  }
  
  // Read project structure
  const projectStructure = readProjectStructure('.', ['.js', '.css']);
  
  // Generate component documentation
  const components = ['navbar', 'hero', 'about', 'services'];
  
  components.forEach(component => {
    const componentPath = `./components/${component}`;
    if (fs.existsSync(componentPath)) {
      generateComponentDoc(component);
    }
  });
  
  // Generate theme documentation
  const themes = ['base', 'business', 'ecommerce'];
  themes.forEach(theme => {
    const themePath = `./themes/${theme}.css`;
    if (fs.existsSync(themePath)) {
      generateThemeDoc(theme);
    }
  });
  
  // Generate API documentation
  generateApiDoc();
  
  // Generate user guide
  generateUserGuide();
  
  console.log('✅ Simple documentation generated successfully!');
}

function generateComponentDoc(component) {
  const componentPath = `./components/${component}`;
  const jsPath = `${componentPath}/${component}.js`;
  const cssPath = `${componentPath}/${component}.css`;
  
  if (fs.existsSync(jsPath) && fs.existsSync(cssPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Generate HTML documentation
    const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
  <title>${component} Component Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${component} Component</h1>
  <h2>JavaScript</h2>
  <pre><code>${jsContent}</code></pre>
  
  <h2>CSS</h2>
  <pre><code>${cssContent}</code></pre>
</body>
</html>
    `;
    
    const docPath = `./docs/${component}.html`;
    fs.writeFileSync(docPath, htmlDoc);
    
    console.log(`Generated documentation for ${component}`);
  }
}

function generateThemeDoc(theme) {
  const themePath = `./themes/${theme}.css`;
  
  if (fs.existsSync(themePath)) {
    const cssContent = fs.readFileSync(themePath, 'utf8');
    
    // Generate HTML documentation
    const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
  <title>${theme} Theme Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${theme} Theme Documentation</h1>
  <pre><code>${cssContent}</code></pre>
</body>
</html>
    `;
    
    const docPath = `./docs/${theme}.html`;
    fs.writeFileSync(docPath, htmlDoc);
    
    console.log(`Generated documentation for ${theme}`);
  }
}

function generateApiDoc() {
  const apiDoc = `
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>API Documentation</h1>
  <h2>Core Classes</h2>
  <pre><code>
class MultipurposeWebsiteBuilder {
  constructor() {
    this.config = APP_CONFIG;
    this.categoryHierarchy = CATEGORY_HIERARCHY;
    this.featureMatrix = FEATURE_MATRIX;
    this.templateConfig = TEMPLATE_CONFIG;
    
    this.componentLoader = new ComponentLoader();
    this.themeManager = new ThemeManager();
    this.utils = new Utils();
    
    this.currentConfig = null;
    this.currentWebsiteType = null;
    this.currentTheme = null;
  }

  async init() {
    console.log('🚀 Initializing Multipurpose Website Builder...');
    
    try {
      // Load configuration
      await this.loadConfiguration();
      
      // Apply theme
      this.applyTheme();
      
      // Load components
      await this.loadComponents();
      
      // Initialize router
      this.initializeRouter();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
    }
  }

  // ... rest of the class
}
    </code></pre>
    
  <h2>Configuration</h2>
  <pre><code>
const APP_CONFIG = {
  BACKEND_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
  APP_NAME: 'Multipurpose Website Builder',
  VERSION: '1.0.0',
  DEFAULTS: {
    websiteType: 'business-corporate',
    language: 'en',
    currency: 'USD',
    theme: 'business'
  },
  FEATURES: {
    analytics: true,
    socialSharing: true,
    darkMode: false,
    multiLanguage: false
  }
};
    </code></pre>
    
  <h2>Usage</h2>
  <pre><code>
const app = new MultipurposeWebsiteBuilder();
await app.init();
    </code></pre>
  </body>
</html>
    `;
    
    const docPath = './docs/api.html';
    fs.writeFileSync(docPath, apiDoc);
    
    console.log('Generated API documentation');
  }
}

function generateUserGuide() {
  const userGuide = `
<!DOCTYPE html>
<html>
<head>
  <title>User Guide</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>Multipurpose Website Builder - User Guide</h1>
  
  <h2>Getting Started</h2>
  <ol>
    <li>Clone the repository</li>
    <li>Install dependencies: <code>npm install</code></li>
    <li>Start development server: <code>npm run dev</code></li>
    <li>Open <code>index.html</code> in your browser</li>
  </ol>
  
  <h2>Building Websites</h2>
  <ol>
    <li>Choose a website type from the available categories</li>
    <li>Select a template or customize your own</li>
    <li>Add content using the component system</li>
    <li>Configure features and themes</li>
  </ol>
  
  <h2>Configuration</h2>
  <p>The configuration system allows you to:</p>
  <ul>
    <li>Set the default website type</li>
    <li>Enable/disable features based on your needs</li>
    <li>Customize themes with your own colors and fonts</li>
  </ul>
  
  <h2>Components</h2>
  <p>The component system includes:</p>
  <ul>
    <li>Navbar - Navigation bar</li>
    <li>Hero - Hero section</li>
    <li>About - About section</li>
    <li>Services - Services section</li>
  </ul>
  
  <h2>Themes</h2>
  <p>Multiple themes are available:</p>
  <ul>
    <li>Business - Professional corporate theme</li>
    <li>E-Commerce - Modern online store theme</li>
    <li>Education - Clean educational theme</li>
  </ul>
</body>
</html>
    `;
    
    const docPath = './docs/user-guide.html';
    fs.writeFileSync(docPath, userGuide);
    
    console.log('Generated user guide');
  }
}

// Run the documentation generation
generateSimpleDocs();
