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
  name: "Organization Menu App",
  identifier: "organization-menu-app",
  description: "A Crowdin app built with the SDK with Organization Menu module",
  authenticationType: AuthenticationType.NONE,
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

// Initialize Crowdin app
crowdinModule.addCrowdinEndpoints(app, configuration);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const port: number = Number(process.env.PORT) || 3000;
app.listen(port);

export default httpServerHandler({ port });
