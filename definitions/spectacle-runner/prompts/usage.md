# Spectacle Technical Reference

## Quick Start

```bash
bun install
bun run dev      # Development server on port 3000
bun run build    # Production build
bun run deploy   # Deploy to Cloudflare Workers
```

## Core Architecture

### Deck Component
Root presentation wrapper. Place all slides inside `<Deck>`.

```tsx
<Deck theme={theme} template={DefaultTemplate}>
  <Slide>...</Slide>
</Deck>
```

**Props:**
- `theme` - Theme object (colors, fonts, fontSizes, space)
- `template` - Slide template component (header/footer, `() => null` for none)
- `autoPlay` - Auto-advance slides (boolean)
- `autoPlayLoop` - Loop presentation (boolean)
- `autoPlayInterval` - Milliseconds between slides (number)
- `pageSize` - Print page size (object: `{width, height}`)
- `pageOrientation` - 'portrait' | 'landscape'
- `printScale` - PDF export scale (0-1)
- `transition` - Default slide transition

### Slide Component
Individual presentation slide.

```tsx
<Slide backgroundColor="primary" transition="slide">
  <Heading>Title</Heading>
</Slide>
```

**Props:**
- `backgroundColor` - Theme color key or CSS value
- `backgroundImage` - CSS background-image value
- `backgroundOpacity` - Opacity for background (0-1)
- `backgroundPosition` - CSS background-position
- `backgroundRepeat` - CSS background-repeat
- `backgroundSize` - CSS background-size
- `textColor` - Text color (theme key or CSS)
- `transition` - Slide transition effect
- `scaleRatio` - Content scaling (default 1)

### Theme System
Define colors, fonts, sizes in `src/theme.ts`:

```tsx
export const theme = {
  colors: {
    primary: '#1a1a1a',
    secondary: '#4a90e2',
    tertiary: '#f8f9fa',
    quaternary: '#ffffff',
    quinary: '#6c757d'
  },
  fonts: {
    header: '"Helvetica Neue", sans-serif',
    text: '"Helvetica Neue", sans-serif',
    monospace: '"Consolas", monospace'
  },
  fontSizes: {
    h1: '72px',
    h2: '56px',
    h3: '40px',
    text: '28px',
    monospace: '20px'
  },
  space: [0, 8, 16, 24, 32, 48, 64, 96, 128]
};
```

## Typography Components

### Heading
Headers with theme-based sizing.

```tsx
<Heading fontSize="h1" color="primary">Title</Heading>
<Heading fontSize="64px">Custom Size</Heading>
```

**Props:** `fontSize` (theme key or CSS), `color`, `margin`, `padding`

### Text
Standard text content.

```tsx
<Text fontSize="28px" color="secondary">Content</Text>
```

**Props:** Same as Heading

### Quote
Quoted text with styling.

```tsx
<Quote fontSize="24px" borderLeft="4px solid #4a90e2">
  "Your quote here"
</Quote>
```

**Props:** All Box props + typography props

### Link
Hyperlinks with underline.

```tsx
<Link href="https://example.com" color="secondary">
  Click here
</Link>
```

**Props:** `href`, all Text props

## List Components

### UnorderedList / OrderedList
Bulleted or numbered lists.

```tsx
<UnorderedList color="secondary" fontSize="28px">
  <ListItem>First</ListItem>
  <ListItem>Second</ListItem>
</UnorderedList>
```

## Layout Components

### FlexBox
Flexbox container with all flex props.

```tsx
<FlexBox
  flexDirection="column"
  justifyContent="center"
  alignItems="center"
  height="100%"
>
  <Heading>Centered</Heading>
</FlexBox>
```

**Props:** All CSS flexbox properties (camelCase)

### Box
Generic container for spacing and styling.

```tsx
<Box
  padding="30px"
  backgroundColor="primary"
  borderRadius="8px"
  margin="20px"
>
  <Text>Content</Text>
</Box>
```

**Props:** All CSS box model properties

### Grid
CSS Grid layouts.

```tsx
<Grid
  gridTemplateColumns="1fr 1fr 1fr"
  gridColumnGap={20}
  gridRowGap={20}
>
  <Box>Column 1</Box>
  <Box>Column 2</Box>
  <Box>Column 3</Box>
</Grid>
```

