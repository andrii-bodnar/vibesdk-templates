const crowdinModule = require('@crowdin/app-project-module');
const bodyParser = require('body-parser');

const app = crowdinModule.express();
app.use(bodyParser.json());

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
  name: process.env.APP_NAME || 'Profile Resources Menu App',
  identifier: process.env.APP_IDENTIFIER || 'profile-resources-menu-app',
  description: process.env.APP_DESCRIPTION || 'A Crowdin app with Profile Resources Menu module',
  dbFolder: __dirname + '/data',
  imagePath: __dirname + '/logo.svg',
  
  // Profile Resources Menu module configuration
  // Choose one approach:
  
  // Option 1: Simple HTML interface
  profileResourcesMenu: {
    fileName: 'index.html',
    uiPath: __dirname + '/public'
  }
  
  // Option 2: React JSON Schema forms (uncomment to use)
  // profileResourcesMenu: formConfiguration
};

// Initialize Crowdin app
const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);
const metadataStore = crowdinModule.metadataStore;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Form data endpoints (for React JSON Schema forms)
app.get('/form-data', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwtToken);
    
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

app.post('/form-data', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwtToken);
    const formData = req.body.data;
    
    // TODO: Process and save form data
    console.log('Form data received:', formData);
    
    // Example: Save to metadata store
    await crowdinApp.saveMetadata(context.jwtPayload.context.user_id, formData);
    
    res.status(200).json({ 
      message: 'Settings saved successfully!',
      success: true 
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Add your custom API endpoints here
// Example:
// app.get('/api/user-settings', async (req, res) => {
//   try {
//     const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
//     // Your business logic here
//     res.status(200).json({ success: true, data: [] });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crowdin app "${configuration.name}" is running on port ${PORT}`);
  console.log(`Profile Resources Menu module enabled`);
});

module.exports = { app, crowdinApp, metadataStore };
