# Usage

## Overview
Crowdin app with Organization Menu module for organization-wide functionality.
- Backend: Express.js with Crowdin Apps SDK
- Frontend: HTML/CSS/JavaScript (customizable)
- Authentication: JWT tokens from Crowdin
- Module: Organization Menu (appears in org navigation)

## Tech Stack
- **Crowdin Apps SDK** (@crowdin/app-project-module) for Crowdin integration
- **Express.js** for server and API endpoints
- **JWT** for authentication
- **HTML/CSS/JavaScript** for frontend (replace with your framework)

## Development Restrictions
- **Authentication**: Always use JWT tokens from Crowdin for API requests
- **Module Configuration**: Don't modify the organizationMenu configuration structure
- **Scopes**: Ensure your app has appropriate Crowdin API scopes

## Project Structure

### Backend Structure
- `index.js` - Main application entry point with Organization Menu configuration
- `public/` - Static files served to the browser
- `public/index.html` - Main UI file (replace with your interface)
- `data/` - Metadata storage directory

### Frontend Structure
- `public/index.html` - Main interface (customize as needed)
- Add CSS frameworks, JavaScript libraries as needed
- Can be replaced with React, Vue, or any frontend framework

## API Patterns

### Adding Custom Endpoints
Add your business logic in `index.js`:
```javascript
// Example API endpoint
app.get('/api/organizations', async (req, res) => {
  try {
    const { client } = await crowdinApp.establishCrowdinConnection(req.query.jwt);
    const organizations = await client.organizationsApi.listOrganizations();
    res.status(200).json({ success: true, data: organizations.data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Frontend API Calls
Use JWT token from URL parameters:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const jwt = urlParams.get('jwt');

fetch(`/api/organizations?jwt=${jwt}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## Organization Menu Module
- Appears in organization-level navigation
- Accessible to organization admins and members (based on app permissions)
- Provides organization-wide functionality
- Can access organization-level APIs

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
1. Replace `public/index.html` with your custom UI
2. Add API endpoints in `index.js` for your business logic
3. Use `establishCrowdinConnection()` to get authenticated Crowdin API client
4. Test with your Crowdin organization
5. Deploy and register in Crowdin Developer Console

## Common Use Cases
- Organization settings management
- User management and permissions
- Reporting and analytics dashboards
- Integration configuration
- Bulk operations across projects

## Security Notes
- JWT tokens are automatically validated by the SDK
- Use HTTPS in production
- Don't expose sensitive data to the frontend
- Follow Crowdin API rate limiting guidelines
