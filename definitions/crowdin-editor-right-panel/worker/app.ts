import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Editor Right Panel App",
        identifier: "editor-right-panel-app",
        description: "A Crowdin app built with the SDK with Editor Right Panel module",
        clientId: env.CROWDIN_CLIENT_ID,
        clientSecret: env.CROWDIN_CLIENT_SECRET,
        disableLogsFormatter: true,
        enableStatusPage: {
            filesystem: false
        },
        assetsConfig: {
            fetcher: env.ASSETS,
        },
        d1Config: {
            database: env.DB,
        },
        imagePath: '/logo.svg',
        
        // Editor Right Panel module configuration
        editorRightPanel: {
            fileName: 'index.html',
            uiPath: '/editor-panels',
            modes: ['translate'], // Specify editor modes where panel appears
            environments: 'crowdin' // or 'enterprise' or 'crowdin,enterprise'
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    return { expressApp: app, crowdinApp };
}
