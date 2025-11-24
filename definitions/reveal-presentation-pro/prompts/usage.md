## Usage Guide – Reveal Presentation Pro

### 1. How to think about this template

You are building a presentation for a user. Think of this template as:
- A **Reveal.js slide deck** where every slide is a JSON file.
- Each JSON file describes a tree of elements (`root` + `children`) that is very close to JSX/HTML, with Tailwind classes for layout and style.
- A shared design system (`slides-styles.css` plus Tailwind config in `index.html`) gives you gradients, glass‑morphism, spacing and typography that match a premium conference deck.

You never need to worry about how the platform loads or renders slides. Your job is to:
1. Understand the user’s goals and story.
2. Plan the slide sequence.
3. Create and refine slide JSON files and manifest.
4. Adjust theme/layout when needed to create a coherent, beautiful experience.

---

### 2. Files you control

When using this template, treat these as your main tools:

**Content & structure (primary):**
- `public/slides/manifest.json`
  - Controls slide order and basic metadata.
  - You can add/remove slide filenames and update metadata like title/theme.
- `public/slides/slideNN.json` (e.g. `slide01.json`, `slide02.json`)
  - One slide per file.
  - You define the visual structure and content in these JSON files.

**Theme & styling (only when changing look & feel):**
- `public/slides-styles.css`
  - Holds the core visual language: glass‑morphism utilities (`.glass`, `.glass-inline`, etc.), type scales (`.slide-title`, `.slide-subtitle`), glows, animations, and Reveal‑specific overrides.
  - Use this when the user wants a different “feel” to the entire deck (e.g. more subtle glass, stronger glows, different typography scale), not for one‑off slide hacks.

Do **not** touch:
- `public/_dev/**/*` – runtime loader, compiler, component registry.
- `public/index.html` – Reveal + Tailwind bootstrap.

---

### 3. Slide JSON shape (what you actually write)

Each `public/slides/slideNN.json` file looks like this:

```json
{
  "id": "slide01",
  "canvas": {
    "width": 1920,
    "height": 1080
  },
  "root": {
    "type": "div",
    "className": "relative w-full h-full flex flex-col items-center justify-center px-32 text-center",
    "children": [
      {
        "type": "h1",
        "className": "text-8xl font-black text-white mb-6",
        "text": "Beautiful Presentations"
      },
      {
        "type": "p",
        "className": "text-2xl text-gray-200 max-w-3xl",
        "text": "A modern, glass-morphism reveal deck generated just for you."
      }
    ]
  },
  "metadata": {
    "title": "Title Slide",
    "notes": "Opening slide: keep it bold and simple."
  }
}
```

**Top‑level fields:**
- `id` – unique slide identifier (conventionally matches the number, e.g. `"slide01"`).
- `canvas` – optional, controls width/height; defaults to 1920×1080 if omitted.
- `root` – the root element for the slide.
- `metadata` – optional slide metadata:
  - `title` – human‑readable slide title.
  - `notes` – speaker notes.
  - `background` – optional dynamic background configuration (see below).

**Element shape (`root` and its `children`):**

```ts
type SlideElement = {
  type: string;              // HTML tag from the allowed set below
  className?: string;        // Tailwind classes
  text?: string;             // Text content for headings/paragraphs/buttons, etc.
  children?: SlideElement[]; // Nested elements
  role?: string;             // Optional ARIA role
  ariaLevel?: string;        // Optional ARIA heading level
  'data-fragment-index'?: number; // Reveal fragment ordering
  'data-transition'?: string;     // Per-element transition override
  style?: Record<string, string | number>; // Validated but currently ignored by renderer
  _streaming?: boolean;      // Optional flag to visually mark “currently typing” text
};
```

