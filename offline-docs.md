# Building offline documentation

navel can build offline copies of the Claude Code documentation in two
formats: a typeset **PDF** with Anthropic brand fonts, and a **Dash docset**
for instant search in [Dash](https://kapeli.com/dash) (macOS),
[Zeal](https://zealdocs.org/) (Linux/Windows), or
[Velocity](https://velocity.silverlakesoftware.com/) (Windows).

The documentation content comes from code.claude.com — you fetch your own
copy and build locally. navel distributes the **tooling**, not the built
artifacts, because the documentation is copyrighted by Anthropic.

## Shared prerequisites

Both formats start from the same fetched docs:

```bash
navel docs sync      # fetch latest docs from code.claude.com
npm install          # install Node.js dependencies (first time only)
```

| Tool | Install | Used by |
|------|---------|---------|
| Node.js | `brew install node` | Both PDF and Dash builds |
| npm dependencies | `npm install` (at repo root) | Both builds |

---

## PDF

A typeset reference with table of contents, glossary, index, running
headers, and Anthropic brand typography.

### Additional prerequisites

| Tool | Install |
|------|---------|
| Typst | `brew install typst` or `cargo install typst-cli` |

Fonts (Anthropic Sans, Anthropic Serif Display, JetBrains Mono) are
downloaded automatically on first build and cached in `pdf/fonts/`.

### Quick build

```bash
navel pdf
```

Output: `build/claude-code-docs.pdf` (~14 MB, ~760 pages)

### Step by step

**Prep** converts docs to Typst intermediates:

```bash
navel pdf prep
```

This flattens MDX components (Tabs, Accordions, Steps, Cards) to plain
markdown, converts to Typst via `markdown2typst`, applies Typst-specific
transforms (callout styling, heading hierarchy, image localization), and
generates page files in `build/_typ/`.

Also produces colophon data:

- `build/colophon-terms.yaml` — glossary terms with definitions, aliases,
  cross-references, and source locations
- `build/colophon-candidates.yaml` — candidate terms scored by frequency

**Compile** turns Typst intermediates into the PDF:

```bash
navel pdf compile
```

### Print mode

```bash
navel pdf compile --print
```

Produces a print-ready variant:

- White background (instead of cream)
- Alternating verso/recto running headers
- Sections start on recto (odd) pages with blank verso inserts

The `--print` flag works in any position (`navel pdf --print`, `navel pdf
compile --print`, `navel pdf --print compile`).

### What the PDF includes

- Table of contents (two-level, matching site navigation)
- All 67+ doc pages with Anthropic brand typography
- Callout blocks matching the site's Mintlify components
- Code blocks in JetBrains Mono
- Running headers with section-aware titles
- Colophon, glossary, and alphabetized index

### Template files

| File | Purpose |
|------|---------|
| `pdf/main.typ` | Document root — pages, colophon, glossary, index |
| `pdf/template.typ` | Layout, typography, heading styles, header/footer |
| `pdf/callouts.typ` | Callout admonition styles |
| `pdf/icons/` | SVG icons for callout types |
| `pdf/fonts/` | Downloaded fonts (gitignored) |

### Clean

```bash
navel pdf clean
```

---

## Dash docset

A searchable docset for Dash, Zeal, or Velocity with full-text search,
table of contents entries, and styled HTML matching code.claude.com.

### Additional prerequisites

| Tool | Install |
|------|---------|
| sqlite3 | Ships with macOS; `apt install sqlite3` on Linux |

The navigation map is also required:

```bash
navel nav sync       # fetch navigation structure (first time only)
```

### Quick build

```bash
navel dash
```

Output: `build/ClaudeCode.docset/`

### Step by step

The build runs three phases automatically:

1. **Render HTML** — converts `docs/*.md` to styled HTML using Mintlify
   components, generates a search index manifest
2. **Localize images** — downloads remote images and icons referenced in
   the HTML, caches them locally
3. **Assemble docset** — creates the `.docset` bundle with `Info.plist`,
   copies HTML/CSS/assets, builds the SQLite search index from the manifest

### Versioned builds

```bash
navel dash --with-version-number
```

Produces `build/ClaudeCode-X.Y.Z.docset/` using the latest cached npm
version. Useful when maintaining multiple docset versions side by side.

### Docset structure

```
ClaudeCode.docset/
├── Contents/
│   ├── Info.plist
│   └── Resources/
│       ├── docSet.dsidx          # SQLite search index
│       └── Documents/
│           ├── *.html            # Rendered docs
│           ├── mintlify.css      # Content styles
│           ├── theme.css         # Theme overrides
│           └── images/           # Localized images
├── icon.png
└── icon@2x.png
```

### Installing

**Dash (macOS):** Double-click `build/ClaudeCode.docset` or drag it into
Dash preferences.

**Zeal (Linux/Windows):** Copy the `.docset` directory to Zeal's docset
path (typically `~/.local/share/Zeal/Zeal/docsets/`).

### Clean

```bash
navel dash clean
```

---

## Updating

When Anthropic updates their docs:

```bash
navel docs sync     # fetch changes (with diff detection)
navel pdf           # rebuild PDF
navel dash          # rebuild Dash docset
```

`navel update` runs `docs sync` as part of its full update cycle but does
not automatically rebuild the PDF or Dash docset.
