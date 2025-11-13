# Template Selection

Crowdin app with Custom MT (Machine Translation) module.

Use when:
- Connecting custom machine translation engines not yet supported by Crowdin
- Integrating proprietary or internal MT services
- Building custom translation logic with context awareness
- Creating MT adapters for niche language pairs or domains
- Implementing specialized translation engines for technical content

Avoid when:
- Building editor extensions (use Editor Right Panel instead)
- Building organization-wide tools (use Organization Menu instead)
- Creating project-specific tools (use Project Tools instead)
- Creating user profile tools (use Profile Resources Menu instead)
- Integrating custom AI providers (use AI Provider instead)

Built with:
- Crowdin Apps JS API
- Crowdin Apps SDK (@crowdin/app-project-module)
- TypeScript
- Express.js
- Cloudflare Workers
- HTML/CSS/JavaScript (modular structure)
