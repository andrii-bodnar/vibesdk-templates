import { AuthenticationType } from '@crowdin/app-project-module/out/types';
import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Crowdin App",
        identifier: "crowdin-app",
        description: "A Crowdin app built with the SDK",
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
        // Default module configurations will be overridden by specific templates
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    return { expressApp: app, crowdinApp };
}
