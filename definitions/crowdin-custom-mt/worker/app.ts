import * as crowdinModule from '@crowdin/app-project-module';
import { Client, SourceStringsModel } from '@crowdin/crowdin-api-client';
import { AssetsConfig, CrowdinContextInfo, FileStore } from '@crowdin/app-project-module/out/types';
import { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';
import type { CustomMtString } from '@crowdin/app-project-module/out/modules/custom-mt/types';
import { Request, Response } from 'express';

function determineMtConfigKey(organizationId: number): string {
    return `mt_config_org_${organizationId}`;
}

// Validate language mapping configuration
function validateLanguageMapping(languageMapping: unknown): { valid: boolean; error?: string } {
    if (!languageMapping || typeof languageMapping !== 'object') {
        return { valid: false, error: 'Language mapping must be an object' };
    }

    if (Array.isArray(languageMapping)) {
        return { valid: false, error: 'Language mapping must be an object, not an array' };
    }

    const entries = Object.entries(languageMapping);
    
    if (entries.length === 0) {
        return { valid: true }; // Empty mapping is valid
    }

    for (const [fromLang, toLang] of entries) {
        // Check if keys and values are non-empty strings
        if (typeof fromLang !== 'string' || !fromLang.trim()) {
            return { valid: false, error: 'Language codes must be non-empty strings' };
        }

        if (typeof toLang !== 'string' || !toLang.trim()) {
            return { valid: false, error: 'Language codes must be non-empty strings' };
        }

        // Check if mapping to itself
        if (fromLang === toLang) {
            return { valid: false, error: `Cannot map language to itself: ${fromLang} -> ${toLang}` };
        }
    }

    return { valid: true };
}

// Helper function to extract source text from CustomMtString
function extractSourceText(string: CustomMtString): string {
    // Simple string
    if (typeof string === 'string') {
        return string;
    }
    
    const text = string.text;
    
    // Singular string
    if (typeof text === 'string') {
        return text;
    }

    // Plural string - extract specific form
    if (string.pluralForm && text[string.pluralForm as keyof SourceStringsModel.PluralText]) {
        return text[string.pluralForm as keyof SourceStringsModel.PluralText] as string;
    }
    
    // Fallback to empty string
    return '';
}

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
        name: "Custom MT App",
        identifier: "custom-mt-app",
        description: "A Crowdin app with Custom MT engine and language mapping configuration",
        clientId,
        clientSecret,
        disableLogsFormatter: true,
        assetsConfig,
        d1Config,
        fileStore,
        imagePath: '/logo.png',
        
        // API scopes - define what your app can access
        scopes: [
            crowdinModule.Scope.PROJECTS, // Project management
            // Add other scopes as needed
        ],
        
        // Custom MT module configuration
        customMT: {
            // When true, strings will be received as objects with context
            withContext: true,

            // The maximum quantity of strings that can be sent to the Custom MT app in one request
            batchSize: 100,
            
            // Main translation function
            translate: async (
                client: Client,
                context: CrowdinContextInfo,
                projectId: number,
                sourceLanguage: string,
                targetLanguage: string,
                strings: CustomMtString[]
            ): Promise<string[]> => {
                const organizationId = context.jwtPayload.context.organization_id;

                // Load organization-specific language mapping configuration
                const configKey = determineMtConfigKey(organizationId);
                const config = await crowdinModule.metadataStore.getMetadata(configKey);

                const languageMapping: Record<string, string> = config?.languageMapping || {};

                // Check if target language is mapped to the source language
                // If mapped, return source texts as translations (for language dialects)
                if (languageMapping[targetLanguage] === sourceLanguage) {
                    return strings.map(string => extractSourceText(string));
                }

                // No matching mapping configured - return empty translations
                return strings.map(() => '');
            }
        },
        
        // Organization Menu module configuration - for Enterprise configuration UI
        organizationMenu: {
            fileName: 'index.html',
            uiPath: '/menu'
        },

        // Profile Resources Menu module configuration - for Crowdin configuration UI
        profileResourcesMenu: {
            fileName: 'index.html',
            uiPath: '/menu'
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get MT configuration
    app.get('/api/mt-config', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }
            
            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);

            if (!connection.client) {
                return res.status(500).json({ success: false, error: 'Crowdin API client not available' });
            }

            const organizationId = connection.context.jwtPayload.context.organization_id;
            const configKey = determineMtConfigKey(organizationId);
            
            // Get configuration from metadata storage
            const config = await crowdinModule.metadataStore.getMetadata(configKey);
            
            res.json({ 
                success: true, 
                config: config || { languageMapping: {} }
            });
        } catch (error) {
            console.error('Error loading configuration:', error);
            res.status(500).json({ success: false, error: 'Failed to load configuration' });
        }
    });

    // Save MT configuration
    app.post('/api/mt-config', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            const { languageMapping } = req.body;

            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            // Validate language mapping before saving
            const validation = validateLanguageMapping(languageMapping);
            if (!validation.valid) {
                return res.status(400).json({ 
                    success: false, 
                    error: validation.error || 'Invalid language mapping configuration'
                });
            }
            
            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);

            if (!connection.client) {
                return res.status(500).json({ success: false, error: 'Crowdin API client not available' });
            }

            const organizationId = connection.context.jwtPayload.context.organization_id;
            const configKey = determineMtConfigKey(organizationId);
            
            // Save configuration to metadata storage
            const configData = {
                languageMapping: languageMapping || {},
            };
            
            await crowdinModule.metadataStore.saveMetadata(
                configKey, 
                configData, 
                connection.context.crowdinId
            );
            
            const mappingCount = Object.keys(languageMapping || {}).length;
            
            res.json({ 
                success: true, 
                message: `Configuration saved successfully. ${mappingCount} language mapping(s) configured.`
            });
        } catch (error) {
            console.error('Error saving configuration:', error);
            res.status(500).json({ success: false, error: 'Failed to save configuration' });
        }
    });

    return { expressApp: app, crowdinApp };
}
