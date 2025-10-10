import { httpServerHandler } from 'cloudflare:node';
import { sendFilePolyfill, setEnvironment } from './middleware/sendFilePolyfill.js';

globalThis.__dirname = globalThis.__dirname || process.cwd?.() || '/';
globalThis.__filename = globalThis.__filename || 'index.js';

const crowdinModule = await import('@crowdin/app-project-module');
const app = crowdinModule.default.express();

app.use(sendFilePolyfill);

const configuration = {
  name: process.env.APP_NAME,
  identifier: process.env.APP_IDENTIFIER,
  description: process.env.APP_DESCRIPTION,
  enableStatusPage: {
    database: false,
    filesystem: false
  },
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/public/logo.svg',
  
  // Organization Menu module configuration
  organizationMenu: {
    fileName: 'index.html',
    uiPath: __dirname + '/public'
  }
};

app.post('/installed', (req, res) => {
  res.status(204).end();
});

app.post('/uninstall', (req, res) => {
  res.status(204).end();
});

// Initialize Crowdin app
const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// TODO: Add your custom API endpoints here
// Example:
// app.get('/api/user-settings', async (req, res) => {
//   try {
//     const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
//     // Your business logic here
//     res.status(200).json({ success: true, data: [] });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

const httpHandler = httpServerHandler(app.listen(process.env.PORT || 3000));

export default {
  async fetch(request, env, ctx) {
    // Set environment for both polyfills
    setEnvironment(env);
    
    return httpHandler.fetch(request, env, ctx);
  }
};