import { env } from 'cloudflare:workers';
import { AuthenticationType } from '@crowdin/app-project-module/out/types';
import * as crowdinModule from '@crowdin/app-project-module';
import { Request, Response } from 'express';

export function createApp() {
    const app = crowdinModule.express();

    // TODO: Define your form schema for React JSON Schema forms
    const formConfiguration = {
        formSchema: {
        title: "Profile Resources Menu App",
        description: "Configure your profile resources settings",
        type: "object",
        required: ["setting1"],
        properties: {
            setting1: {
            title: 'Example Setting',
            type: 'string',
            description: 'This is an example setting'
            },
            // TODO: Add your form fields here
        }
        },
        formUiSchema: {
        setting1: {
            "ui:help": "This is help text for the example setting"
        }
        // TODO: Add UI schema customizations here
        },
        formGetDataUrl: '/form-data',
        formPostDataUrl: '/form-data',
    };

    const configuration = {
        baseUrl: 'http://localhost:3000',
        name: "Profile Resources Menu App",
        identifier: "profile-resources-menu-app",
        description: "A Crowdin app built with the SDK with Profile Resources Menu module",
        authenticationType: AuthenticationType.NONE,
        disableLogsFormatter: true,
        enableStatusPage: {
            database: false,
            filesystem: false
        },
        assets: env.ASSETS as any,
        d1Config: {
            database: env.DB as any,
        },
        imagePath: '/logo.svg',
        
        // Profile Resources Menu module configuration
        // Choose one approach:
        
        // Option 1: Simple HTML interface
        profileResourcesMenu: {
            fileName: 'index.html',
            uiPath: '/profile-resources-menu'
        }
        
        // Option 2: React JSON Schema forms (uncomment to use)
        // profileResourcesMenu: formConfiguration
    };

    // Initialize Crowdin app
    crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Form data endpoints (for React JSON Schema forms)
    app.get('/form-data', async (req: Request, res: Response) => {
        try {
            // TODO: Fetch and return form data
            const formData = {
                setting1: 'default value'
                // Add your form data here
            };
            
            res.status(200).json({
                formSchema: formConfiguration.formSchema,
                formUiSchema: formConfiguration.formUiSchema,
                formData: formData
            });
        } catch (error) {
            console.error('Error fetching form data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    app.post('/form-data', async (req: Request, res: Response) => {
        try {
            const formData = req.body.data;
            
            // TODO: Process and save form data
            console.log('Form data received:', formData);
            
            res.status(200).json({ 
                message: 'Settings saved successfully!',
                success: true 
            });
        } catch (error) {
            console.error('Error saving form data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return app;
}
