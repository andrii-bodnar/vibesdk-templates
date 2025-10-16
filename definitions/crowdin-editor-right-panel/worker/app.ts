import { env } from 'cloudflare:workers';
import { AuthenticationType } from '@crowdin/app-project-module/out/types';
import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp() {
    const app = crowdinModule.express();

    const configuration = {
        baseUrl: 'http://localhost:3000',
        name: "Editor Right Panel App",
        identifier: "editor-right-panel-app",
        description: "A Crowdin app built with the SDK with Editor Right Panel module",
        authenticationType: AuthenticationType.NONE,
        disableLogsFormatter: true,
        enableStatusPage: {
            database: false,
            filesystem: false
        },
        assets: env.ASSETS as any,
        d1Config: {
            database: env.DB as any,
        },
        imagePath: '/logo.svg',
        
        // Editor Right Panel module configuration
        editorRightPanel: {
            fileName: 'index.html',
            uiPath: '/editor-right-panel',
            modes: ['translate'], // Specify editor modes where panel appears
            environments: 'crowdin' // or 'enterprise' or 'crowdin,enterprise'
        }
    };

    // Initialize Crowdin app
    crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    return app;
}
