# Usage

## Overview
Crowdin app with Organization Menu module for organization-wide functionality.
- Backend: TypeScript with Express.js and Crowdin Apps SDK
- Frontend: Modular HTML/CSS/JavaScript with Crowdin Apps JS API
- Authentication: JWT tokens from Crowdin with automatic organization context
- Module: Organization Menu (appears in organization navigation)
- Features: Responsive design, error handling, empty states, accessibility

## Tech Stack
- **Crowdin Apps JS API** (AP object) for frontend integration
- **Crowdin Apps SDK** (@crowdin/app-project-module) for backend
- **TypeScript** for type-safe backend development
- **Express.js** for server and API endpoints
- **JWT** for secure authentication with organization context
- **Modular Frontend** - Separate HTML, CSS (styles.css), JS (app.js) files
- **Responsive CSS** - Mobile-first design (320px+)
- **Accessibility** - WCAG 2.1, ARIA labels

## Development Restrictions
- **Authentication**: Always use JWT tokens from Crowdin for API requests
- **Module Configuration**: Don't modify the organizationMenu configuration structure
- **Scopes**: Ensure your app has appropriate organization-level API scopes
- **Organization Context**: Apps automatically receive organization context from JWT

## Project Structure

### Backend Structure
- `worker/app.ts` - TypeScript backend with Organization Menu configuration
- `worker/index.ts` - Entry point for Cloudflare Worker
- `public/` - Static files served to the browser

### Frontend Structure
- `public/organization-menu/index.html` - Main HTML interface with demo UI
- `public/organization-menu/app.js` - JavaScript with Crowdin Apps JS API integration
- `public/organization-menu/styles.css` - Responsive CSS with accessibility support

## Organization Menu Configuration

```typescript
organizationMenu: {
  fileName: 'index.html',
  uiPath: '/organization-menu'  // Points to public/organization-menu directory
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
    // Get organization context
    AP.getContext(function(context) {
        orgContext = context;
        // context.organization_id, context.user_id
    });
    
    // Get JWT token for API calls
    AP.getJwtToken(function(token) {
        jwtToken = token;
        loadProjectsByGroups();  // Make API calls with token
    });
}
```

## Backend Integration

### Accessing Organization Context
```typescript
// Backend - worker/app.ts  
app.get('/api/projects-by-groups', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    const organizationId = connection.context.jwtPayload.context.organization_id;
    
    // Organization context is automatically available
    console.log('Current organization ID:', organizationId);
    
    // Access organization data via API client
    const groupsResponse = await connection.client.projectsGroupsApi.withFetchAll().listGroups();
    res.json({ success: true, groups: groupsResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to access organization data' });
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
        const organizationId = connection.context.jwtPayload.context.organization_id;
        
        // Your logic here using connection.client API
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Operation failed' });
    }
});
```

### Organization Groups and Projects Example
```typescript
app.get('/api/projects-by-groups', async (req, res) => {
  try {
    const jwt = req.query.jwt as string;
    const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);
    
    // Get all groups
    const groupsResponse = await connection.client.projectsGroupsApi.withFetchAll().listGroups();
    const groups = groupsResponse.data.map((item: any) => ({
        id: item.data.id,
        name: item.data.name,
        description: item.data.description || '',
        projects: []
    }));
    
    // Get all projects
    const projectsResponse = await connection.client.projectsGroupsApi.withFetchAll().listProjects();
    const allProjects = projectsResponse.data.map((item: any) => ({
        id: item.data.id,
        name: item.data.name,
        groupId: item.data.groupId
    }));
    
    // Organize projects by groups
    // ... your organization logic ...
    
    res.json({
      success: true,
      data: { groups, ungroupedProjects }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects by groups' });
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

**Note**: The `identifier` must be unique across all Crowdin apps. Use format like: `company-organization-menu`

### 2. Key Files to Modify
- `worker/app.ts` - Add new API endpoints here
- `public/organization-menu/index.html` - Modify UI structure
- `public/organization-menu/app.js` - Add frontend logic  
- `public/organization-menu/styles.css` - Customize styles

## Crowdin API Access

Use `connection.client` to access Crowdin API methods:
```typescript
// Access any Crowdin API endpoint via connection.client
// Example: connection.client.projectsGroupsApi.listGroups()
// Example: connection.client.projectsGroupsApi.withFetchAll().listProjects()
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