# Crowdin App Template

A base template for building Crowdin applications using the [@crowdin/app-project-module](https://www.npmjs.com/package/@crowdin/app-project-module) SDK.

## Features

- Express.js server with Crowdin SDK integration
- Environment-based configuration
- Security middleware (Helmet, CORS)
- Health check endpoint
- Metadata storage support
- Extensible architecture for various Crowdin modules

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Crowdin app credentials and configuration.

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Production start:**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BASE_URL` | Your app's public URL | Yes* |
| `CROWDIN_CLIENT_ID` | Crowdin app client ID | Yes* |
| `CROWDIN_CLIENT_SECRET` | Crowdin app client secret | Yes* |
| `APP_NAME` | Display name for your app | No |
| `APP_IDENTIFIER` | Unique identifier for your app | No |
| `APP_DESCRIPTION` | Description of your app | No |
| `PORT` | Server port (default: 3000) | No |

*Automatically picked up by Crowdin Apps SDK

## Project Structure

```
├── index.js              # Main application entry point
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── data/                # Metadata storage directory
└── public/              # Static assets
    └── logo.svg         # App logo
```

## Extending This Template

This base template can be extended with various Crowdin modules:

- **Project Integration**: Add project synchronization features
- **File Processor**: Support custom file formats
- **Context Menu**: Add custom menu items
- **Custom MT**: Implement machine translation
- **API**: Create custom API endpoints
- **Webhook**: Handle Crowdin webhooks

See the [Crowdin Apps SDK documentation](https://crowdin.github.io/app-project-module/modules/) for more details.

## Development

- `npm run dev` - Start development server with auto-reload
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when implemented)

## Deployment

1. Set up your production environment variables (if needed)
2. Deploy to your preferred hosting platform (Heroku, AWS, DigitalOcean, etc.)
3. Register your app in the Crowdin Developer Console
4. Submit to Crowdin Store (optional)
