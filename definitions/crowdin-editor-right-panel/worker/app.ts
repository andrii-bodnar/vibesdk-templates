import * as crowdinModule from '@crowdin/app-project-module';
import type { AssetsConfig, FileStore, Cron, ClientConfig, CrowdinAppUtilities } from '@crowdin/app-project-module/out/types';
import type { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';
import { EditorMode } from '@crowdin/app-project-module/out/types';

export function createApp({
    app,
    clientId,
    clientSecret,
    assetsConfig,
    d1Config,
    fileStore,
    cron
}: {
    app: ReturnType<typeof crowdinModule.express>;
    clientId: string;
    clientSecret: string;
    assetsConfig: AssetsConfig;
    d1Config: D1StorageConfig;
    fileStore: FileStore;
    cron: Cron;
}) {
    const configuration: ClientConfig = {
        name: "Editor Right Panel App",
        identifier: "editor-right-panel-app",
        description: "A Crowdin app built with the SDK with Editor Right Panel module",
        clientId,
        clientSecret,
        disableLogsFormatter: true,
        assetsConfig,
        d1Config,
        fileStore,
        cron,
        imagePath: '/logo.svg',
        assetsPath: '/assets',
        
        // API scopes - define what your app can access
        scopes: [
            // Add other scopes as needed
        ],
        
        // Editor Right Panel module configuration
        editorRightPanel: {
            fileName: 'index.html',
            uiPath: '/',
            modes: [EditorMode.COMFORTABLE], // Specify editor modes where panel appears
            supportsMultipleStrings: true
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration) as CrowdinAppUtilities;

    return crowdinApp;
}
