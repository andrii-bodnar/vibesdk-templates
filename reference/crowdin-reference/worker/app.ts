import * as crowdinModule from '@crowdin/app-project-module';
import { AssetsConfig, FileStore } from '@crowdin/app-project-module/out/types';
import { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';
import { Request, Response } from 'express';

export function createApp({
    clientId,
    clientSecret,
    assetsConfig,
    d1Config,
    fileStore
}: {
    clientId: string;
    clientSecret: string;
    assetsConfig: AssetsConfig;
    d1Config: D1StorageConfig;
    fileStore: FileStore;
}) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Crowdin App",
        identifier: "crowdin-app",
        description: "A Crowdin app built with the SDK",
        clientId,
        clientSecret,
        disableLogsFormatter: true,
        assetsConfig,
        d1Config,
        fileStore,
        imagePath: '/logo.png',
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
