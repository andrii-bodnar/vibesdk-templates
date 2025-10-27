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

### Official Documentation
The `connection.client` object is an instance of `@crowdin/crowdin-api-client`.

**📚 Complete API Reference:** https://crowdin.github.io/crowdin-api-client-js/modules.html

**⚠️ CRITICAL**: Only use methods documented in the official API reference. Do NOT invent or assume methods exist.

### Available API Modules

The `connection.client` provides access to these API modules:

```typescript
connection.client.projectsGroupsApi      // Projects and groups management
connection.client.languagesApi           // Languages operations
connection.client.sourceFilesApi         // Source files management
connection.client.sourceStringsApi       // Source strings operations
connection.client.translationsApi        // Translations operations
connection.client.stringTranslationsApi  // String translations
connection.client.translationStatusApi   // Translation status/progress
connection.client.reportsApi             // Reports generation
connection.client.tasksApi               // Tasks management
connection.client.glossariesApi          // Glossaries operations
connection.client.translationMemoryApi   // Translation memory (TM)
connection.client.machineTranslationApi  // Machine translation engines
connection.client.usersApi               // Users management
connection.client.teamsApi               // Teams management
connection.client.webhooksApi            // Webhooks management
connection.client.screenshotsApi         // Screenshots management
connection.client.labelsApi              // Labels operations
connection.client.notificationsApi       // Notifications
// ... and more - see official docs
```

### Response Structure

**ALL** Crowdin API methods return responses wrapped in `ResponseObject` or `ResponseList`:

#### Single Item Response (ResponseObject)
```typescript
interface ResponseObject<T> {
  data: T;  // The actual data is in .data property
}

// Example: Getting a project
const response = await connection.client.projectsGroupsApi.getProject(projectId);
// ❌ WRONG: response.id, response.name
// ✅ CORRECT: response.data.id, response.data.name

const projectId = response.data.id;
const projectName = response.data.name;
const targetLanguageIds = response.data.targetLanguageIds;
```

#### List Response (ResponseList)
```typescript
interface ResponseList<T> {
  data: Array<ResponseObject<T>>;  // Array of ResponseObject items
  pagination?: Pagination;
}

// Example: Listing projects
const response = await connection.client.projectsGroupsApi.listProjects();
// ❌ WRONG: response[0].name
// ✅ CORRECT: response.data[0].data.name

response.data.forEach((item: ResponseObject<ProjectModel>) => {
  const projectId = item.data.id;
  const projectName = item.data.name;
});
```

### Pagination with withFetchAll()

For paginated endpoints, use `withFetchAll()` to automatically fetch all pages:

```typescript
// Without withFetchAll() - returns only first page (25 items by default)
const firstPage = await connection.client.languagesApi.listSupportedLanguages();

// With withFetchAll() - fetches ALL pages automatically
const allPages = await connection.client.languagesApi.withFetchAll().listSupportedLanguages();
// Returns: ResponseList with ALL items in .data array

// Accessing data from withFetchAll()
allPages.data.forEach((item: ResponseObject<Language>) => {
  const languageId = item.data.id;      // e.g., "uk"
  const languageName = item.data.name;  // e.g., "Ukrainian"
});
```

### Common API Examples

#### 1. Get Project Details
```typescript
const response = await connection.client.projectsGroupsApi.getProject(projectId);

// Access project properties
const project = response.data;
const projectName = project.name;                    // string
const sourceLanguageId = project.sourceLanguageId;   // string
const targetLanguageIds = project.targetLanguageIds; // string[]
const description = project.description;             // string | null
```

#### 2. List All Projects (with pagination)
```typescript
const response = await connection.client.projectsGroupsApi.withFetchAll().listProjects();

// Iterate through all projects
response.data.forEach((projectItem: ResponseObject<ProjectsGroupsModel.Project>) => {
  const projectId = projectItem.data.id;
  const projectName = projectItem.data.name;
  const groupId = projectItem.data.groupId; // number | null
});
```

#### 3. Get Supported Languages
```typescript
const response = await connection.client.languagesApi.withFetchAll().listSupportedLanguages();

// Filter languages
const targetLanguageIds = ['uk', 'pl', 'de'];
const projectLanguages = response.data.filter(
  (lang: ResponseObject<LanguagesModel.Language>) => targetLanguageIds.includes(lang.data.id)
);

// Map to simpler structure
const languages = projectLanguages.map((lang: ResponseObject<LanguagesModel.Language>) => ({
  id: lang.data.id,           // string: "uk"
  name: lang.data.name,       // string: "Ukrainian"
  locale: lang.data.locale,   // string: "uk-UA"
  osxLocale: lang.data.osxLocale // string
}));
```

#### 4. List Source Files
```typescript
const response = await connection.client.sourceFilesApi.withFetchAll().listProjectFiles(projectId);

response.data.forEach((fileItem: ResponseObject<SourceFilesModel.File>) => {
  const file = fileItem.data;
  const fileId = file.id;             // number
  const fileName = file.name;         // string
  const branchId = file.branchId;     // number | null
  const directoryId = file.directoryId; // number | null
});
```

#### 5. Get Translation Status
```typescript
const response = await connection.client.translationStatusApi.getProjectProgress(projectId);

const progress = response.data;
progress.forEach((item: TranslationStatusModel.LanguageProgress) => {
  const languageId = item.data.languageId;
  const translationProgress = item.data.translationProgress; // number (0-100)
  const approvalProgress = item.data.approvalProgress;       // number (0-100)
});
```

### Best Practices

1. **Always access data via `.data` property**
   ```typescript
   // ✅ CORRECT
   const project = response.data;
   const projectName = response.data.name;
   
   // ❌ WRONG - will be undefined
   const projectName = response.name;
   ```

2. **Use withFetchAll() for complete data**
   ```typescript
   // ✅ CORRECT - gets all items
   const response = await connection.client.languagesApi.withFetchAll().listSupportedLanguages();
   
   // ⚠️ PARTIAL - only first page (25 items)
   const response = await connection.client.languagesApi.listSupportedLanguages();
   ```

3. **Check TypeScript types in official docs**
   - Don't assume property names
   - Check the API reference for exact response models
   - Use TypeScript autocomplete in your IDE

4. **Handle nullable properties**
   ```typescript
   const description = response.data.description || 'No description';
   const groupId = response.data.groupId ?? null;
   ```

5. **Verify methods exist in documentation**
   - Before using any method, check: https://crowdin.github.io/crowdin-api-client-js/modules.html
   - Example: `ProjectsGroupsModel` module lists all available methods
   - Do NOT invent methods like `.getProjectLanguages()` if they don't exist

### Error Handling with API

```typescript
try {
  const response = await connection.client.projectsGroupsApi.getProject(projectId);
  const project = response.data;
  // Use project data
} catch (error: any) {
  console.error('Crowdin API Error:', error);
  
  // API errors have specific structure
  if (error.code === 404) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  return res.status(500).json({ 
    error: 'API request failed',
    details: error.message 
  });
}
```

### TypeScript Type Safety

```typescript
import { ResponseObject, ProjectsGroupsModel } from '@crowdin/crowdin-api-client';

// Use in your code
const response: ResponseObject<ProjectsGroupsModel.Project> = await connection.client.projectsGroupsApi.getProject(projectId);
const project: ProjectsGroupsModel.Project = response.data;
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