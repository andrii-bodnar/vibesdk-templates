# Usage

## Overview
Crowdin app with Editor Right Panel module for translation editor extensions.
- Backend: TypeScript with Express.js and Crowdin Apps SDK (minimal - mostly frontend)
- Frontend: Modular HTML/CSS/JavaScript with Crowdin Editor API
- Authentication: JWT tokens from Crowdin with automatic editor context
- Module: Editor Right Panel (appears in translation editor sidebar)
- Features: Compact design for sidebar, Editor API integration, event listeners

## Tech Stack
- **Crowdin Editor API** (AP.editor object) for translation manipulation
- **Crowdin Apps JS API** (AP object) for context and events
- **Crowdin Apps SDK** (@crowdin/app-project-module) for backend
- **TypeScript** for type-safe backend development
- **Express.js** for server (minimal - optional API endpoints)
- **Modular Frontend** - Separate HTML, CSS (styles.css), JS (app.js) files
- **Compact CSS** - Optimized for narrow sidebar panel (300-400px)

## Development Restrictions
- **Panel Width**: Design for 300-400px width (sidebar constraint)
- **Frontend-Focused**: Most functionality should be in frontend using AP.editor
- **Module Configuration**: Don't modify the editorRightPanel configuration structure
- **Editor Modes**: Panel appears only in specified editor modes (comfortable, side-by-side, multilingual, review, assets)
- **Event Handling**: Listen to editor events for real-time updates

## Project Structure

### Backend Structure
- `worker/app.ts` - TypeScript backend with Editor Right Panel configuration
- `worker/index.ts` - Entry point for Cloudflare Worker
- `public/` - Static files served to the browser

### Frontend Structure
- `public/editor-panels/index.html` - Main HTML interface with demo UI
- `public/editor-panels/app.js` - JavaScript with Crowdin Editor API integration
- `public/editor-panels/styles.css` - Compact CSS optimized for sidebar

## Editor Right Panel Configuration

```typescript
editorRightPanel: {
  fileName: 'index.html',
  uiPath: '/editor-panels',
  modes: [EditorMode.COMFORTABLE],  // Specify editor modes where panel appears
  supportsMultipleStrings: true      // Handle multiple string selection
}
```

### Editor Modes
```typescript
import { EditorMode } from '@crowdin/app-project-module/out/types';

modes: [
  EditorMode.COMFORTABLE,   // Comfortable mode (most common)
  EditorMode.SIDE_BY_SIDE,  // Side-by-side mode (most common)
  EditorMode.MULTILINGUAL,  // Multilingual mode
  EditorMode.REVIEW,        // Review mode
  EditorMode.ASSETS         // Assets mode
]
```

**Recommended configuration:**
```typescript
modes: [EditorMode.COMFORTABLE, EditorMode.SIDE_BY_SIDE]  // Most common modes
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

## Frontend Integration (Crowdin Editor API)

### Initialize and Get String
```javascript
// Frontend - app.js
function initializeApp() {
    // Get current string information
    AP.editor.getString(function(string) {
        console.log('String ID:', string.id);
        console.log('Text:', string.text);
        console.log('Context:', string.context);
        console.log('File:', string.file.name);
    });
    
    // Listen to string changes
    AP.events.on('string.change', function(data) {
        // Update panel when user selects a different string
        loadCurrentString();
    });
}
```

### Editor API Methods

#### Get Information
```javascript
// Get current source string
AP.editor.getString(function(string) {
    // string.id, string.text, string.context, string.file
    const sourceText = string.text;
});

// Get top translation for current string
AP.editor.getTopTranslation(function(translation) {
    // translation.id, translation.text, translation.author
    const translationText = translation.text;
});

// Get all translations for current string
AP.editor.getTranslations(function(translations) {
    // Array of translation objects
});
```

#### Modify Translation
```javascript
// Append text to end of translation
AP.editor.appendTranslation(' additional text');

// Replace entire translation
AP.editor.setTranslation('new translation');

// Clear translation
AP.editor.clearTranslation();
```

#### Editor Messages
```javascript
// Show success message
AP.editor.successMessage('Translation saved!');

// Show error message
AP.editor.errorMessage('Something went wrong');

// Show notice message
AP.editor.noticeMessage('Please review this translation');
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
// Plus editor-specific context with mode, theme, file, workflow_step
```

## Backend Integration (Optional)

Editor Right Panel apps are primarily frontend-focused. Add backend endpoints only when needed (e.g., external API integration, suggestions).

### Optional Backend Endpoint
```typescript
// Backend - worker/app.ts (only if needed)
app.get('/api/suggestions', async (req: Request, res: Response) => {
  try {
    const jwt = req.query.jwt as string;
    const sourceText = req.query.text as string;
    
    // Example: Fetch suggestions from external service
    const suggestions = await fetchExternalSuggestions(sourceText);
    
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});
```

## Common Editor Patterns

### Text Insertion Tool
```javascript
function insertSpecialCharacter(char) {
    if (window.AP && window.AP.editor) {
        AP.editor.appendTranslation(char);
        AP.editor.successMessage(`Appended: ${char}`);
    }
}
```

### Translation Helper
```javascript
function applyTemplate(template) {
    if (window.AP && window.AP.editor) {
        AP.editor.getString(function(string) {
            const sourceText = string.text;
            const filledTemplate = template.replace('{source}', sourceText);
            AP.editor.setTranslation(filledTemplate);
        });
    }
}
```

### Quality Check
```javascript
function checkTranslation() {
    if (window.AP && window.AP.editor) {
        AP.editor.getString(function(string) {
            AP.editor.getTopTranslation(function(translation) {
                // Your validation logic
                if (translation && translation.text.length > string.text.length * 2) {
                    AP.editor.errorMessage('Translation might be too long');
                }
            });
        });
    }
}
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

**Note**: The `identifier` must be unique across all Crowdin apps. Use format like: `company-editor-tool`

### 2. Key Files to Modify
- `worker/app.ts` - Add backend endpoints only if needed
- `public/editor-panels/index.html` - Modify compact UI
- `public/editor-panels/app.js` - Add editor interaction logic  
- `public/editor-panels/styles.css` - Customize compact styles

### 3. Design Considerations
- **Panel Width**: Design for 300-400px width (sidebar)
- **Compact UI**: Keep interface minimal and focused
- **Quick Actions**: Buttons should trigger immediate actions
- **Event Driven**: Listen to string.change and other editor events
- **Performance**: Keep UI lightweight and responsive

## Editor Events

### Available Events
```javascript
// String changed (user selected a different string)
AP.events.on('string.change', function(data) {
    // Update panel for new string
    loadCurrentString();
});

// Translation added
AP.events.on('translation.added', function(data) {
    // React to new translation
});

// Translation approved
AP.events.on('translation.approve', function(data) {
    // React to approval
});

// Translation text edited
AP.events.on('textarea.edited', function(data) {
    // React to translation edits
});
```

## Common Use Cases
- Special character insertion tools
- Translation templates and snippets
- Glossary and terminology lookups
- Quality assurance checks
- External API integrations (dictionaries, MT services)
- Context and reference displays

## Best Practices
- Keep UI compact and focused on editor panel width
- Use Editor API for all translation interactions
- Listen to events for real-time updates
- Handle cases when Editor API is not available
- Minimize backend usage - keep logic in frontend
- Test with different string types and languages
