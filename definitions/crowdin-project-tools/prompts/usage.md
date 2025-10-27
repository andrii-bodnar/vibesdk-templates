# Usage

## Overview
Crowdin app with Project Tools module for project-specific functionality.
- Backend: TypeScript with Express.js and Crowdin Apps SDK
- Frontend: Modular HTML/CSS/JavaScript with Crowdin Apps JS API
- Authentication: JWT tokens from Crowdin with automatic project context
- Module: Project Tools (appears in project menu)
- Features: Responsive design, error handling, empty states, accessibility

## Tech Stack
- **Crowdin Apps JS API** (AP object) for frontend integration
- **Crowdin Apps SDK** (@crowdin/app-project-module) for backend
- **TypeScript** for type-safe backend development
- **Express.js** for server and API endpoints
- **JWT** for secure authentication with project context
- **Modular Frontend** - Separate HTML, CSS (styles.css), JS (app.js) files
- **Responsive CSS** - Mobile-first design (320px+)
- **Accessibility** - WCAG 2.1, ARIA labels

## Development Restrictions
- **Authentication**: Always use JWT tokens from Crowdin for API requests
- **Module Configuration**: Don't modify the projectTools configuration structure
- **Scopes**: Ensure your app has appropriate project-level API scopes
- **Project Context**: Apps automatically receive project context from JWT

## Project Structure

### Backend Structure
- `worker/app.ts` - TypeScript backend with Project Tools configuration
- `worker/index.ts` - Entry point for Cloudflare Worker
- `public/` - Static files served to the browser

### Frontend Structure
- `public/tools/index.html` - Main HTML interface with demo UI
- `public/tools/app.js` - JavaScript with Crowdin Apps JS API integration
- `public/tools/styles.css` - Responsive CSS with accessibility support

## Project Tools Configuration

```typescript
projectTools: {
  fileName: 'index.html',
  uiPath: '/tools'  // Points to public/tools directory
}
```

### Required Scopes
Add scopes to configuration in `worker/app.ts` based on your app's functionality.

**⚠️ IMPORTANT**: Only use scopes from the list below. Do not invent or use non-existent scopes!

#### Available Scopes:
```typescript
const configuration = {
    // ... other configuration ...
    scopes: [
        // Choose from the following valid scopes:
        
        // General scopes
        crowdinModule.Scope.ALL_SCOPES,                  // 'all' - Full access (use with caution)
        crowdinModule.Scope.NOTIFICATIONS,               // 'notification' - Notifications management
        
        // Project-level scopes
        crowdinModule.Scope.PROJECTS,                    // 'project' - Project management
        crowdinModule.Scope.TASKS,                       // 'project.task' - Project tasks
        crowdinModule.Scope.REPORTS,                     // 'project.report' - Project reports
        crowdinModule.Scope.TRANSLATION_STATUS,          // 'project.status' - Translation status
        crowdinModule.Scope.SOURCE_FILES_AND_STRINGS,    // 'project.source' - Source files and strings
        crowdinModule.Scope.WEBHOOKS,                    // 'project.webhook' - Project webhooks
        crowdinModule.Scope.TRANSLATIONS,                // 'project.translation' - Translations
        crowdinModule.Scope.SCREENSHOTS,                 // 'project.screenshot' - Screenshots
        
        // Organization-level scopes
        crowdinModule.Scope.USERS,                       // 'user' - User management
        crowdinModule.Scope.TEAMS,                       // 'team' - Team management
        crowdinModule.Scope.GROUPS,                      // 'group' - Group management
        crowdinModule.Scope.ORGANIZATION_WEBHOOKS,       // 'webhook' - Organization webhooks
        crowdinModule.Scope.VENDORS,                     // 'vendor' - Vendor management
        crowdinModule.Scope.FIELDS,                      // 'field' - Custom fields
        crowdinModule.Scope.SECURITY_LOGS,               // 'security-log' - Security logs
        crowdinModule.Scope.APPLICATIONS,                // 'application' - Applications management
        
        // Resources
        crowdinModule.Scope.TRANSLATION_MEMORIES,        // 'tm' - Translation memories
        crowdinModule.Scope.MACHINE_TRANSLATION_ENGINES, // 'mt' - Machine translation engines
        crowdinModule.Scope.GLOSSARIES,                  // 'glossary' - Glossaries
        
        // AI-related scopes
        crowdinModule.Scope.AI,                          // 'ai' - AI features
        crowdinModule.Scope.AI_PROVIDERS,                // 'ai.provider' - AI providers
        crowdinModule.Scope.AI_PROMPTS,                  // 'ai.prompt' - AI prompts
        crowdinModule.Scope.AI_PROXIES,                  // 'ai.proxy' - AI proxies
    ]
}
```

## Frontend Integration (Crowdin Apps JS API)

### Initialize and Get Context
```javascript
// Frontend - app.js
function initializeApp() {
    // Get project context
    AP.getContext(function(context) {
        projectContext = context;
        // context.project_id, context.organization_id, context.user_id
    });
    
    // Get JWT token for API calls
    AP.getJwtToken(function(token) {
        jwtToken = token;
        loadProjectLanguages();  // Make API calls with token
    });
}
```

## Backend Integration

### Accessing Project Context
```typescript
// Backend - worker/app.ts  
app.get('/api/project-languages', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    const projectId = connection.context.jwtPayload.context.project_id;
    
    // Project context is automatically available
    console.log('Current project ID:', projectId);
    
    // Access project data via API client
    const projectResponse = await connection.client.projectsGroupsApi.getProject(projectId);
    res.json({ success: true, project: projectResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to access project data' });
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
        const projectId = connection.context.jwtPayload.context.project_id;
        
        // Your logic here using connection.client API
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Operation failed' });
    }
});
```

### Project Information Example
```typescript
app.get('/api/project-overview', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    const projectId = connection.context.jwtPayload.context.project_id;
    
    // Get comprehensive project information (example)
    const projectResponse = await connection.client.projectsGroupsApi.getProject(projectId);
    const targetLanguageIds = projectResponse.data.targetLanguageIds || [];
    
    // Get supported languages and filter by project
    const supportedLanguages = await connection.client.languagesApi.withFetchAll().listSupportedLanguages();
    const projectLanguages = supportedLanguages.data.filter(
      lang => targetLanguageIds.includes(lang.data.id)
    );
    
    res.json({
      success: true,
      data: {
        project: projectResponse.data,
        languages: projectLanguages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project overview' });
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

**Note**: The `identifier` must be unique across all Crowdin apps. Use format like: `company-project-tools`

### 2. Key Files to Modify
- `worker/app.ts` - Add new API endpoints here
- `public/tools/index.html` - Modify UI structure
- `public/tools/app.js` - Add frontend logic  
- `public/tools/styles.css` - Customize styles

## Crowdin API Access

Use `connection.client` to access Crowdin API methods:
```typescript
// Access any Crowdin API endpoint via connection.client
// Example: connection.client.projectsGroupsApi.getProject(projectId)
// Example: connection.client.languagesApi.withFetchAll().listSupportedLanguages()
// Use withFetchAll() for paginated results to get all data
```

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