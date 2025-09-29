const crowdinModule = require('@crowdin/app-project-module');
const bodyParser = require('body-parser');

const app = crowdinModule.express();
app.use(bodyParser.json());

const configuration = {
  name: process.env.APP_NAME || 'Crowdin App',
  identifier: process.env.APP_IDENTIFIER || 'crowdin-app',
  description: process.env.APP_DESCRIPTION || 'A Crowdin app built with the SDK',
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/logo.svg',
  
  // Default module configurations will be overridden by specific templates
};

// Initialize Crowdin app
const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);
const metadataStore = crowdinModule.metadataStore;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${configuration.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #333; }
        .info { background: #f5f5f5; padding: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${configuration.name}</h1>
        <div class="info">
          <p><strong>Description:</strong> ${configuration.description}</p>
          <p><strong>Status:</strong> Running</p>
          <p><strong>Identifier:</strong> ${configuration.identifier}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crowdin app "${configuration.name}" is running on port ${PORT}`);
  console.log(`Base URL: ${configuration.baseUrl}`);
});

module.exports = { app, crowdinApp, metadataStore };
