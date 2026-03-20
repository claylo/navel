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
#let anthro-bg-code = rgb("#eeeee9")
#let anthro-accent = rgb("#bf521d")

// ── Font stacks ───────────────────────────────────────────────────────

#let sans-fonts = ("Anthropic Sans Text")
#let serif-fonts = ("Anthropic Serif Display")
#let mono-fonts = ("JetBrains Mono")

// ── Build flags ──────────────────────────────────────────────────────
// Pass --input print=true for print-ready output (white background,
// alternating verso/recto running headers).

#let print-mode = sys.inputs.at("print", default: "false") == "true"

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
    fill: if print-mode { white } else { anthro-bg-page },
    margin: (top: 1in, bottom: 1in, left: 1in, right: 1in),
    header: context {
      let pg = counter(page).get().first()
      let all-h1 = query(heading.where(level: 1))
      let on-part-page = all-h1.any(h => counter(page).at(h.location()).first() == pg)
      // In print mode, blank verso pages after part dividers get no chrome
      let on-blank-verso = if print-mode {
        all-h1.any(h => counter(page).at(h.location()).first() + 1 == pg)
      } else { false }
      let past-h1 = query(heading.where(level: 1).before(here()))
      // Show only on body pages (past first H1, not on part/blank dividers)
      if pg > 2 and not on-part-page and not on-blank-verso and past-h1.len() > 0 {
        set text(size: 8pt, fill: anthro-muted, font: sans-fonts, tracking: 0.05em)
        // Resolve current section title (H2 if in current H1 section, else H1)
        let past-h2 = query(heading.where(level: 2).before(here()))
        let h2-in-section = if past-h2.len() > 0 {
          let h2-pg = counter(page).at(past-h2.last().location()).first()
          let h1-pg = counter(page).at(past-h1.last().location()).first()
          h2-pg >= h1-pg
        } else { false }
        let section = if h2-in-section { past-h2.last().body } else { past-h1.last().body }
        if print-mode {
          // Print: alternating verso/recto
          if calc.even(pg) {
            [#counter(page).display() #h(1fr) #upper(past-h1.last().body)]
          } else {
            [#upper(section) #h(1fr) #counter(page).display()]
          }
        } else {
          // Screen: consistent layout — section title left, page number right
          [#upper(section) #h(1fr) #counter(page).display()]
        }
      }
    },
    footer: context {
      let pg = counter(page).get().first()
      let all-h1 = query(heading.where(level: 1))
      let on-part-page = all-h1.any(h => counter(page).at(h.location()).first() == pg)
      let on-blank-verso = if print-mode {
        all-h1.any(h => counter(page).at(h.location()).first() + 1 == pg)
      } else { false }
      let past-h1 = query(heading.where(level: 1).before(here()))
      if pg > 2 and not on-part-page and not on-blank-verso and past-h1.len() > 0 {
        set text(size: 8pt, fill: anthro-muted, font: sans-fonts)
        [#version · Generated #datetime.today().display("[year]-[month]-[day]")]
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
  // Level 1 = nav group ("Part") — section divider page
  // Level 2 = page title (shifted from H1 via heading offset)
  // Level 3 = page section (shifted from H2)
  // Level 4 = subsection (shifted from H3)
  // Level 5 = sub-subsection / step titles (shifted from H4)

  show heading.where(level: 1): it => {
    if print-mode {
      pagebreak(to: "odd")   // Part dividers on recto
    } else {
      pagebreak(weak: true)
    }
    v(2.5in)
    set text(font: serif-fonts, size: 28pt, fill: anthro-muted, weight: "regular")
    block(below: 1em, it.body)
    if print-mode {
      pagebreak(to: "odd")   // Content starts on recto (blank verso between)
    } else {
      pagebreak()
    }
  }

  show heading.where(level: 2): it => {
    v(2em)
    set text(font: serif-fonts, size: 24pt, fill: anthro-black, weight: "regular")
    block(below: 1em, it.body)
    v(0.5em)
  }

  show heading.where(level: 3): it => {
    v(1.5em)
    set text(font: serif-fonts, size: 18pt, fill: anthro-black, weight: "regular")
    block(below: 0.8em, it.body)
  }

  show heading.where(level: 4): it => {
    v(1em)
    set text(font: sans-fonts, size: 13pt, fill: anthro-black, weight: "semibold")
    block(below: 0.5em, it.body)
  }

  show heading.where(level: 5): it => {
    v(0.8em)
    set text(font: sans-fonts, size: 11pt, fill: anthro-black, weight: "semibold")
    block(below: 0.4em, it.body)
  }

  // Code blocks — kept together on a single page
  show raw.where(block: true): it => {
    set text(font: mono-fonts, size: 8.5pt)
    block(
      width: 100%,
      breakable: false,
      fill: anthro-bg-code,
      stroke: 0.5pt + anthro-border,
      radius: 4pt,
      inset: 10pt,
      it,
    )
  }

  // Inline code — outset keeps baseline aligned with body text
  show raw.where(block: false): it => {
    set text(font: mono-fonts, size: 9pt)
    box(
      fill: anthro-bg-code,
      inset: (x: 4pt, y: 0pt),
      outset: (y: 3pt),
      radius: 3pt,
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
    v(2.5in)
    line(length: 2in, stroke: 3pt + anthro-accent)
    v(0.8em)
    text(font: serif-fonts, size: 42pt, fill: anthro-black, weight: "regular")[#title]
    v(0.3em)
    text(font: serif-fonts, size: 20pt, fill: anthro-muted, weight: "regular")[#subtitle]
    v(2em)
    text(font: sans-fonts, size: 11pt, fill: anthro-muted)[#version]
    v(1fr)
    text(font: sans-fonts, size: 9pt, fill: anthro-muted)[
      Generated from #link("https://code.claude.com/docs")[code.claude.com/docs]
    ]
    pagebreak()
  }

  // ── Table of Contents ─────────────────────────────────────────────────
  // Manual title — outline(title:) emits a level-1 heading, which triggers
  // the part-divider show rule (pagebreaks on both sides). Styling matches H2.

  v(2em)
  text(font: serif-fonts, size: 24pt, fill: anthro-black)[Table of Contents]
  v(1em)
  outline(title: none, indent: 1.5em, depth: 2)
  pagebreak()

  // ── Body ──────────────────────────────────────────────────────────────

  body
}
