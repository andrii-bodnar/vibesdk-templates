const crowdinModule = require('@crowdin/app-project-module');
const bodyParser = require('body-parser');

const app = crowdinModule.express();
app.use(bodyParser.json());

const configuration = {
  name: process.env.APP_NAME || 'Editor Right Panel App',
  identifier: process.env.APP_IDENTIFIER || 'editor-right-panel-app',
  description: process.env.APP_DESCRIPTION || 'A Crowdin app with Editor Right Panel module',
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/logo.svg',
  
  // Editor Right Panel module configuration
  editorRightPanel: {
    fileName: 'index.html',
    uiPath: __dirname + '/public',
    modes: ['translate'], // Specify editor modes where panel appears
    environments: 'crowdin' // or 'enterprise' or 'crowdin,enterprise'
  }
};

// Initialize Crowdin app
const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);
const metadataStore = crowdinModule.metadataStore;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// TODO: Add your custom API endpoints here if needed
// Most editor right panel apps are frontend-focused and may not need backend APIs
// Examples:
// - Data fetching endpoints for your UI
// - Configuration endpoints
// - Integration endpoints with external services

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crowdin app "${configuration.name}" is running on port ${PORT}`);
  console.log(`Editor Right Panel module enabled for modes: ${configuration.editorRightPanel.modes.join(', ')}`);
});

module.exports = { app, crowdinApp, metadataStore };
