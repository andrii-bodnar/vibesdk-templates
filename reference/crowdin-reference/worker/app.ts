import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Crowdin App",
        identifier: "crowdin-app",
        description: "A Crowdin app built with the SDK",
        clientId: env.CROWDIN_CLIENT_ID,
        clientSecret: env.CROWDIN_CLIENT_SECRET,
        disableLogsFormatter: true,
        assetsConfig: {
            fetcher: env.ASSETS,
        },
        d1Config: {
            database: env.DB,
        },
        fileStore: {
            getFile: async (fileId: string): Promise<Buffer> => {
                const data = await env.KVStore.get(fileId, 'arrayBuffer');
                if (!data) {
                    throw new Error(`File not found: ${fileId}`);
                }
                return Buffer.from(data);
            },
            storeFile: async (content: Buffer): Promise<string> => {
                const fileId = `file_${crypto.randomUUID()}`;
                await env.KVStore.put(fileId, content, { expirationTtl: 86400 });
                return fileId;
            },
            deleteFile: async (fileId: string): Promise<void> => {
                await env.KVStore.delete(fileId);
            }
        },
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
