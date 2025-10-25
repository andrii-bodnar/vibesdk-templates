import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Crowdin App",
        identifier: "crowdin-app",
        description: "A Crowdin app built with the SDK",
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
        imagePath: '/logo.png',
        fileStore: {
            getFile: (fileId: string) => env.FILES_KV.get(fileId),
            storeFile: async (content: Buffer) => {
                const fileId = `file_${Date.now()}`;
                await env.FILES_KV.put(fileId, content);
                return fileId;
            },
        },
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