**Allowed `type` values (others are ignored):**
- Layout & containers: `div`, `section`, `article`, `aside`, `header`, `footer`
- Text: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span`, `strong`, `em`, `blockquote`
- Lists: `ul`, `ol`, `li`
- Media & code: `img`, `pre`, `code`, `svg`
- Simple UI: `button`, `a`

Use semantic tags whenever possible (`h1` for main title, `h2`/`h3` for section headings, `p` for body text, etc.).

> The current renderer ignores inline `style` and relies entirely on `className` and CSS utilities. You can include `style` for future‑proofing, but don’t rely on it for visual changes today.

### 4. Dynamic backgrounds (per‑slide)

You can configure a rich animated background per slide via `metadata.background`.

Supported `background.type` values:

- `"mesh"` – animated mesh gradient background.
  ```json
  {
    "metadata": {
      "background": {
        "type": "mesh",
        "colors": ["#7c3aed", "#6366f1", "#a855f7"],
        "animation": "slow"
      }
    }
  }
  ```
  - `colors` (array of 1–3 hex strings) – gradient colors.
  - `animation` – `"none" | "slow" | "medium" | "fast"` (controls movement speed).

- `"particles"` – floating ambient particles.
  ```json
  {
    "metadata": {
      "background": {
        "type": "particles",
        "count": 40,
        "color": "#a855f7",
        "speed": "medium"
      }
    }
  }
  ```
  - `count` – number of particles (20–50 recommended).
  - `color` – particle color (hex).
  - `speed` – `"slow" | "medium" | "fast"` (movement speed).

- `"mesh-particles"` – mesh gradient + particles combined.
  ```json
  {
    "metadata": {
      "background": {
        "type": "mesh-particles",
        "colors": ["#8b5cf6", "#ec4899", "#a855f7"],
        "animation": "slow",
        "count": 30,
        "color": "#a855f7"
      }
    }
  }
  ```

- `"gradient"` – static linear gradient.
  ```json
  {
    "metadata": {
      "background": {
        "type": "gradient",
        "colors": ["#1e293b", "#334155", "#475569"]
      }
    }
  }
  ```

- `"solid"` – flat background color.
  ```json
  {
    "metadata": {
      "background": {
        "type": "solid",
        "color": "#0f172a"
      }
    }
  }
  ```

> You can combine metadata backgrounds with additional visual elements in `root` (e.g. gradient overlays) when needed, but prefer `metadata.background` for primary slide backgrounds.

---

### 5. How to build and edit a deck with this template

When a user asks you to create or update a presentation:

1. **Clarify the story and structure**
   - Identify major sections: intro, problem, solution, architecture, metrics, roadmap, etc.
   - Decide on an approximate slide count and the purpose of each slide.

2. **Set up the manifest**
   - Edit `public/slides/manifest.json` so `slides` lists each slide file in order:
     ```json
     {
       "slides": ["slide01.json", "slide02.json", "slide03.json"],
       "metadata": {
         "title": "Product Demo",
         "theme": "dark",
         "transition": "slide"
       }
     }
     ```
   - Keep filenames and `id` fields consistent (`slide01.json` → `"id": "slide01"`).

3. **Create initial slides**
   - For each planned slide, create a JSON skeleton with:
     - A clear `id` and, if needed, a simple `metadata.background` configuration.
     - A simple `root` tree using allowed tags and Tailwind classes.
   - Start with simple, readable layouts; you can always refine them later.

4. **Refine layout and visual hierarchy**
   - Use Tailwind classes in `className` for:
     - Layout: `flex`, `grid`, `items-center`, `justify-between`, `gap-8`, `px-24`, `py-20`.
     - Typography: `text-5xl`, `font-semibold`, `leading-tight`, `tracking-tight`.
     - Color: `text-white`, `text-gray-300`, `bg-slate-900`, gradient utilities (`bg-gradient-to-br`, `from-violet-900`, etc.).
   - For more advanced layouts (e.g. columns, cards, highlights), compose nested `div`s with clear class names rather than overusing inline `style`.

5. **Iterate on content**
   - It is safe to regenerate a slide JSON file multiple times:
1.  **Clarify the story and structure**
    - Identify major sections: intro, problem, solution, architecture, metrics, roadmap, etc.
    - Decide on an approximate slide count and the purpose of each slide.

2.  **Set up the manifest**
    - Edit `public/slides/manifest.json` so `slides` lists each slide file in order:
      ```json
      {
        "slides": ["slide01.json", "slide02.json", "slide03.json"],
        "metadata": {
          "title": "Product Demo",
          "theme": "dark",
          "transition": "slide"
        }
      }
      ```
    - Keep filenames and `id` fields consistent (`slide01.json` → `"id": "slide01"`).

3.  **Create initial slides**
    - For each planned slide, create a JSON skeleton with:
      - A clear `id` and, if needed, a simple `metadata.background` configuration.
      - A simple `root` tree using allowed tags and Tailwind classes.
    - Start with simple, readable layouts; you can always refine them later.

4.  **Refine layout and visual hierarchy**
    - Use Tailwind classes in `className` for:
      - Layout: `flex`, `grid`, `items-center`, `justify-between`, `gap-8`, `px-24`, `py-20`.
      - Typography: `text-5xl`, `font-semibold`, `leading-tight`, `tracking-tight`.
      - Color: `text-white`, `text-gray-300`, `bg-slate-900`, gradient utilities (`bg-gradient-to-br`, `from-violet-900`, etc.).
    - For more advanced layouts (e.g. columns, cards, highlights), compose nested `div`s with clear class names rather than overusing inline `style`.

5.  **Iterate on content**
    - It is safe to regenerate a slide JSON file multiple times:
      - Rewrite headings for clarity.
      - Shorten or expand body text.
      - Reorder points or change examples.
    - Always emit **valid JSON** (no trailing commas or comments).

6.  **Use fragments for step-by-step reveals**
    - Add the `fragment` class to elements that should appear one at a time:
      ```json
      {
        "type": "div",
        "className": "fragment",
        "children": [
          {
            "type": "p",
            "className": "text-xl text-gray-200",
            "text": "This will appear on first click"
          }
        ]
      }
      ```
    - Fragments appear in DOM order by default
    - Use `data-fragment-index` to control order explicitly:
      ```json
      {
        "type": "p",
        "className": "fragment",
        "data-fragment-index": 2,
        "text": "This appears third (index 2)"
      }
      ```
    - During live streaming, fragments are shown immediately as they're generated
    - After streaming completes, fragments behave normally (step-by-step reveals)

---

### 6. Streaming support (platform integration)

When the platform generates slides dynamically, it uses a streaming protocol:

**Protocol:**
1.  `file_generating` – sent when generation starts
    - Platform navigates to the slide being generated
    - Enters "streaming mode" (all fragments visible during generation)
2.  `file_chunk` – sent repeatedly with partial JSON
    - Content appears live as it's being generated
    - Fragments show immediately (no waiting for navigation)
3.  `file_generated` – sent when generation completes
    - Exits streaming mode
    - Navigates to last fragment properly

**For LLM builders:**
- You don't need to handle streaming yourself - the platform does this automatically
- Just generate valid slide JSON using the streaming tool calls
- Fragments will appear live during generation, then work normally afterwards
- The presentation gracefully handles partial JSON (shows what's parseable)

---

### 7. Safety and constraints

To keep the template stable and maintainable:

- Only modify:
  - `public/slides/manifest.json`
  - `public/slides/slideNN.json`
  - `public/slides-styles.css` (for global visual refinements)
- Do **not**:
  - Add new external scripts or CDN dependencies.
  - Touch any files under `public/_dev`.
  - Use tags or style properties outside the allowed sets listed above.

When in doubt:
- Copy an existing slide from this template, adjust `text` and `className`, and keep the overall structure and tags consistent.
- Aim for clean, readable JSON and a small, focused set of classes/styles per element. This makes future edits and refinements easier for both you and other agents.
