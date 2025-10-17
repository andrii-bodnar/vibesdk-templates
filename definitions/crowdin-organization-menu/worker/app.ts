import { env } from 'cloudflare:workers';
import { AuthenticationType } from '@crowdin/app-project-module/out/types';
import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp() {
    const app = crowdinModule.express();

    const configuration = {
        name: "Organization Menu App",
        identifier: "organization-menu-app",
        description: "A Crowdin app built with the SDK with Organization Menu module",
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
        
        // Organization Menu module configuration
        organizationMenu: {
            fileName: 'index.html',
            uiPath: '/organization-menu'
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
