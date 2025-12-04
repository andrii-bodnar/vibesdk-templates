import * as crowdinModule from '@crowdin/app-project-module';
import type { AssetsConfig, FileStore, Cron, ClientConfig, CrowdinAppUtilities } from '@crowdin/app-project-module/out/types';
import type { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';

export function createApp({
    clientId,
    clientSecret,
    assetsConfig,
    d1Config,
    fileStore,
    cron
}: {
    clientId: string;
    clientSecret: string;
    assetsConfig: AssetsConfig;
    d1Config: D1StorageConfig;
    fileStore: FileStore;
    cron: Cron;
}) {
    const app = crowdinModule.express();

    const configuration: ClientConfig = {
        name: "Organization Menu App",
        identifier: "organization-menu-app",
        description: "A Crowdin app built with the SDK with Organization Menu module",
        clientId,
        clientSecret,
        disableLogsFormatter: true,
        assetsConfig,
        d1Config,
        fileStore,
        cron,
        imagePath: '/logo.png',
        
        // API scopes - define what your app can access
        scopes: [
            // Add other scopes as needed
        ],
        
        // Organization Menu module configuration
        organizationMenu: {
            fileName: 'index.html',
            uiPath: '/'
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration) as CrowdinAppUtilities;

    return { expressApp: app, crowdinApp };
}
