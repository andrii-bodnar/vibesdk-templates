# Usage

## Overview
Crowdin app with Profile Resources Menu module for user-specific functionality.
- Backend: TypeScript with Express.js and Crowdin Apps SDK
- Frontend: Modular HTML/CSS/JavaScript with Crowdin Apps JS API
- Authentication: JWT tokens from Crowdin with automatic user context
- Module: Profile Resources Menu (appears in user profile menu)
- Storage: Built-in metadata storage for user preferences (saveMetadata, getMetadata, deleteMetadata)
- Features: Responsive design, error handling, empty states, accessibility

## Tech Stack
- **Crowdin Apps JS API** (AP object) for frontend integration
- **Crowdin Apps SDK** (@crowdin/app-project-module) for backend
- **TypeScript** for type-safe backend development
- **Express.js** for server and API endpoints
- **JWT** for secure authentication with user context
- **Modular Frontend** - Separate HTML, CSS (styles.css), JS (app.js) files
- **Responsive CSS** - Mobile-first design (320px+)
- **Accessibility** - WCAG 2.1, ARIA labels

## Development Restrictions
- **Authentication**: Always use JWT tokens from Crowdin for API requests
- **Module Configuration**: Don't modify the profileResourcesMenu configuration structure
- **Scopes**: Ensure your app has appropriate user-level API scopes
- **User Context**: Apps automatically receive user context from JWT

## Project Structure

### Backend Structure
- `worker/app.ts` - TypeScript backend with Profile Resources Menu configuration
- `worker/index.ts` - Entry point for Cloudflare Worker
- `public/` - Static files served to the browser

### Frontend Structure
- `public/profile-resources/index.html` - Main HTML interface with demo UI
- `public/profile-resources/app.js` - JavaScript with Crowdin Apps JS API integration
- `public/profile-resources/styles.css` - Responsive CSS with accessibility support

## Profile Resources Menu Configuration

```typescript
profileResourcesMenu: {
  fileName: 'index.html',
  uiPath: '/profile-resources'  // Points to public/profile-resources directory
}
```

### Required Scopes
Add scopes to configuration in `worker/app.ts` based on your app's functionality:
```typescript
const configuration = {
    // ... other configuration ...
    scopes: [
        crowdinModule.Scope.PROJECTS,        // Project management
        // Add other scopes as needed
    ]
}
```

## Frontend Integration (Crowdin Apps JS API)

### Initialize and Get Context
```javascript
// Frontend - app.js
function initializeApp() {
    // Get user context
    AP.getContext(function(context) {
        userContext = context;
        // context.user_id, context.organization_id
    });
    
    // Get JWT token for API calls
    AP.getJwtToken(function(token) {
        jwtToken = token;
        loadUserPreferences();  // Make API calls with token
    });
}
```

## Backend Integration

### Accessing User Context
```typescript
// Backend - worker/app.ts  
app.get('/api/user-preferences', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    const userId = connection.context.jwtPayload.context.user_id;
    const organizationId = connection.context.jwtPayload.context.organization_id;
    
    // User context is automatically available
    console.log('Current user ID:', userId);
    console.log('Organization ID:', organizationId);
    
    // Access user data from metadata storage
    // IMPORTANT: Include organizationId in key to isolate data per org
    const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
    const preferences = await crowdinApp.getMetadata(metadataKey);
    
    res.json({ success: true, preferences: preferences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to access user data' });
  }
});
```

### Available Context Information
```typescript
context.project_id             // Current project ID (number)
context.user_id                // Current user ID (number)
context.organization_id        // Organization ID (number)
context.organization_domain    // Organization domain (string | null)
context.invite_restrict_enabled // Invite restrictions flag (boolean)
context.user_login             // User login/username (string)
context.project_identifier     // Project identifier (string)
```

## API Patterns

### Standard Endpoint Template
```typescript
app.get('/api/your-endpoint', async (req: Request, res: Response) => {
    try {
        const jwt = req.query.jwt as string;
        if (!jwt) {
            return res.status(400).json({ success: false, error: 'JWT token is required' });
        }
        
        const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
        const userId = connection.context.jwtPayload.context.user_id;
        
        // Your logic here using connection.client API or user storage
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Operation failed' });
    }
});
```

