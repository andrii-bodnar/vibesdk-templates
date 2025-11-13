# Template Selection

Crowdin app with AI Provider module.

Use when:
- Integrating custom AI models (OpenAI, Azure OpenAI, Anthropic, Google Gemini, etc.)
- Providing AI-powered translation suggestions and content generation
- Building custom AI features for Crowdin projects
- Connecting enterprise or proprietary AI services to Crowdin
- Need dynamic model discovery from AI provider API
- Implementing AI models with vision, function calling, or JSON mode capabilities
- Require organization-level AI provider configuration
- Need to support multiple AI models with different capabilities

Avoid when:
- Building organization-wide tools (use Organization Menu instead)
- Creating user profile tools (use Profile Resources Menu instead)
- Building editor extensions (use Editor Right Panel instead)
- Building machine translation integrations (use Custom MT instead)

Built with:
- Crowdin Apps JS API
- Crowdin Apps SDK (@crowdin/app-project-module)
- TypeScript
- Express.js
- Cloudflare Workers
- HTML/CSS/JavaScript (modular structure)

