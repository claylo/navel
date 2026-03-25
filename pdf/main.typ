// Claude Code Documentation — PDF
//
// Compiled with: typst compile --root $REPO_ROOT --font-path pdf/fonts/ pdf/main.typ
// Fonts: Anthropic Sans + Anthropic Serif Display (downloaded at build time, embedded in PDF)

#import "template.typ": *
#import "@preview/in-dexter:0.7.2": *

#let colophon-mode = sys.inputs.at("colophon", default: "false") == "true"

#show: claude-code-docs.with(
  title: "Claude Code",
  subtitle: "Documentation",
  version: {
    // Read latest version from npm/versions.json
    let versions = json("../npm/versions.json")
    let sorted = versions.sorted(key: v => {
      let parts = v.split(".")
      let nums = parts.map(p => {
        let n = int(p)
        n
      })
      // Zero-pad for correct sorting
      nums.at(0) * 1000000 + nums.at(1) * 1000 + nums.at(2)
    })
    "v" + sorted.last()
  },
)

// Include all pages in navigation order
#include "../build/_typ/pages.typ"

// ── Colophon ──────────────────────────────────────────────────────────

= Colophon

This is an unofficial reference compiled from the
#link("https://code.claude.com/docs")[Claude Code documentation]
published by #link("https://anthropic.com")[Anthropic].

It is not affiliated with or endorsed by Anthropic.

=== Source

Documentation was fetched from `code.claude.com/docs` using the site's
`llms.txt` index. Navigation structure was extracted from the site's
embedded configuration. All content is copyright Anthropic, PBC.

=== Production

Built with #link("https://github.com/claylo/navel")[navel], a toolkit
for tracking Claude Code releases, commands, hooks, and documentation
across versions.

The PDF rendering pipeline flattens MDX components to markdown, converts
to #link("https://typst.app")[Typst] markup via
#link("https://github.com/Mapaor/markdown2typst")[markdown2typst], and
compiles with embedded Anthropic Sans Text and Anthropic Serif Display
typefaces. Code is set in #link("https://www.jetbrains.com/lp/mono/")[JetBrains Mono].

=== Made by

#link("https://github.com/claylo")[Clay Loveless] and
#link("https://claude.ai")[Claude], working together in
#link("https://code.claude.com")[Claude Code].

Source and build instructions:
#link("https://github.com/claylo/navel")[github.com/claylo/navel]

// ── Glossary + Index (opt-in: --input colophon=true) ─────────────────
// Requires colophon (github.com/claylo/colophon) to generate
// build/_typ/pages/glossary.typ and place #index markers in content.

#if colophon-mode {
  pagebreak()
  heading(level: 1)[Glossary]
  include "../build/_typ/pages/glossary.typ"

  pagebreak()
  heading(level: 1)[Index]
  columns(2)[
    // Override heading style inside columns — no pagebreaks allowed
    #show heading: it => {
      set text(font: "Anthropic Sans Text", size: 12pt, fill: rgb("#6e6e6e"), weight: "semibold")
      block(above: 0.8em, below: 0.4em, it.body)
    }
    #make-index(title: none)
  ]
}