**Props:** All CSS grid properties

## Table Components

Create data tables with full styling control.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableCell style={{backgroundColor: '#4a90e2', color: 'white'}}>
        Header
      </TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Code Display

### CodePane
Syntax-highlighted code blocks using Prism.

```tsx
<CodePane
  language="typescript"
  theme="dracula"
  showLineNumbers={false}
  highlightRanges={[[1, 3], [5]]}
  fontSize={18}
>
  {`const code = "here";`}
</CodePane>
```

**Supported Languages:**
typescript, javascript, jsx, tsx, python, java, c, cpp, csharp, go, rust, ruby, php, html, css, scss, json, yaml, sql, bash, markdown, graphql

**Prism Themes:**
dracula, nightOwl, oceanicNext, vsDark, vs, funky, okaidia, twilight, coy, solarizedlight, tomorrow

**Props:**
- `language` - Code language
- `theme` - Prism theme name
- `showLineNumbers` - Boolean for line numbers
- `highlightRanges` - Array of [start, end] line ranges to highlight
- `fontSize` - Font size in pixels

### CodeSpan
Inline code snippets.

```tsx
<Text>
  Use the <CodeSpan>const</CodeSpan> keyword
</Text>
```

## Animation Components

### Appear
Progressive reveal with fade animation.

```tsx
<UnorderedList>
  <Appear>
    <ListItem>Appears first</ListItem>
  </Appear>
  <Appear>
    <ListItem>Appears second</ListItem>
  </Appear>
</UnorderedList>
```

**Props:**
- `activeStyle` - CSS when visible (default: `{opacity: 1}`)
- `inactiveStyle` - CSS when hidden (default: `{opacity: 0}`)

### Stepper
Multi-step content with state control.

```tsx
<Stepper
  values={['Step 1', 'Step 2', 'Step 3']}
  render={({ step, value }) => (
    <Box>
      <Heading>Current: {value}</Heading>
      <Text>Step {step + 1} of 3</Text>
    </Box>
  )}
/>
```

**Props:**
- `values` - Array of step values
- `render` - Function receiving `{step, value}` returning JSX

### useSteps Hook
Custom step-based animations.

```tsx
import { useSteps } from 'spectacle';

function CustomStepper() {
  const [stepIndex, stepperProps] = useSteps(3);

  return (
    <div {...stepperProps}>
      <div style={{opacity: stepIndex >= 0 ? 1 : 0}}>Step 1</div>
      <div style={{opacity: stepIndex >= 1 ? 1 : 0}}>Step 2</div>
      <div style={{opacity: stepIndex >= 2 ? 1 : 0}}>Step 3</div>
    </div>
  );
}
```

## Markdown Support

### Markdown Component
Inline markdown rendering.

