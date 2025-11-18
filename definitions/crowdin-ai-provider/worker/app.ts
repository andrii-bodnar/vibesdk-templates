import * as crowdinModule from '@crowdin/app-project-module';
import { Client } from '@crowdin/crowdin-api-client';
import { CrowdinContextInfo, CrowdinClientRequest } from '@crowdin/app-project-module/out/types';
import { Request, Response } from 'express';
import { AiToolChoice, ChatCompletionMessage, SupportedModels, ChatCompletionChunkMessage, ChatCompletionTool, ChatCompletionResponseMessage, ChatCompletionMessageToolCall } from '@crowdin/app-project-module/out/modules/ai-provider/types';
import { ExtendedResult } from '@crowdin/app-project-module/out/modules/integration/types';
import { RateLimitError } from '@crowdin/app-project-module/out/modules/ai-provider/util';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

// Configuration storage key helper
function determineAiConfigKey(organizationId: number): string {
    return `ai_provider_config_org_${organizationId}`;
}

// AI Provider configuration interface
interface AiProviderConfig {
    apiKey?: string;
    apiEndpoint?: string;
}

// OpenAI API response types
interface OpenAIMessage {
    role: string;
    content: string;
    tool_calls?: ChatCompletionMessageToolCall[] | null;
}

interface OpenAIChoice {
    message: OpenAIMessage;
    delta?: OpenAIMessage;
}

interface OpenAIResponse {
    choices?: OpenAIChoice[];
}

