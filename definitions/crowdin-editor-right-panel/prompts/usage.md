# Usage

## Overview
Crowdin app with Editor Right Panel module for translation editor extensions.
- Backend: Express.js with Crowdin Apps SDK (minimal - most functionality is frontend)
- Frontend: HTML/CSS/JavaScript with Crowdin Editor API integration
- Module: Editor Right Panel (appears in translation editor sidebar)

## Tech Stack
- **Crowdin Apps SDK** (@crowdin/app-project-module) for app structure
- **Crowdin Editor API** (`window.AP.editor`) for translation interactions
- **HTML/CSS/JavaScript** for panel interface
- **Express.js** for serving static files and optional API endpoints

## Development Approach
**Most editor right panel apps are frontend-focused** and use the Crowdin Editor API directly. The backend is typically minimal, serving static files and handling app installation.

## Project Structure

### Backend Structure (Minimal)
- `index.js` - Main application with Editor Right Panel configuration
- `public/` - Static files served to the browser
- `public/index.html` - Main panel interface
- `data/` - Metadata storage directory (if needed)

### Frontend Structure (Primary Focus)
- `public/index.html` - Editor panel interface with Crowdin Editor API integration
- JavaScript for editor interactions and custom functionality

## Editor Right Panel Configuration

```javascript
editorRightPanel: {
  fileName: 'index.html',
  uiPath: __dirname + '/public',
  modes: ['translate'], // Editor modes where panel appears
  environments: 'crowdin' // or 'enterprise' or 'crowdin,enterprise'
}
```

### Available Editor Modes
- `translate` - Translation mode (most common)
- `proofread` - Proofreading mode
- `review` - Review mode

## Crowdin Editor API

The primary way to interact with translations is through the Crowdin Editor API:

### Include the API Script
```html
<script src="https://cdn.crowdin.com/apps/dist/iframe.js"></script>
```

### Core Editor Methods
```javascript
// Insert text at cursor position
window.AP.editor.insertTranslation(text)

// Append text to current translation
window.AP.editor.appendTranslation(text)

// Replace entire translation
window.AP.editor.setTranslation(text)

// Get current translation
const translation = window.AP.editor.getTranslation()

// Get source string
const sourceString = window.AP.editor.getSourceString()
```

### Example Usage
```javascript
function insertText(text) {
  if (window.AP && window.AP.editor) {
    window.AP.editor.appendTranslation(text);
  } else {
    // Fallback for development/testing
    console.log('Would insert:', text);
  }
}
```

## Development Patterns

### Frontend-First Approach
Most editor panel functionality can be implemented entirely in the frontend:
```javascript
// Load external data (dictionaries, suggestions, etc.)
fetch('/api/external-data')
  .then(response => response.json())
  .then(data => {
    // Use data to enhance the editor experience
    displaySuggestions(data);
  });

// Interact with editor
function applySuggestion(text) {
  window.AP.editor.insertTranslation(text);
}
```

### Optional Backend APIs
Add backend endpoints only when needed:
```javascript
// Optional: Custom data endpoints
app.get('/api/suggestions', async (req, res) => {
  // Fetch suggestions from external service
  const suggestions = await getExternalSuggestions(req.query.text);
  res.json(suggestions);
});

// Optional: Configuration endpoints
app.get('/api/config', async (req, res) => {
  const { client } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
  // Return app-specific configuration
  res.json({ config: 'data' });
});
```

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
1. **Focus on frontend**: Replace `public/index.html` with your panel interface
2. **Integrate Editor API**: Use `window.AP.editor` methods for translation interactions
3. **Add backend APIs only if needed**: For external integrations or data processing
4. **Test in Crowdin editor**: Panel appears in translation editor sidebar
5. **Deploy and register**: Deploy to hosting platform and register in Crowdin Developer Console

## Common Use Cases
- **Text insertion tools**: Special characters, templates, snippets
- **Translation assistance**: Suggestions, auto-completion, terminology
- **Quality tools**: Grammar checkers, style validators
- **Reference tools**: Dictionaries, glossaries, context helpers
- **Custom workflows**: Project-specific translation aids

## Panel Design Guidelines
- **Compact Design**: Panel width is typically 300-400px
- **Quick Actions**: Focus on immediate, actionable functionality
- **Editor Integration**: Use Editor API methods for seamless translation workflow
- **Responsive**: Handle different panel sizes gracefully
- **Performance**: Keep UI lightweight and fast

## Examples from Real Apps

### Simple Text Insertion
```javascript
// Just frontend functionality
function insertText(text) {
  window.AP.editor.appendTranslation(text);
}
```

### Translation Suggestions (With Backend)
```javascript
// Frontend requests suggestions, backend processes
async function getSuggestions(sourceText) {
  const response = await fetch(`/api/suggestions?text=${sourceText}`);
  const suggestions = await response.json();
  displaySuggestions(suggestions);
}
```

## Security Notes
- Editor API handles authentication automatically
- Panel runs in iframe with Crowdin security context
- Use HTTPS in production
- Validate any external data before displaying
