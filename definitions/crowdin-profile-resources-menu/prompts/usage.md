# Usage

## Overview
Crowdin app with Profile Resources Menu module for user-specific functionality.
- Backend: Express.js with Crowdin Apps SDK
- Frontend: HTML/CSS/JavaScript or React JSON Schema forms
- Authentication: JWT tokens from Crowdin
- Module: Profile Resources Menu (appears in user profile menu)

## Tech Stack
- **Crowdin Apps SDK** (@crowdin/app-project-module) for Crowdin integration
- **Express.js** for server and API endpoints
- **JWT** for authentication
- **React JSON Schema forms** (optional) for declarative form generation
- **HTML/CSS/JavaScript** for custom interfaces

## Development Restrictions
- **Authentication**: Always use JWT tokens from Crowdin for API requests
- **Module Configuration**: Don't modify the profileResourcesMenu configuration structure
- **User Context**: Apps have access to user-specific data and preferences

## Project Structure

### Backend Structure
- `index.js` - Main application with Profile Resources Menu configuration
- `public/` - Static files served to the browser
- `public/index.html` - Main UI file (for custom HTML approach)
- `data/` - Metadata storage directory

### Frontend Options
1. **Custom HTML Interface**: Replace `public/index.html` with your design
2. **React JSON Schema Forms**: Use declarative form schemas (uncomment in index.js)

## Implementation Approaches

### Option 1: Custom HTML Interface
Keep the existing HTML approach and customize:
```javascript
profileResourcesMenu: {
  fileName: 'index.html',
  uiPath: __dirname + '/public'
}
```

### Option 2: React JSON Schema Forms
Use declarative forms (uncomment in index.js):
```javascript
profileResourcesMenu: {
  formSchema: {
    title: "Your App Settings",
    type: "object",
    properties: {
      preference1: {
        title: 'User Preference',
        type: 'string'
      }
    }
  },
  formUiSchema: {
    preference1: {
      "ui:help": "Help text for this preference"
    }
  },
  formGetDataUrl: '/form-data',
  formPostDataUrl: '/form-data'
}
```

## API Patterns

### Form Data Handling (JSON Schema Forms)
```javascript
// GET /form-data - Load form data
app.get('/form-data', async (req, res) => {
  const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwtToken);
  const userId = context.jwtPayload.context.user_id;
  
  // Load user preferences
  const userData = await crowdinApp.getMetadata(userId);
  
  res.json({
    formSchema: formConfiguration.formSchema,
    formUiSchema: formConfiguration.formUiSchema,
    formData: userData || {}
  });
});

// POST /form-data - Save form data
app.post('/form-data', async (req, res) => {
  const { context } = await crowdinApp.establishCrowdinConnection(req.query.jwtToken);
  const userId = context.jwtPayload.context.user_id;
  
  // Save user preferences
  await crowdinApp.saveMetadata(userId, req.body.data);
  
  res.json({ message: 'Settings saved successfully!' });
});
```

### Custom API Endpoints
```javascript
app.get('/api/user-preferences', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const userId = context.jwtPayload.context.user_id;
    
    // Your business logic here
    const preferences = await getUserPreferences(userId);
    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Profile Resources Menu Module
- Appears in user profile menu
- User-specific functionality and data
- Access to user preferences and settings
- Personal integrations and tools

## Environment Variables
Required (automatically picked up by Crowdin Apps SDK):
- `BASE_URL` - Your app's public URL
- `CROWDIN_CLIENT_ID` - Your app's client ID
- `CROWDIN_CLIENT_SECRET` - Your app's client secret

Optional:
- `APP_NAME` - Display name for your app
- `APP_IDENTIFIER` - Unique identifier
- `APP_DESCRIPTION` - App description
- `PORT` - Server port (default: 3000)

## Development Workflow
1. Choose implementation approach (HTML or JSON Schema forms)
2. Define your interface or form schema
3. Add API endpoints for your business logic
4. Use metadata storage for user preferences
5. Test with your Crowdin user account
6. Deploy and register in Crowdin Developer Console

## Common Use Cases
- User preference settings
- Personal integration configurations
- User-specific dashboards
- Personal API keys management
- Custom user workflows
- Individual reporting preferences

## React JSON Schema Forms
When using form schemas:
- Forms are automatically generated from schema
- Built-in validation and error handling
- Consistent Crowdin UI styling
- Support for complex form layouts
- Automatic form submission handling

## Security Notes
- JWT tokens contain user context information
- Store user-specific data using metadata storage
- Validate user permissions for sensitive operations
- Use HTTPS in production
- Follow Crowdin API rate limiting guidelines
