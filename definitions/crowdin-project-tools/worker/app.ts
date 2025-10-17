import { AuthenticationType } from '@crowdin/app-project-module/out/types';
import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Project Tools App",
        identifier: "project-tools-app",
        description: "A Crowdin app built with the SDK with Project Tools module",
        authenticationType: AuthenticationType.NONE,
        disableLogsFormatter: true,
        enableStatusPage: {
            database: false,
            filesystem: false
        },
        assets: env.ASSETS,
        d1Config: {
            database: env.DB,
        },
        imagePath: '/logo.svg',
        
        // Project Tools module configuration
        projectTools: {
            fileName: 'index.html',
            uiPath: '/project-tools'
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