interface OpenAIModel {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

interface OpenAIModelsResponse {
    object: string;
    data: OpenAIModel[];
}

// Model capabilities mapping
// This defines the capabilities for known models.
// When fetching models from OpenAI API, we'll use these capabilities if available.
// If a model is not in this list, it will use default capabilities (basic features, 4K context).
const MODEL_CAPABILITIES: Record<string, Partial<SupportedModels>> = {
    'gpt-5': {
        supportsJsonMode: true,
        supportsFunctionCalling: true,
        supportsStreaming: false, // Streaming disabled for template simplicity
        supportsVision: true,
        contextWindowLimit: 400000,
        outputLimit: 128000,
    },
    'gpt-4.1': {
        supportsJsonMode: true,
        supportsFunctionCalling: true,
        supportsStreaming: false, // Streaming disabled for template simplicity
        supportsVision: true,
        contextWindowLimit: 1047576,
        outputLimit: 32768,
    },
    'gpt-4o': {
        supportsJsonMode: true,
        supportsFunctionCalling: true,
        supportsStreaming: false, // Streaming disabled for template simplicity
        supportsVision: true,
        contextWindowLimit: 128000,
        outputLimit: 16384,
    },
    'o4-mini': {
        supportsJsonMode: true,
        supportsFunctionCalling: true,
        supportsStreaming: false, // Streaming disabled for template simplicity
        supportsVision: true,
        contextWindowLimit: 200000,
        outputLimit: 100000,
    }
};

export function createApp(env: CloudflareEnv) {
    const app = crowdinModule.express();

    const configuration = {
        name: "AI Provider App",
        identifier: "ai-provider-app",
        description: "A Crowdin app with AI Provider module for custom AI model integration",
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
            crowdinModule.Scope.PROJECTS, // Project management
            // Add other scopes as needed
        ],
        
        // AI Provider module configuration
        aiProvider: {
            // Settings UI module configuration
            settingsUiModule: {
                fileName: 'index.html',
                uiPath: '/settings'
            },

            // Get list of available AI models
            getModelsList: async ({ client: _client, context }: { client: Client; context: CrowdinContextInfo }): Promise<SupportedModels[]> => {
                const organizationId = context.jwtPayload.context.organization_id;
                
                // Load organization-specific AI configuration
                const configKey = determineAiConfigKey(organizationId);
                const config: AiProviderConfig = await crowdinModule.metadataStore.getMetadata(configKey) || {};

                // If no API key configured, return empty list
                if (!config.apiKey) {
                    console.warn('No API key configured. Returning predefined models.');
                    return [];
                }

                const apiEndpoint = config.apiEndpoint || 'https://api.openai.com/v1';

                try {
                    // Fetch available models from OpenAI API
                    const response = await fetch(`${apiEndpoint}/models`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${config.apiKey}`,
                        },
                    });

                    if (!response.ok) {
                        console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
                        // Fallback to empty list
                        return [];
                    }

                    const data = await response.json() as OpenAIModelsResponse;

                    const models: SupportedModels[] = data.data
                        .map(model => {
                            // Use predefined capabilities if available, otherwise use defaults
                            const capabilities = MODEL_CAPABILITIES[model.id] || {
                                supportsJsonMode: false,
                                supportsFunctionCalling: false,
                                supportsStreaming: false,
                                supportsVision: false,
                                contextWindowLimit: 4096,
                                outputLimit: 4096,
                            };

                            return {
                                id: model.id,
                                ...capabilities,
                            };
                        });

                    return models;
                } catch (error) {
                    console.error('Error fetching models from OpenAI API:', error);
                    // Fallback to empty list on error
                    return [];
                }
            },

            // Handle chat completion requests
            chatCompletions: async ({
                messages,
                model,
                action: _action,
                responseFormat,
                client: _client,
                context,
                req: _req,
                isStream: _isStream,
                sendEvent: _sendEvent,
                tools,
                toolChoice,
            }: {
                messages: ChatCompletionMessage[];
                model: string;
                action: string;
                responseFormat: string;
                client: Client;
                context: CrowdinContextInfo;
                req: CrowdinClientRequest;
                isStream: boolean;
                sendEvent: (chunk: ChatCompletionChunkMessage) => Promise<void>;
                tools?: ChatCompletionTool[];
                toolChoice?: string | AiToolChoice;
            }): Promise<ChatCompletionResponseMessage[] | ExtendedResult<ChatCompletionResponseMessage[]> | void> => {
                const organizationId = context.jwtPayload.context.organization_id;

                // Load organization-specific AI configuration
                const configKey = determineAiConfigKey(organizationId);
                const config: AiProviderConfig = await crowdinModule.metadataStore.getMetadata(configKey) || {};

                if (!config.apiKey) {
                    throw new Error('OpenAI API key is not configured. Please configure it in the app settings.');
                }

                const apiEndpoint = config.apiEndpoint || 'https://api.openai.com/v1';

                // Prepare OpenAI request body
                // Note: Streaming is disabled for template simplicity
                const requestBody: Record<string, unknown> = {
                    model,
                    messages,
                    stream: false,
                };

                // Add optional parameters
                if (responseFormat) {
                    requestBody.response_format = { type: responseFormat };
                }
                if (tools && tools.length > 0) {
                    requestBody.tools = tools;
                }
                if (toolChoice) {
                    requestBody.tool_choice = toolChoice;
                }

                // Non-streaming response only (streaming disabled for simplicity)
                try {
                    const response = await fetch(`${apiEndpoint}/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${config.apiKey}`,
                        },
                        body: JSON.stringify(requestBody),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        // Handle rate limit errors specifically
                        if (response.status === 429) {
                            throw new RateLimitError({
                                message: 'OpenAI API rate limit reached. Please try again later.',
                                error: new Error(errorText)
                            });
                        }
                        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
                    }

                    const data = await response.json() as OpenAIResponse;
                    const message = data.choices?.[0]?.message;

                    if (!message) {
                        throw new Error('No message in OpenAI response');
                    }

                    return [{
                        role: 'assistant',
                        content: message.content || '',
                        tool_calls: message.tool_calls,
                    }];
                } catch (error) {
                    console.error('Error in non-streaming response:', error);
                    throw error;
                }
            }
        },
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get AI Provider configuration
    app.get('/api/ai-config', async (req: Request, res: Response) => {
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
            const configKey = determineAiConfigKey(organizationId);
            
            // Get configuration from metadata storage
            const config = await crowdinModule.metadataStore.getMetadata(configKey);
            
            res.json({ 
                success: true, 
                config: config || { apiKey: '', apiEndpoint: '' }
            });
        } catch (error) {
            console.error('Error loading configuration:', error);
            res.status(500).json({ success: false, error: 'Failed to load configuration' });
        }
    });

    // Save AI Provider configuration
    app.post('/api/ai-config', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            const { apiKey, apiEndpoint } = req.body;

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
            const configKey = determineAiConfigKey(organizationId);
            
            // Save configuration to metadata storage
            const configData: AiProviderConfig = {
                apiKey: apiKey || '',
                apiEndpoint: apiEndpoint || '',
            };
            
            await crowdinModule.metadataStore.saveMetadata(
                configKey, 
                configData, 
                connection.context.crowdinId
            );
            
            res.json({ 
                success: true, 
                message: 'AI Provider configuration saved successfully'
            });
        } catch (error) {
            console.error('Error saving configuration:', error);
            res.status(500).json({ success: false, error: 'Failed to save configuration' });
        }
    });

    return { expressApp: app, crowdinApp };
}

