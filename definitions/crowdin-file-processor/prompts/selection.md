# Template Selection

Crowdin app with File Processing modules (Pre-Import, Post-Import, Pre-Export, Post-Export).

Use when:
- Transforming file content before Crowdin parses it (Pre-Import)
- Modifying source strings after parsing but before storage (Post-Import)
- Transforming translations before file generation (Pre-Export)
- Post-processing generated files before delivery (Post-Export)
- Implementing custom text replacement rules with regex
- Normalizing file formats or content during localization workflow
- Adding/removing metadata, headers, or formatting in files

Avoid when:
- Integrating custom AI providers (use AI Provider instead)
- Building machine translation integrations (use Custom MT instead)
- Building editor extensions (use Editor Right Panel instead)
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
