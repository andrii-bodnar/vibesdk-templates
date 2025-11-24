## Usage Guide – Reveal Presentation Pro

### 1. Quick Start

This template generates **Reveal.js presentations** using JSON slide definitions. Each slide is a JSON file describing an element tree (similar to JSX/HTML) with Tailwind classes for styling. A shared design system provides gradients, glass morphism, typography, and animations.

**Your role:** Generate JSON slide files that the runtime renderer converts to UI.

**Working examples:** The template includes working example slides in `public/slides/` (typically slide01-06.json) demonstrating:
- Various layout patterns (centered, split, grid)
- Icon usage with SVG elements
- Glass morphism effects and variants
- Fragment-based progressive disclosure
- Chart integration (Recharts components)
- Different background types

**Copy patterns from these examples** when building new slides - they show proper JSON structure, component usage, and styling techniques.

---

### 2. Critical Constraints

#### ✅ Always Do
- Generate valid JSON only (no trailing commas, no comments, double quotes)
- Use `type: "svg"` with `icon: "IconName"` for Lucide icons
- Update `public/slides/manifest.json` after creating/removing slides
- Reference existing slides (slide01-06.json) for syntax patterns
- Use template CSS classes and Tailwind utilities for styling

#### ❌ Never Do
- Modify `public/_dev/` files (runtime infrastructure - will break template)
- Modify `public/index.html` (bootstrap file)
- Create `.jsx` or `.tsx` files (template uses JSON only, not code)
- Try to install npm packages (sandbox is static)
- Use event handlers (`onClick`, `onChange`, etc. - no JavaScript runtime)
- Use `"type": "Icon"` (wrong - use `"type": "svg"` instead)
- Reference non-existent components not in catalog below

#### 🔧 Quick Fixes

| Problem | Fix |
|---------|-----|
| Icon not rendering | Use `{"type": "svg", "icon": "IconName", "className": "..."}` |
| Slide not appearing | Add filename to `manifest.json` slides array |
| Invalid JSON error | Remove trailing commas, comments, single quotes |
| Component not found | Use only components from catalog (Section 4) |
| CSS not applying | Use classes from slides-styles.css or Tailwind |

---

### 3. Slide JSON Reference

#### File Structure

Each `public/slides/slideNN.json` file:

```json
{
  "id": "slide01",
  "canvas": {"width": 1920, "height": 1080},
  "root": {
    "type": "div",
    "className": "layout-center",
    "children": [
      {
        "type": "h1",
        "className": "slide-title text-shadow-glow-white-md mb-8",
        "children": [{
          "type": "span",
          "className": "bg-gradient-to-r from-purple-300 to-pink-500 bg-clip-text text-transparent",
          "text": "Slide Title"
        }]
      },
      {
        "type": "div",
        "className": "glass-purple p-8 rounded-2xl",
        "children": [
          {
            "type": "div",
            "className": "flex items-center gap-4 mb-4",
            "children": [
              {"type": "svg", "icon": "Rocket", "size": 32, "className": "text-purple-400"},
              {"type": "p", "className": "text-xl", "text": "Feature description"}
            ]
          },
          {
            "type": "p",
            "className": "fragment fade-in",
            "data-fragment-index": 0,
            "text": "This appears on click"
          }
        ]
      }
    ]
  },
  "metadata": {
    "title": "Slide Title",
    "notes": "Speaker notes here",
    "background": {
      "type": "mesh",
      "colors": ["#8b5cf6", "#ec4899"],
      "animation": "slow"
    }
  }
}
```

#### Element Schema

```typescript
{
  type: string;                    // HTML tag or component name
  className?: string;              // Tailwind classes
  icon?: string;                   // For type: "svg" - Lucide icon name
  size?: number;                   // For type: "svg" - icon size
  text?: string;                   // Text content
  children?: Element[];            // Nested elements
  props?: Record<string, any>;     // For chart components
  "data-fragment-index"?: number;  // Fragment reveal order
  role?: string;                   // ARIA role
}
```

**Allowed HTML types:** div, section, header, footer, h1-h6, p, span, strong, em, blockquote, ul, ol, li, img, pre, code, svg, button, a

