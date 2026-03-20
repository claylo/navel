// callouts.typ — Callout admonitions matching code.claude.com/docs style.
// Rounded boxes with tinted background, 1px border, inline SVG icon.
// Colors extracted from the live Mintlify site via computed styles.

// ── Callout color palettes ──────────────────────────────────────────

// Note (blue)
#let _note-bg     = rgb(239, 246, 255)
#let _note-border = rgb(191, 219, 254)
#let _note-icon   = rgb(30, 64, 175)

// Info (neutral gray)
#let _info-bg     = rgb(250, 250, 250)
#let _info-border = rgb(229, 229, 229)
#let _info-icon   = rgb(115, 115, 115)

// Tip (green)
#let _tip-bg      = rgb(240, 253, 244)
#let _tip-border  = rgb(187, 247, 208)
#let _tip-icon    = rgb(22, 101, 52)

// Warning / Caution (yellow)
#let _warn-bg     = rgb(254, 252, 232)
#let _warn-border = rgb(254, 240, 138)
#let _warn-icon   = rgb(133, 77, 14)

// Danger (red)
#let _danger-bg     = rgb(254, 242, 242)
#let _danger-border = rgb(254, 202, 202)
#let _danger-icon   = rgb(153, 27, 27)

// Success / Check (green — same as tip)
#let _check-bg     = _tip-bg
#let _check-border = _tip-border
#let _check-icon   = _tip-icon

// ── Icon paths (relative to this file) ──────────────────────────────

#let _icons = (
  note: "icons/note.svg",
  info: "icons/info.svg",
  tip: "icons/tip.svg",
  warning: "icons/warning.svg",
  danger: "icons/danger.svg",
  check: "icons/check.svg",
)

// ── Callout function ────────────────────────────────────────────────

#let _callout(
  icon-path: none,
  bg: _info-bg,
  border-color: _info-border,
  icon-color: _info-icon,
  body,
) = {
  block(
    width: 100%,
    breakable: false,
    above: 1em,
    below: 1em,
    radius: 10pt,
    stroke: 1pt + border-color,
    fill: bg,
    inset: (x: 16pt, y: 12pt),
    {
      grid(
        columns: (14pt, 1fr),
        column-gutter: 10pt,
        align: (top, top),
        {
          // Icon — colored via text fill since SVGs use currentColor
          if icon-path != none {
            set text(fill: icon-color)
            image(icon-path, width: 12pt)
          }
        },
        body,
      )
    },
  )
}

// ── Public callout functions ────────────────────────────────────────

#let info(title: none, body) = _callout(
  icon-path: _icons.info, bg: _info-bg, border-color: _info-border, icon-color: _info-icon, body,
)

#let tip(title: none, body) = _callout(
  icon-path: _icons.tip, bg: _tip-bg, border-color: _tip-border, icon-color: _tip-icon, body,
)

#let warning(title: none, body) = _callout(
  icon-path: _icons.warning, bg: _warn-bg, border-color: _warn-border, icon-color: _warn-icon, body,
)

#let danger(title: none, body) = _callout(
  icon-path: _icons.danger, bg: _danger-bg, border-color: _danger-border, icon-color: _danger-icon, body,
)

#let success(title: none, body) = _callout(
  icon-path: _icons.check, bg: _check-bg, border-color: _check-border, icon-color: _check-icon, body,
)

#let memo(title: none, body) = _callout(
  icon-path: _icons.note, bg: _note-bg, border-color: _note-border, icon-color: _note-icon, body,
)
