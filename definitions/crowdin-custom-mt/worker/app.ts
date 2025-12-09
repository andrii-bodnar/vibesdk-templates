import * as crowdinModule from '@crowdin/app-project-module';
import type { Client, SourceStringsModel } from '@crowdin/crowdin-api-client';
import type { AssetsConfig, CrowdinContextInfo, FileStore, Cron, ClientConfig, CrowdinAppUtilities } from '@crowdin/app-project-module/out/types';
import type { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';
import type { CustomMtString } from '@crowdin/app-project-module/out/modules/custom-mt/types';

function determineMtConfigKey(organizationId: number): string {
    return `mt_config_org_${organizationId}`;
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
        name: "Custom MT App",
        identifier: "custom-mt-app",
        description: "A Crowdin app with Custom MT engine and language mapping configuration",
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
            uiPath: '/'
        },

        // Profile Resources Menu module configuration - for Crowdin configuration UI
        profileResourcesMenu: {
            fileName: 'index.html',
            uiPath: '/'
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration) as CrowdinAppUtilities;

    return crowdinApp;
}
