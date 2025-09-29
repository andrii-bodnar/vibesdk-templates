const crowdinModule = require('@crowdin/app-project-module');
const bodyParser = require('body-parser');

const app = crowdinModule.express();
app.use(bodyParser.json());

const configuration = {
  name: process.env.APP_NAME || 'Organization Menu App',
  identifier: process.env.APP_IDENTIFIER || 'organization-menu-app',
  description: process.env.APP_DESCRIPTION || 'A Crowdin app with Organization Menu module',
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/logo.svg',
  
  // Organization Menu module configuration
  organizationMenu: {
    fileName: 'index.html',
    uiPath: __dirname + '/public'
  }
};

// Initialize Crowdin app
const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);
const metadataStore = crowdinModule.metadataStore;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// TODO: Add your custom API endpoints here
// Example:
// app.get('/api/data', async (req, res) => {
//   try {
//     const { client } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
//     // Your business logic here
//     res.status(200).json({ success: true, data: [] });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crowdin app "${configuration.name}" is running on port ${PORT}`);
  console.log(`Organization Menu module enabled`);
});

module.exports = { app, crowdinApp, metadataStore };
