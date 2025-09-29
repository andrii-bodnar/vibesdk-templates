# Usage

## Overview
Crowdin app with Project Tools module for project-specific functionality.
- Backend: Express.js with Crowdin Apps SDK
- Frontend: HTML/CSS/JavaScript with project context integration
- Authentication: JWT tokens from Crowdin with project context
- Module: Project Tools (appears in project menu)

## Tech Stack
- **Crowdin Apps SDK** (@crowdin/app-project-module) for Crowdin integration
- **Express.js** for server and API endpoints
- **JWT** for authentication with project context
- **HTML/CSS/JavaScript** for project tool interface
- **Crowdin API** for project data access

## Development Restrictions
- **Authentication**: Always use JWT tokens from Crowdin for API requests
- **Module Configuration**: Don't modify the projectTools configuration structure
- **Scopes**: Ensure your app has appropriate project-level API scopes
- **Project Context**: Apps automatically receive project context from JWT

## Project Structure

### Backend Structure
- `index.js` - Main application with Project Tools configuration
- `public/` - Static files served to the browser
- `public/index.html` - Project tool interface
- `data/` - Metadata storage directory

### Frontend Structure
- `public/index.html` - Project tool interface
- JavaScript for project context handling
- Project-specific functionality

## Project Tools Configuration

```javascript
projectTools: {
  fileName: 'index.html',
  uiPath: __dirname + '/public'
}
```

### Required Scopes
Define scopes based on your app's functionality:
```javascript
scopes: [
  crowdinModule.Scope.PROJECTS,        // Project management
  crowdinModule.Scope.TRANSLATIONS,    // Translation data
  crowdinModule.Scope.FILES,           // File management
  crowdinModule.Scope.REPORTS,         // Reporting data
  // Add other scopes as needed
]
```

## Project Context Integration

### Accessing Project Context
```javascript
app.get('/api/project-data', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    
    // Project context is automatically available
    console.log('Current project ID:', projectId);
    
    // Access project data
    const project = await client.projectsGroupsApi.getProject(projectId);
    res.json({ success: true, project: project.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to access project data' });
  }
});
```

### Available Context Information
- `project_id` - Current project ID
- `organization_id` - Organization ID
- `user_id` - Current user ID
- Additional project-specific context

## API Patterns

### Project Information
```javascript
app.get('/api/project-overview', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    
    // Get comprehensive project information
    const [project, languages, files, progress] = await Promise.all([
      client.projectsGroupsApi.getProject(projectId),
      client.languagesApi.listProjectTargetLanguages(projectId),
      client.sourceFilesApi.withFetchAll().listProjectFiles(projectId),
      client.translationStatusApi.getProjectProgress(projectId)
    ]);
    
    res.json({
      success: true,
      data: {
        project: project.data,
        languages: languages.data,
        files: files.data,
        progress: progress.data
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project overview' });
  }
});
```

### Project Operations
```javascript
app.post('/api/project-operation', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    const { operation, parameters } = req.body;
    
    let result;
    switch (operation) {
      case 'build':
        result = await client.translationsApi.buildProject(projectId, parameters);
        break;
      case 'export':
        result = await client.translationsApi.exportProjectTranslation(projectId, parameters);
        break;
      case 'sync':
        // Custom sync logic
        result = await performProjectSync(client, projectId, parameters);
        break;
      default:
        return res.status(400).json({ error: 'Unknown operation' });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Operation failed' });
  }
});
```

### Bulk Operations
```javascript
app.post('/api/bulk-operation', async (req, res) => {
  try {
    const { client, context } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const projectId = context.jwtPayload.context.project_id;
    const { action, targets } = req.body;
    
    const results = [];
    for (const target of targets) {
      try {
        const result = await performBulkAction(client, projectId, action, target);
        results.push({ target, success: true, result });
      } catch (error) {
        results.push({ target, success: false, error: error.message });
      }
    }
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: 'Bulk operation failed' });
  }
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
1. Replace `public/index.html` with your project tool interface
2. Define required scopes for your project operations
3. Add API endpoints for your project-specific logic
4. Use project context to access relevant data
5. Test within your Crowdin project
6. Deploy and register in Crowdin Developer Console

## Common Use Cases
- **Project Analytics**: Progress tracking, statistics, reports
- **Bulk Operations**: Mass updates, batch processing
- **Quality Assurance**: Project-wide QA checks and validation
- **Integration Management**: Sync with external systems
- **Custom Workflows**: Specialized project processes
- **File Management**: Advanced file operations and organization
- **Team Management**: Project member tools and permissions

## Project Data Access
- **Files**: Source files, translations, file structures
- **Strings**: Source strings, translations, contexts
- **Languages**: Target languages, progress, statistics
- **Members**: Project team, roles, permissions
- **Settings**: Project configuration, preferences
- **Reports**: Progress reports, activity logs

## Best Practices
- **Efficient API Usage**: Batch requests, use pagination
- **Error Handling**: Graceful degradation, user-friendly messages
- **Progress Indicators**: Show progress for long-running operations
- **Data Caching**: Cache frequently accessed project data
- **Permissions**: Respect user permissions and project access

## Security Notes
- JWT tokens contain project context information
- Validate project access permissions
- Use HTTPS in production
- Handle sensitive project data securely
- Follow Crowdin API rate limiting guidelines
- Ensure operations are authorized for the current user

## Performance Considerations
- **Lazy Loading**: Load data as needed
- **Pagination**: Handle large datasets efficiently
- **Background Processing**: Use async operations for heavy tasks
- **Caching**: Cache project metadata and settings
- **Optimization**: Minimize API calls, batch operations