### User Preferences with Storage Example
```typescript
// GET - Load user preferences from metadata storage
app.get('/api/user-preferences', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    const userId = connection.context.jwtPayload.context.user_id;
    const organizationId = connection.context.jwtPayload.context.organization_id;
    
    // Load from metadata storage with organization-scoped key
    const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
    const storedPreferences = await crowdinApp.getMetadata(metadataKey);
    
    // Default preferences if none stored
    const preferences = storedPreferences || {
        theme: 'auto',
        language: 'en',
        notifications: true,
        emailDigest: 'weekly'
    };
    
    res.json({
      success: true,
      preferences: preferences,
      fromStorage: !!storedPreferences
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// POST - Save user preferences to metadata storage
app.post('/api/user-preferences', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const { preferences } = req.body;
    
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    const userId = connection.context.jwtPayload.context.user_id;
    const organizationId = connection.context.jwtPayload.context.organization_id;
    
    // Save to metadata storage with organization-scoped key
    const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
    await crowdinApp.saveMetadata(metadataKey, preferences, String(organizationId));
    
    res.json({
      success: true,
      message: 'Preferences saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save user preferences' });
  }
});
```

### Adding New Endpoints to app.ts
Add new endpoints after the existing ones, before the return statement:
```typescript
// Add this AFTER existing endpoints in createApp function
app.post('/api/your-new-endpoint', async (req: Request, res: Response) => {
    // Your implementation following the standard template
});

// IMPORTANT: Add endpoints BEFORE this return statement:
return { expressApp: app, crowdinApp };
```

## Development Workflow

### 1. Configure Your App Identity
**⚠️ Important**: You MUST update the configuration in `worker/app.ts` before deployment:
```typescript
const configuration = {
    name: "Your App Name",           // Change this to your app's display name
    identifier: "your-app-id",       // Change to unique identifier (lowercase, hyphens)
    description: "Your app description", // Change to describe your app's purpose
    // ... rest of configuration
}
```

**Note**: The `identifier` must be unique across all Crowdin apps. Use format like: `company-profile-menu`

### 2. Key Files to Modify
- `worker/app.ts` - Add new API endpoints here
- `public/profile-resources/index.html` - Modify UI structure
- `public/profile-resources/app.js` - Add frontend logic  
- `public/profile-resources/styles.css` - Customize styles

## Crowdin API Access

Use `connection.client` to access Crowdin API methods:
```typescript
// Access any Crowdin API endpoint via connection.client
// Example: connection.client.usersApi.getAuthenticatedUser()
// Example: connection.client.projectsGroupsApi.withFetchAll().listProjects()
// Use withFetchAll() for paginated results to get all data
```

## Storage API (Metadata)

Profile Resources Menu apps can store user-specific data using the Crowdin Apps SDK Storage API:

### Save User Preferences
```typescript
// Save metadata for a specific user in organization
// Key format includes organizationId to isolate data per organization
const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
const preferences = {
    theme: 'dark',
    language: 'en',
    notifications: true
};

await crowdinApp.saveMetadata(
    metadataKey,              // Unique key for this data
    preferences,              // Data to store (any serializable object)
    String(organizationId)    // Organization ID from context
);
```

### Load User Preferences
```typescript
// Retrieve metadata
const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
const storedPreferences = await crowdinApp.getMetadata(metadataKey);

// Returns null if no data stored
const preferences = storedPreferences || defaultPreferences;
```

### Delete User Preferences
```typescript
// Remove metadata
const metadataKey = `org_${organizationId}_user_${userId}_preferences`;
await crowdinApp.deleteMetadata(metadataKey);
```

### Storage Best Practices
- **Key Format**: Always include organizationId and userId: `org_${organizationId}_user_${userId}_preferences`
- **Isolation**: This ensures data is isolated per organization (same user can have different prefs in different orgs)
- **Descriptive Keys**: Use clear naming: `_preferences`, `_settings`, `_cache`
- Store only necessary data to minimize storage usage
- Include timestamps for tracking when data was last updated
- Handle cases when data doesn't exist (returns `null`)
- Use organization ID for the third parameter in `saveMetadata()`

## Frontend Patterns

### Making API Calls from Frontend
```javascript
async function callBackendAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${endpoint}?jwt=${jwtToken}`, options);
    return response.json();
}
```

### Updating UI with Results
```javascript
function updateUI(elementId, content) {
    const element = document.getElementById(elementId);
    element.innerHTML = content;
    element.className = ''; // Remove loading class
}
```