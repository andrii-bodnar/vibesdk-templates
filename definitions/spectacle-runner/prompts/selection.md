# Spectacle Presentation Template

Modern, interactive presentation framework built on React for creating engaging slide decks with code-driven slides.

## When to Use This Template

**Ideal for:**
- Creating presentations, pitch decks, and slide shows
- Interactive demos and product showcases
- Technical talks with code examples
- Conference presentations and workshops
- Marketing presentations and storytelling
- Educational content and tutorials

**Not suitable for:**
- Full-stack web applications (use app templates instead)
- Backend workflows or API services (use workflow templates instead)
- Complex multi-page applications with routing and state management

## Key Features

- **React-based slides**: Build slides with React components
- **Interactive content**: Add animations, transitions, and interactivity
- **Code highlighting**: Built-in syntax highlighting for code examples
- **Presenter mode**: Speaker notes and presenter tools
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Customizable themes**: Full control over colors, fonts, and styling
- **Export ready**: Can be deployed as a web presentation

## Tech Stack

- **Frontend**: React 19, TypeScript, Spectacle
- **Build Tool**: Vite (fast development and builds)
- **Styling**: Spectacle theming system with Tailwind CSS utilities
- **Backend**: Minimal Cloudflare Worker for static asset serving
- **Deployment**: Cloudflare Workers for Platforms (CDN-distributed)

## Project Structure

Presentations are built using Spectacle components in TSX files:
- Main presentation in `src/Deck.tsx`
- Custom theme configuration in `src/theme.ts`
- Each `<Slide>` component represents one slide
- Support for markdown, code blocks, images, lists, and custom layouts
