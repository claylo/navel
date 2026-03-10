// template.typ — Claude Code PDF document template
//
// Anthropic-branded single-column layout for reference documentation.
// Fonts: Anthropic Sans (body), Anthropic Serif Display (headings).

// ── Color palette (from Anthropic brand / theme.css) ──────────────────

#let anthro-black = rgb("#0e0e0e")
#let anthro-body = rgb("#3e3e3e")
#let anthro-muted = rgb("#6e6e6e")
#let anthro-border = rgb("#e0e0e0")
#let anthro-bg-page = rgb("#fdfdf7")  // --background-light from theme.css
#let anthro-bg-code = rgb("#f7f7f2")
#let anthro-accent = rgb("#bf521d")

// ── Font stacks ───────────────────────────────────────────────────────

#let sans-fonts = ("Anthropic Sans Text", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial")
#let serif-fonts = ("Anthropic Serif Display", "Georgia", "Times New Roman", "Times")
#let mono-fonts = ("JetBrains Mono", "SF Mono", "Menlo", "Monaco", "Consolas", "Courier New")

// ── Document template ─────────────────────────────────────────────────

#let claude-code-docs(
  title: "Claude Code",
  subtitle: "Documentation",
  version: "v0.0.0",
  body,
) = {
  // Page setup
  set page(
    paper: "us-letter",
    fill: anthro-bg-page,
    margin: (top: 1in, bottom: 1in, left: 1in, right: 1in),
    header: context {
      if counter(page).get().first() > 2 {
        set text(size: 9pt, fill: anthro-muted, font: sans-fonts)
        [Claude Code Documentation #h(1fr) #version]
        v(4pt)
        line(length: 100%, stroke: 0.5pt + anthro-border)
      }
    },
    footer: context {
      if counter(page).get().first() > 2 {
        line(length: 100%, stroke: 0.5pt + anthro-border)
        v(4pt)
        set text(size: 9pt, fill: anthro-muted, font: sans-fonts)
        [#h(1fr) #counter(page).display() #h(1fr)]
      }
    },
  )

  // Typography defaults
  set text(
    font: sans-fonts,
    size: 10pt,
    fill: anthro-body,
  )
  set par(leading: 0.7em, justify: true)

  // Heading styles
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(2em)
    set text(font: serif-fonts, size: 24pt, fill: anthro-black, weight: "regular")
    block(below: 1em, it.body)
    v(0.5em)
  }

  show heading.where(level: 2): it => {
    v(1.5em)
    set text(font: serif-fonts, size: 18pt, fill: anthro-black, weight: "regular")
    block(below: 0.8em, it.body)
  }

  show heading.where(level: 3): it => {
    v(1em)
    set text(font: sans-fonts, size: 13pt, fill: anthro-black, weight: "semibold")
    block(below: 0.5em, it.body)
  }

  show heading.where(level: 4): it => {
    v(0.8em)
    set text(font: sans-fonts, size: 11pt, fill: anthro-black, weight: "semibold")
    block(below: 0.4em, it.body)
  }

  // Code blocks
  show raw.where(block: true): it => {
    set text(font: mono-fonts, size: 8.5pt)
    block(
      width: 100%,
      fill: anthro-bg-code,
      stroke: 0.5pt + anthro-border,
      radius: 4pt,
      inset: 10pt,
      it,
    )
  }

  // Inline code
  show raw.where(block: false): it => {
    set text(font: mono-fonts, size: 9pt)
    box(
      fill: anthro-bg-code,
      inset: (x: 3pt, y: 1pt),
      radius: 2pt,
      it,
    )
  }

  // Links
  show link: it => {
    set text(fill: anthro-accent)
    underline(it)
  }

  // Tables
  set table(
    stroke: 0.5pt + anthro-border,
    inset: 6pt,
  )
  show table.cell.where(y: 0): set text(weight: "semibold", fill: anthro-black)

  // Blockquotes (used for callouts after component flattening)
  show quote.where(block: true): it => {
    block(
      width: 100%,
      inset: (left: 12pt, y: 8pt),
      stroke: (left: 2pt + anthro-accent),
      it.body,
    )
  }

  // ── Title page ────────────────────────────────────────────────────────

  {
    set page(header: none, footer: none)
    v(3in)
    align(center)[
      #set text(font: serif-fonts, fill: anthro-black)
      #text(size: 36pt, weight: "regular")[#title]
      #v(0.3em)
      #text(size: 18pt, fill: anthro-muted, weight: "regular")[#subtitle]
      #v(1em)
      #text(size: 12pt, fill: anthro-muted, font: sans-fonts)[#version]
      #v(2em)
      #text(size: 10pt, fill: anthro-muted, font: sans-fonts)[
        Generated from #link("https://code.claude.com/docs")[code.claude.com/docs]
      ]
    ]
    pagebreak()
  }

  // ── Table of Contents ─────────────────────────────────────────────────

  {
    set page(header: none, footer: none)
    set text(font: sans-fonts, size: 10pt)
    outline(title: [Table of Contents], indent: 1.5em, depth: 2)
    pagebreak()
  }

  // ── Body ──────────────────────────────────────────────────────────────

  body
}
