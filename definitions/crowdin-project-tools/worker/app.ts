import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Project Tools App",
        identifier: "project-tools-app",
        description: "A Crowdin app built with the SDK with Project Tools module",
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
        // ⚠️ Do not modify this configuration
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
        
        // API scopes - define what your app can access
        scopes: [
            crowdinModule.Scope.PROJECTS,        // Project management
            // Add other scopes as needed
        ],
        
        // Project Tools module configuration
        projectTools: {
            fileName: 'index.html',
            uiPath: '/tools'
        },
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get project languages
    app.get('/api/project-languages', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
            const projectId = connection.context.jwtPayload.context.project_id;

            if (!projectId) {
                return res.status(400).json({ success: false, error: 'Project ID not found in context' });
            }

            if (!connection.client) {
                return res.status(500).json({ success: false, error: 'Crowdin API client not available' });
            }

            const projectResponse = await connection.client.projectsGroupsApi.getProject(projectId);
            const targetLanguageIds = projectResponse.data.targetLanguageIds || [];
            
            const supportedLanguagesResponse = await connection.client.languagesApi.withFetchAll().listSupportedLanguages();
            const allLanguages = supportedLanguagesResponse.data;
            
            const languages = allLanguages
                .filter((lang: { data: { id: string } }) => targetLanguageIds.includes(lang.data.id))
                .map((lang: { data: { id: string; name: string } }) => ({
                    id: lang.data.id,
                    name: lang.data.name
                }));

            res.status(200).json({ 
                success: true, 
                languages 
            });
        } catch (error) {
            console.error('Error fetching project languages:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch project languages' 
            });
        }
    });

    // Perform project action
    app.post('/api/project-action', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            const { action, projectId } = req.body;
            if (!action) {
                return res.status(400).json({ success: false, error: 'Action is required' });
            }

            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
            const actualProjectId = projectId || connection.context.jwtPayload.context.project_id;

            if (!actualProjectId) {
                return res.status(400).json({ success: false, error: 'Project ID not found' });
            }

            let message = '';
            switch (action) {
                case 'analyze':
                    message = `Project analysis completed for project ${actualProjectId}`;
                    break;
                case 'export':
                    message = `Export initiated for project ${actualProjectId}`;
                    break;
                case 'sync':
                    message = `Synchronization started for project ${actualProjectId}`;
                    break;
                case 'report':
                    message = `Report generation started for project ${actualProjectId}`;
                    break;
                default:
                    return res.status(400).json({ 
                        success: false, 
                        error: `Unknown action: ${action}` 
                    });
            }

            res.status(200).json({ 
                success: true, 
                message,
                action,
                projectId: actualProjectId
            });
        } catch (error) {
            console.error('Error performing project action:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to perform project action' 
            });
        }
    });

    return { expressApp: app, crowdinApp };
}