```tsx
<Markdown fontSize="24px" color="secondary">
  {`
  # Heading

  - Bullet 1
  - Bullet 2

  **Bold** and *italic* text

  [Link](https://example.com)
  `}
</Markdown>
```

### MarkdownSlideSet
Generate multiple slides from markdown.

```tsx
<MarkdownSlideSet>
  {`
  # Slide 1 Title

  Content for first slide

  ---

  # Slide 2 Title

  Content for second slide
  `}
</MarkdownSlideSet>
```

**Note:** Use `---` delimiter to separate slides.

## Transitions

Apply to Deck (global) or individual Slides.

```tsx
<Slide transition="slide">...</Slide>
<Slide transition={{from: {opacity: 0}, enter: {opacity: 1}}}>...</Slide>
```

**Built-in Transitions:**
- `slide` - Horizontal slide
- `fade` - Fade in/out
- `zoom` - Zoom in/out
- `spin` - 360° rotation
- Combine: `{from: "slide", to: "fade"}`

**Custom Transitions:**
```tsx
{
  from: { transform: 'scale(0.5)', opacity: 0 },
  enter: { transform: 'scale(1)', opacity: 1 },
  leave: { transform: 'scale(1.5)', opacity: 0 }
}
```

## Presenter Features

### Notes Component
Speaker notes visible only in presenter mode.

```tsx
<Slide>
  <Heading>Public Slide</Heading>
  <Notes>
    Private speaker notes here.
    Timing cues, background info, etc.
  </Notes>
</Slide>
```

### Presenter Mode
Press **Option/Alt + P** to toggle presenter mode.

Features:
- Speaker notes display
- Next slide preview
- Timer
- Slide navigation

### Overview Mode
Press **Option/Alt + O** for slide overview grid.

## Navigation

**Keyboard Shortcuts:**
- `→` / `Space` - Next slide
- `←` / `Shift+Space` - Previous slide
- `Option+P` - Toggle presenter mode
- `Option+O` - Toggle overview mode
- `Home` - First slide
- `End` - Last slide
- `1-9` - Jump to slide number

## Templates

### DefaultTemplate
Built-in template with controls and progress.

```tsx
import { DefaultTemplate } from 'spectacle';

<Deck template={DefaultTemplate}>
  <Slide>...</Slide>
</Deck>
```

### Custom Templates
Create custom headers/footers.

```tsx
function CustomTemplate({ slideNumber, numberOfSlides }) {
  return (
    <FlexBox justifyContent="space-between" position="absolute" bottom={0} width="100%">
      <Text fontSize={18}>My Presentation</Text>
      <Text fontSize={18}>{slideNumber} / {numberOfSlides}</Text>
    </FlexBox>
  );
}

<Deck template={CustomTemplate}>...</Deck>
```

**Template Props:**
- `slideNumber` - Current slide index
- `numberOfSlides` - Total slides

### No Template
Use `() => null` for no header/footer.

```tsx
<Deck template={() => null}>...</Deck>
```

## Print & Export

### PDF Export
Configure print settings on Deck.

```tsx
<Deck
  pageSize={{width: 1920, height: 1080}}
  pageOrientation="landscape"
  printScale={0.75}
>
  <Slide>...</Slide>
</Deck>
```

Use browser print (Cmd/Ctrl + P) and save as PDF.

### Static Export
Build static HTML for distribution.

```bash
bun run build
```

Output in `dist/` directory.

## Auto-Play

Auto-advance slides for kiosk mode.

```tsx
<Deck
  autoPlay
  autoPlayLoop
  autoPlayInterval={3000}
>
  <Slide>...</Slide>
</Deck>
```

**Props:**
- `autoPlay` - Enable auto-advance
- `autoPlayLoop` - Loop back to first slide
- `autoPlayInterval` - Milliseconds between slides

## Best Practices

### Content
- **One idea per slide** - Avoid information overload
- **6-7 lines max** - Keep text concise
- **Visual hierarchy** - Use heading sizes consistently
- **High contrast** - Ensure readability on projectors

### Code Examples
- **Keep short** - Max 15-20 lines per CodePane
- **Syntax highlighting** - Always specify language
- **Line highlighting** - Draw attention to key lines
- **Multiple languages** - Use Grid for side-by-side comparison

### Design
- **Whitespace** - Don't crowd slides
- **Consistent colors** - Stick to theme palette
- **Progressive reveal** - Use Appear for complex slides
- **Visual breaks** - Vary background colors between sections

### Performance
- **Image optimization** - Compress images before use
- **Limit animations** - Don't overuse Appear/Stepper
- **Test early** - Run in presentation environment

## Deployment

This template deploys to Cloudflare Workers for global CDN distribution.

```bash
bun run deploy
```

Access via deployed URL. Supports presenter mode and all interactive features.

## Troubleshooting

**Syntax highlighting not working:**
- Verify language name matches Prism supported languages
- Check CodePane has closing tag (not self-closing)

**Slides not advancing:**
- Check for JavaScript errors in console
- Verify Stepper/Appear components are used correctly
- Ensure no broken image/resource URLs

**Export/print issues:**
- Set explicit pageSize and pageOrientation
- Adjust printScale if content is cut off
- Use browser's print preview before saving PDF

**Theme colors not applying:**
- Verify color keys exist in theme object
- Check backgroundColor prop uses correct theme key
- Inline colors need CSS values, not theme keys