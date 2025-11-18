# Template Selection

Crowdin app with Editor Right Panel module.

Use when:
- Building translation assistance tools and helpers
- Creating context-aware editor extensions
- Developing quality assurance and validation tools
- Building translation suggestion and auto-completion tools
- Creating custom translation workflows
- Adding glossary, terminology, or reference tools

Avoid when:
- Integrating custom AI providers (use AI Provider instead)
- Building machine translation integrations (use Custom MT instead)
- Transforming files during import/export (use File Processing instead)
- Building organization-wide tools (use Organization Menu instead)
- Building user profile tools (use Profile Resources Menu instead)
- Building project-specific tools (use Project Tools instead)

Built with:
- Crowdin Apps JS API
- Crowdin Apps SDK (@crowdin/app-project-module)
- TypeScript
- Express.js
- Cloudflare Workers
- HTML/CSS/JavaScript (modular structure)
