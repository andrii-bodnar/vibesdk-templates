const crowdinModule = require('@crowdin/app-project-module');
const bodyParser = require('body-parser');

const app = crowdinModule.express();
app.use(bodyParser.json());

const configuration = {
  baseUrl: process.env.BASE_URL,
  clientId: process.env.CROWDIN_CLIENT_ID,
  clientSecret: process.env.CROWDIN_CLIENT_SECRET,
  name: process.env.APP_NAME || 'Project Tools App',
  identifier: process.env.APP_IDENTIFIER || 'project-tools-app',
  description: process.env.APP_DESCRIPTION || 'A Crowdin app with Project Tools module',
  scopes: [
    crowdinModule.Scope.PROJECTS,
    crowdinModule.Scope.TRANSLATIONS,
    // TODO: Add additional scopes as needed
  ],
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/logo.svg',
  projectTools: {
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

// Example API endpoint for project data
app.get('/api/project-info', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID not found in context' });
    }
    
    // TODO: Implement your project info logic here
    // Example: Get project details, languages, files, etc.
    
    // Example implementation:
    // const project = await client.projectsGroupsApi.getProject(projectId);
    // const languages = await client.languagesApi.listProjectTargetLanguages(projectId);
    // const files = await client.sourceFilesApi.withFetchAll().listProjectFiles(projectId);
    
    const mockData = {
      projectId: projectId,
      // TODO: Replace with actual data
      info: 'Add your project info logic here',
      stats: {}
    };
    
    res.status(200).json({ success: true, data: mockData });
  } catch (error) {
    console.error('Error fetching project info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example API endpoint for project operations
app.post('/api/project-action', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    const { action, data } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID not found in context' });
    }
    
    // TODO: Implement your project action logic here
    console.log('Processing project action:', action, 'for project:', projectId, 'with data:', data);
    
    switch (action) {
      case 'analyze':
        // TODO: Implement project analysis logic
        break;
      case 'export':
        // TODO: Implement export logic
        break;
      case 'sync':
        // TODO: Implement sync logic
        break;
      case 'report':
        // TODO: Implement reporting logic
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Project action processed successfully',
      result: {} // TODO: Add actual result data
    });
  } catch (error) {
    console.error('Error processing project action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example API endpoint for project languages
app.get('/api/project-languages', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID not found in context' });
    }
    
    // TODO: Implement actual language fetching
    // const languages = await client.languagesApi.listProjectTargetLanguages(projectId);
    
    const mockLanguages = [
      { id: 'uk', name: 'Ukrainian' },
      { id: 'es', name: 'Spanish' },
      { id: 'fr', name: 'French' }
    ];
    
    res.status(200).json({ success: true, languages: mockLanguages });
  } catch (error) {
    console.error('Error fetching project languages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crowdin app "${configuration.name}" is running on port ${PORT}`);
  console.log(`Project Tools module enabled`);
});

module.exports = { app, crowdinApp, metadataStore };
