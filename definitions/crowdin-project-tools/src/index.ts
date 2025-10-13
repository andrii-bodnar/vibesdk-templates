// Extend global namespace for Node.js compatibility
declare global {
  var __dirname: string;
  var __filename: string;
}

globalThis.__dirname = globalThis.__dirname || process.cwd?.() || '/';
globalThis.__filename = globalThis.__filename || 'index.ts';

import { httpServerHandler } from 'cloudflare:node';
import { sendFilePolyfill } from './middleware/sendFilePolyfill.js';
import { Express, Request, Response } from 'express';
import { AuthenticationType } from '@crowdin/app-project-module/out/types';

// Import Crowdin module with proper typing
const crowdinModule = await import('@crowdin/app-project-module');
const app: Express = crowdinModule.express();

app.use(sendFilePolyfill);

const configuration = {
  baseUrl: process.env.URL || 'http://localhost:3000',
  name: "Project Tools App",
  identifier: "project-tools-app",
  description: "A Crowdin app built with the SDK with Project Tools module",
  authenticationType: AuthenticationType.NONE,
  enableStatusPage: {
    database: false,
    filesystem: false
  },
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/public/logo.svg',

  // Project Tools module configuration
  projectTools: {
    fileName: 'index.html',
    uiPath: __dirname + '/public'
  }
};

// Initialize Crowdin app
const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Example API endpoint for project data
app.get('/api/project-info', async (req: Request, res: Response) => {
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
app.post('/api/project-action', async (req: Request, res: Response) => {
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
app.get('/api/project-languages', async (req: Request, res: Response) => {
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

const port: number = Number(process.env.PORT) || 3000;
app.listen(port);

export default httpServerHandler({ port });