**Manifest format:**
```json
{
  "slides": ["slide01.json", "slide02.json", "slide03.json"],
  "metadata": {
    "title": "Presentation Title",
    "theme": "dark",
    "transition": "slide"
  }
}
```

---

### 4. Component Catalog

#### Icons (35 available, use `type: "svg"`)

| Category | Icons |
|----------|-------|
| **UI** | Sparkles, Check, Star, Zap, ChevronRight, ArrowRight |
| **Symbols** | Rocket, Target, Award, Trophy, Heart, Lightbulb |
| **Tech** | Code, Database, Globe, Lock, TestTube |
| **Actions** | Upload, Download, Search, Settings, Mail, Phone |
| **Data** | BarChart2, BarChart3, Activity, TrendingUp |
| **People** | Users, Calendar, Clock, Quote, Shield, AlertCircle |

**Usage:** `{"type": "svg", "icon": "Rocket", "size": 24, "className": "text-purple-400"}`

#### Charts (Recharts components)

**Containers:** BarChart, LineChart, AreaChart, PieChart, RadarChart
**Elements:** Bar, Line, Area, Pie, Radar
**Axes:** XAxis, YAxis, CartesianGrid, PolarGrid, PolarAngleAxis, PolarRadiusAxis
**Accessories:** Tooltip, Legend, ResponsiveContainer, Cell

**Example:** Check example slides for complete chart implementations with data, axes, tooltips, and styling.

#### CSS Classes

| Category | Classes |
|----------|---------|
| **Typography** | slide-title, slide-subtitle, slide-heading, slide-display, slide-stat, slide-caption |
| **Glass** | glass, glass-panel, glass-blue, glass-purple, glass-cyan, glass-emerald |
| **Layout** | layout-center, layout-split, layout-default, grid-2, grid-3 |
| **Effects** | hover-lift, hover-glow, text-gradient, text-shadow-glow-white-md |
| **Fragments** | fragment, fade-in, fade-in-then-semi-out |

#### Backgrounds (metadata.background)

| Type | Properties | Example |
|------|------------|---------|
| **mesh** | colors: string[], animation: "slow"\|"medium"\|"fast" | `{"type":"mesh","colors":["#7c3aed","#6366f1"],"animation":"slow"}` |
| **particles** | count: number, color: string, speed: "slow"\|"medium"\|"fast" | `{"type":"particles","count":40,"color":"#a855f7","speed":"medium"}` |
| **mesh-particles** | (combines mesh + particles) | `{"type":"mesh-particles","colors":["#8b5cf6"],"animation":"slow","count":30,"color":"#a855f7"}` |
| **gradient** | colors: string[] | `{"type":"gradient","colors":["#1e293b","#334155"]}` |
| **solid** | color: string | `{"type":"solid","color":"#0f172a"}` |

---

### 5. Fragments & Workflow

#### Progressive Disclosure (Fragments)

Add `"className": "fragment"` to elements for step-by-step reveals:

```json
{
  "type": "p",
  "className": "fragment fade-in",
  "data-fragment-index": 0,
  "text": "Appears on first click"
}
```

- Fragments appear in DOM order by default
- Use `data-fragment-index` to control order explicitly
- During live generation, fragments show immediately
- After generation, fragments work as step-by-step reveals

#### Live Preview

Slides appear in real-time as you generate them - just create valid JSON files and they'll render automatically in the presentation.

---

### 6. Theme Customization

#### CSS Variables (edit `public/slides-styles.css`)

Customize theme by editing CSS variables:

```css
:root {
  --bg-gradient: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --font-display: 'Inter', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --accent-gradient: linear-gradient(to right, #8b5cf6, #ec4899);
  --glass-bg: rgba(15, 23, 42, 0.7);
}
```

**When to customize:** Only when default theme doesn't match user's requested aesthetic (cyberpunk, corporate, playful, etc.). Default theme works for most presentations.

**What you can change:** Colors, fonts, gradients, glass opacity, glow effects, animations.

---

## Summary

- **Work with:** Slide JSON files, manifest.json, optionally slides-styles.css
- **Never touch:** _dev/ directory, index.html, build files
- **Learn from:** Example slides in public/slides/ (working patterns to copy)
- **Reference:** Component catalog (Section 4) for available icons, charts, classes
- **Generate:** Valid JSON only - runtime handles rendering
