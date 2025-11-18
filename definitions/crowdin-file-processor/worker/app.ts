import * as crowdinModule from '@crowdin/app-project-module';
import { Client, SourceStringsModel } from '@crowdin/crowdin-api-client';
import { ContentFileResponse, FileImportExportContent, ProcessFileRequest, ProcessFileString, StringsFileResponse } from '@crowdin/app-project-module/out/modules/file-processing/types';
import { CrowdinContextInfo } from '@crowdin/app-project-module/out/types';
import { AssetsConfig, FileStore } from '@crowdin/app-project-module/out/types';
import { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';
import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';

// Configuration interface
interface FileProcessorConfig {
    modules: {
        preImport: boolean;
        postImport: boolean;
        preExport: boolean;
        postExport: boolean;
    };
    preImport: {
        replaceRules: Array<{ find: string; replace: string }>;
    };
    postImport: {
        replaceRules: Array<{ find: string; replace: string }>;
    };
    preExport: {
        replaceRules: Array<{ find: string; replace: string }>;
    };
    postExport: {
        replaceRules: Array<{ find: string; replace: string }>;
    };
}

// Default configuration
const defaultConfig: FileProcessorConfig = {
    modules: {
        preImport: true,
        postImport: true,
        preExport: true,
        postExport: true
    },
    preImport: {
        replaceRules: []
    },
    postImport: {
        replaceRules: []
    },
    preExport: {
        replaceRules: []
    },
    postExport: {
        replaceRules: []
    }
};

function determineConfigKey(organizationId: number): string {
    return `file_processor_config_${organizationId}`;
}

async function getConfig(organizationId: number): Promise<FileProcessorConfig> {
    const configKey = determineConfigKey(organizationId);
    const savedConfig = await crowdinModule.metadataStore.getMetadata(configKey);
    
    if (savedConfig) {
        // Merge saved config with default config to ensure all fields exist
        return {
            modules: { ...defaultConfig.modules, ...savedConfig.modules },
            preImport: { 
                replaceRules: savedConfig.preImport?.replaceRules || []
            },
            postImport: { 
                replaceRules: savedConfig.postImport?.replaceRules || []
            },
            preExport: { 
                replaceRules: savedConfig.preExport?.replaceRules || []
            },
            postExport: { 
                replaceRules: savedConfig.postExport?.replaceRules || []
            }
        };
    }
    
    return defaultConfig;
}

function applyReplaceRules(text: string, rules: Array<{ find: string; replace: string }>): string {
    let result = text;
    for (const rule of rules) {
        if (rule.find && rule.replace !== undefined) {
            try {
                const regex = new RegExp(rule.find, 'g');
                result = result.replace(regex, rule.replace);
            } catch (e) {
                console.error('Invalid regex pattern:', rule.find, e);
            }
        }
    }
    return result;
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
        name: "File Processor App",
        identifier: "file-processor-app",
        description: "A Crowdin app with configurable File Processing modules: Pre-Import, Post-Import, Pre-Export, and Post-Export",
        clientId,
        clientSecret,
        disableLogsFormatter: true,
        assetsConfig,
        d1Config,
        fileStore,
        imagePath: '/logo.png',
        
        // API scopes - define what your app can access
        scopes: [
            // Add scopes as needed
        ],
        
        /**
         * File Pre-Import Module
         * Modify files BEFORE importing them into Crowdin
         */
        filePreImport: {
            signaturePatterns: {
                fileName: "^.+\\..+$",
                fileContent: ".*"
            },
            fileProcess: async (
                _req: ProcessFileRequest,
                content: FileImportExportContent,
                _client: Client,
                context: CrowdinContextInfo,
                _projectId: number
            ): Promise<ContentFileResponse> => {
                try {
                    // Get configuration
                    const organizationId = context.jwtPayload.context.organization_id;
                    const config = await getConfig(organizationId);
                    
                    // Check if content exists
                    if (!content) {
                        return { contentFile: Buffer.from(''), error: 'No content provided' };
                    }
                    
                    // Check if module is enabled
                    if (!config.modules.preImport) {
                        return { contentFile: content as Buffer, notModified: true };
                    }
                    
                    // If no rules, skip processing
                    if (!config.preImport.replaceRules || config.preImport.replaceRules.length === 0) {
                        return { contentFile: content as Buffer, notModified: true };
                    }
                    
                    // Convert content to string for processing
                    let contentString = (content as Buffer).toString('utf-8');
                    
                    // Apply replace rules
                    contentString = applyReplaceRules(contentString, config.preImport.replaceRules);
                    
                    // Convert back to Buffer
                    const contentFile = Buffer.from(contentString, 'utf-8');
                    
                    return { contentFile };
                } catch (error) {
                    console.error('Pre-import processing error:', error);
                    return {
                        contentFile: content as Buffer,
                        error: 'Failed to process file during pre-import'
                    };
                }
            }
        },

        /**
         * File Post-Import Module
         * Modify parsed STRINGS after file import but before saving to Crowdin
         */
        filePostImport: {
            signaturePatterns: {
                fileName: "^.+\\..+$",
                fileContent: ".*"
            },
            fileProcess: async (
                _req: ProcessFileRequest,
                content: FileImportExportContent,
                _client: Client,
                context: CrowdinContextInfo,
                _projectId: number
            ): Promise<StringsFileResponse> => {
                try {
                    // Get configuration
                    const organizationId = context.jwtPayload.context.organization_id;
                    const config = await getConfig(organizationId);
                    
                    // Check if module is enabled
                    if (!config.modules.postImport) {
                        return { strings: content as ProcessFileString[], notModified: true };
                    }
                    
                    // If no rules, skip processing
                    if (!config.postImport.replaceRules || config.postImport.replaceRules.length === 0) {
                        return { strings: content as ProcessFileString[], notModified: true };
                    }
                    
                    const strings = content as ProcessFileString[];
                    
                    // Apply replace rules to string text only
                    const modifiedStrings = strings.map(str => {
                        const modified: ProcessFileString = { ...str };
                        
                        // Early return if no text
                        if (!str.text) {
                            return modified;
                        }
                        
                        // Simple string - apply rules directly
                        if (typeof str.text === 'string') {
                            modified.text = applyReplaceRules(str.text, config.postImport.replaceRules);
                            return modified;
                        }
                        
                        // Plural text - apply rules to each plural form
                        const pluralText = { ...str.text };
                        for (const key in pluralText) {
                            const pluralKey = key as keyof SourceStringsModel.PluralText;
                            if (pluralText[pluralKey]) {
                                pluralText[pluralKey] = applyReplaceRules(
                                    pluralText[pluralKey]!, 
                                    config.postImport.replaceRules
                                );
                            }
                        }
                        modified.text = pluralText;
                        
                        return modified;
                    });
                    
                    return { strings: modifiedStrings };
                } catch (error) {
                    console.error('Post-import processing error:', error);
                    return {
                        strings: content as ProcessFileString[],
                        error: 'Failed to process strings during post-import'
                    };
                }
            }
        },

        /**
         * File Pre-Export Module
         * Modify STRINGS before exporting file from Crowdin
         */
        filePreExport: {
            signaturePatterns: {
                fileName: "^.+\\..+$",
                fileContent: ".*"
            },
            fileProcess: async (
                _req: ProcessFileRequest,
                content: FileImportExportContent,
                _client: Client,
                context: CrowdinContextInfo,
                _projectId: number
            ): Promise<StringsFileResponse> => {
                try {
                    // Get configuration
                    const organizationId = context.jwtPayload.context.organization_id;
                    const config = await getConfig(organizationId);
                    
                    // Check if module is enabled
                    if (!config.modules.preExport) {
                        return { strings: content as ProcessFileString[], notModified: true };
                    }
                    
                    // If no rules, skip processing
                    if (!config.preExport.replaceRules || config.preExport.replaceRules.length === 0) {
                        return { strings: content as ProcessFileString[], notModified: true };
                    }
                    
                    const strings = content as ProcessFileString[];
                    
                    // Apply replace rules to translations
                    const modifiedStrings = strings.map(str => {
                        const modified: ProcessFileString = { ...str };
                        
                        // Early return if no translations
                        if (!str.translations) {
                            return modified;
                        }
                        
                        const modifiedTranslations = { ...str.translations };
                        
                        // Process each language
                        for (const lang in modifiedTranslations) {
                            const translation = modifiedTranslations[lang];
                            
                            // Skip if no text
                            if (!translation.text) {
                                continue;
                            }
                            
                            // Simple string - apply rules directly
                            if (typeof translation.text === 'string') {
                                translation.text = applyReplaceRules(translation.text, config.preExport.replaceRules);
                                continue;
                            }
                            
                            // Plural text - apply rules to each plural form
                            const pluralText = { ...translation.text };
                            for (const key in pluralText) {
                                const pluralKey = key as keyof SourceStringsModel.PluralText;
                                if (pluralText[pluralKey]) {
                                    pluralText[pluralKey] = applyReplaceRules(
                                        pluralText[pluralKey]!, 
                                        config.preExport.replaceRules
                                    );
                                }
                            }
                            translation.text = pluralText;
                        }
                        
                        modified.translations = modifiedTranslations;
                        return modified;
                    });
                    
                    return { strings: modifiedStrings };
                } catch (error) {
                    console.error('Pre-export processing error:', error);
                    return {
                        strings: content as ProcessFileString[],
                        error: 'Failed to process strings during pre-export'
                    };
                }
            }
        },

        /**
         * File Post-Export Module
         * Modify file content AFTER exporting from Crowdin
         */
        filePostExport: {
            signaturePatterns: {
                fileName: "^.+\\..+$",
                fileContent: ".*"
            },
            fileProcess: async (
                _req: ProcessFileRequest,
                content: FileImportExportContent,
                _client: Client,
                context: CrowdinContextInfo,
                _projectId: number
            ): Promise<ContentFileResponse> => {
                try {
                    // Get configuration
                    const organizationId = context.jwtPayload.context.organization_id;
                    const config = await getConfig(organizationId);
                    
                    // Check if content exists
                    if (!content) {
                        return { contentFile: Buffer.from(''), error: 'No content provided' };
                    }
                    
                    // Check if module is enabled
                    if (!config.modules.postExport) {
                        return { contentFile: content as Buffer, notModified: true };
                    }
                    
                    // If no rules, skip processing
                    if (!config.postExport.replaceRules || config.postExport.replaceRules.length === 0) {
                        return { contentFile: content as Buffer, notModified: true };
                    }
                    
                    // Convert content to string for processing
                    let contentString = (content as Buffer).toString('utf-8');
                    
                    // Apply replace rules
                    contentString = applyReplaceRules(contentString, config.postExport.replaceRules);
                    
                    // Convert back to Buffer
                    const contentFile = Buffer.from(contentString, 'utf-8');
                    
                    return { contentFile };
                } catch (error) {
                    console.error('Post-export processing error:', error);
                    return {
                        contentFile: content as Buffer,
                        error: 'Failed to process file during post-export'
                    };
                }
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

    // Get File Processor configuration
    app.get('/api/config', async (req: Request, res: Response) => {
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
            const config = await getConfig(organizationId);
            
            res.json({ 
                success: true, 
                config
            });
        } catch (error) {
            console.error('Error loading configuration:', error);
            res.status(500).json({ success: false, error: 'Failed to load configuration' });
        }
    });

    // Save File Processor configuration
    app.post('/api/config', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            const { config } = req.body;

            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            if (!config) {
                return res.status(400).json({ success: false, error: 'Configuration is required' });
            }
            
            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);

            if (!connection.client) {
                return res.status(500).json({ success: false, error: 'Crowdin API client not available' });
            }

            const organizationId = connection.context.jwtPayload.context.organization_id;
            const configKey = determineConfigKey(organizationId);
            
            // Merge with default config to ensure all fields exist
            const mergedConfig: FileProcessorConfig = {
                modules: { ...defaultConfig.modules, ...config.modules },
                preImport: { 
                    replaceRules: config.preImport?.replaceRules || []
                },
                postImport: { 
                    replaceRules: config.postImport?.replaceRules || []
                },
                preExport: { 
                    replaceRules: config.preExport?.replaceRules || []
                },
                postExport: { 
                    replaceRules: config.postExport?.replaceRules || []
                }
            };
            
            // Save configuration to metadata storage
            await crowdinModule.metadataStore.saveMetadata(
                configKey, 
                mergedConfig, 
                connection.context.crowdinId
            );
            
            res.json({ 
                success: true, 
                message: 'Configuration saved successfully'
            });
        } catch (error) {
            console.error('Error saving configuration:', error);
            res.status(500).json({ success: false, error: 'Failed to save configuration' });
        }
    });

    return { expressApp: app, crowdinApp };
}
