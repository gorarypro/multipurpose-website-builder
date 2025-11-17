const fs = require('fs');
const path = require('path');

// Read project structure
function readProjectStructure(dir, extensions = ['.js', '.css']) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let structure = {};
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      structure[item] = readProjectStructure(itemPath, extensions);
    } else {
      structure[item] = item;
    }
  });
  
  return structure;
}

// Generate documentation
function generateDocumentation() {
  console.log('📚 Generating documentation...');
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync('./docs')) {
    fs.mkdirSync('./docs');
  }
  
  // Read project structure
  const projectStructure = readProjectStructure('.', ['.js', '.css']);
  
  // Generate API documentation
  generateApiDocumentation(projectStructure);
  
  // Generate component documentation
  const components = ['navbar', 'hero', 'about', 'services'];
  components.forEach(component => {
    generateComponentDoc(component);
  });
  
  // Generate theme documentation
  const themes = ['base', 'business', 'ecommerce'];
  themes.forEach(theme => {
    generateThemeDoc(theme);
  });
  
  // Generate user guide
  generateUserGuide(projectStructure);
  
  console.log('✅ Documentation generated successfully!');
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${component} Component Documentation</title>
  <style>
    body { font-family: Arial, <sans-serif; line-height: 1.6; padding: 0px 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${component} Component</h1>
  <h2>JavaScript Implementation</h2>
  <pre><code>${jsContent}</code></pre>
  
  <h2>CSS Styles</h2>
  <pre><code>:root {
  --primary-color: #0a4d68;
  --secondary-color: #088395;
  --accent-color: #05bfdb;
}</code></pre>
  
  <h2>Usage Example</h2>
  <pre><code>import { ${component} } from './components/${component}/${component}.js';</code></pre>
  
  <h2>HTML Example</h2>
  <pre><code>&lt;div class="${component}"&gt;Hello World&lt;/div&gt;</code></pre>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${theme} Theme Documentation</title>
  <style>
    body { font-family: Arial, <sans-serif; line-height: 1.6; padding: 0px 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${theme} Theme Documentation</h1>
  <h2>CSS Variables</h2>
  <pre><code>:root {
  --primary-color: #0a4d68;
  --secondary-color: #088395;
  --accent-color: #05bfdb;
}</code></pre>
  
  <h2>Usage</h2>
  <pre><code>body {
  background-color: var(--primary-color);
  color: var(--text-color);
}</code></pre>
  
  <h2>Customization</h2>
  <pre><code>body.dark-theme {
  background-color: var(--dark-bg-color);
  color: var(--dark-text-color);
}</code></pre>
</body>
</html>
    `;
    
    const docPath = `./docs/${theme}.html`;
    fs.writeFileSync(docPath, htmlDoc);
    
    console.log(`Generated documentation for ${theme}`);
  }
}

function generateApiDoc(structure) {
  // Generate API documentation
  const apiDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 0px 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>API Documentation</h1>
  <h2>Core Classes</h2>
  <pre><code>class MultipurposeWebsiteBuilder {
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
    
    // Methods
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
  <pre><code>const APP_CONFIG = {
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
};</code></pre>
</body>
</html>
    `;
    
    const docPath = './docs/api.html';
    fs.writeFileSync(docPath, apiDoc);
    
    console.log('Generated API documentation');
  }
}

function generateUserGuide(structure) {
  // Generate user guide
  const userGuide = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>User Guide</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 0px 20px; }
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
    <li>Choose a website type from available categories</li>
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
    <li>Cart - Shopping cart</li>
    <li>Contact - Contact form</li>
  </ul>
  
  <h2>Themes</h2>
  <p>Multiple themes are available:</p>
  <ul>
    <li>Business - Professional corporate theme</li>
    <li>E-Commerce - Modern online store theme</li>
    <li>Education - Clean educational theme</li>
    <li>Health - Fresh wellness theme</li>
  </ul>
  
  <h2>API</h2>
  <p>The system provides:</p>
  <ul>
    <li>Core classes for application management</li>
    <li>Configuration system for multiple website types</li>
    <li>Component loader for dynamic loading</li>
    <li>Theme manager for theme switching</li>
    <li>Utility functions for common tasks</li>
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
