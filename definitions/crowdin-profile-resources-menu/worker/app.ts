import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Profile Resources Menu App",
        identifier: "profile-resources-menu-app",
        description: "A Crowdin app built with the SDK with Profile Resources Menu module",
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
        
        // Profile Resources Menu module configuration
        profileResourcesMenu: {
            fileName: 'index.html',
            uiPath: '/profile-resources'
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get user preferences
    app.get('/api/user-preferences', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
            const userId = connection.context.jwtPayload.context.user_id;
            const organizationId = connection.context.jwtPayload.context.organization_id;

            if (!userId) {
                return res.status(400).json({ success: false, error: 'User ID not found in context' });
            }

            // Get user preferences from metadata storage
            // Key format: org_${organizationId}_user_${userId}_preferences
            const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
            const storedPreferences = await crowdinModule.metadataStore.getMetadata(metadataKey);

            // Default preferences if none are stored
            const preferences = storedPreferences || {
                theme: 'auto',
                language: 'en',
                notifications: true,
                emailDigest: 'weekly'
            };

            res.status(200).json({ 
                success: true, 
                preferences: preferences,
                userId: userId,
                fromStorage: !!storedPreferences
            });
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch user preferences' 
            });
        }
    });

    // Save user preferences
    app.post('/api/user-preferences', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            const { preferences } = req.body;
            if (!preferences) {
                return res.status(400).json({ success: false, error: 'Preferences are required' });
            }

            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
            const userId = connection.context.jwtPayload.context.user_id;
            const organizationId = connection.context.jwtPayload.context.organization_id;

            if (!userId) {
                return res.status(400).json({ success: false, error: 'User ID not found' });
            }

            // Save preferences to metadata storage
            // Key format: org_${organizationId}_user_${userId}_preferences
            const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
            await crowdinModule.metadataStore.saveMetadata(metadataKey, preferences, connection.context.crowdinId);

            res.status(200).json({ 
                success: true, 
                message: 'Preferences saved successfully',
                userId: userId
            });
        } catch (error) {
            console.error('Error saving user preferences:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to save user preferences' 
            });
        }
    });

    // Perform user action
    app.post('/api/user-action', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            const { action, userId } = req.body;
            if (!action) {
                return res.status(400).json({ success: false, error: 'Action is required' });
            }

            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
            const actualUserId = userId || connection.context.jwtPayload.context.user_id;
            const organizationId = connection.context.jwtPayload.context.organization_id;

            if (!actualUserId) {
                return res.status(400).json({ success: false, error: 'User ID not found' });
            }

            let message = '';
            switch (action) {
                case 'update-preferences':
                    // Example: Update some preferences
                    const metadataKey = `org_${organizationId}_user_${actualUserId}_preferences`;
                    const currentPrefs = await crowdinModule.metadataStore.getMetadata(metadataKey) || {};
                    const updatedPrefs = {
                        ...currentPrefs,
                        lastUpdated: new Date().toISOString()
                    };
                    await crowdinModule.metadataStore.saveMetadata(metadataKey, updatedPrefs, connection.context.crowdinId);
                    message = `Preferences updated for user ${actualUserId}`;
                    break;
                case 'export-data':
                    message = `Data export initiated for user ${actualUserId}`;
                    break;
                case 'clear-cache':
                    // Example: Clear user metadata (delete from storage)
                    const cacheKey = `org_${organizationId}_user_${actualUserId}_preferences`;
                    await crowdinModule.metadataStore.deleteMetadata(cacheKey);
                    message = `Cache cleared for user ${actualUserId}`;
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
                userId: actualUserId
            });
        } catch (error) {
            console.error('Error performing user action:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to perform user action' 
            });
        }
    });

    return { expressApp: app, crowdinApp };
}
