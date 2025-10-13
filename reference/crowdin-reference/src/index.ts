import { httpServerHandler } from 'cloudflare:node';
import { sendFilePolyfill } from './middleware/sendFilePolyfill.js';
import { Express, Request, Response } from 'express';

// Extend global namespace for Node.js compatibility
declare global {
  var __dirname: string;
  var __filename: string;
}

globalThis.__dirname = globalThis.__dirname || process.cwd?.() || '/';
globalThis.__filename = globalThis.__filename || 'index.ts';

// Import Crowdin module with proper typing
const crowdinModule = await import('@crowdin/app-project-module');
const app: Express = crowdinModule.express();

app.use(sendFilePolyfill);

const configuration = {
  name: "Crowdin App",
  identifier: "crowdin-app",
  description: "A Crowdin app built with the SDK",
  enableStatusPage: {
    database: false,
    filesystem: false
  },
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/public/logo.svg',
  // Default module configurations will be overridden by specific templates
};

app.post('/installed', (req: Request, res: Response) => {
  res.status(204).end();
});

app.post('/uninstall', (req: Request, res: Response) => {
  res.status(204).end();
});

// Initialize Crowdin app
crowdinModule.addCrowdinEndpoints(app, configuration);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const port: number = Number(process.env.PORT) || 3000;
app.listen(port);

export default httpServerHandler({ port });
