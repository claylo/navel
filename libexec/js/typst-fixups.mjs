// Post-conversion fixups for Typst output produced by markdown2typst.
//
// These functions repair cases where markdown2typst emits syntactically
// invalid Typst and operate purely on strings, so they are easy to unit-test.

/**
 * Escape `/` before a strong-emphasis closing `*` so Typst doesn't read the
 * trailing `/*` as a block-comment opener.
 *
 * Source markdown `**Cmd+/**` becomes Typst `*Cmd+/*`. Typst then parses
 * this as `*` (strong open) + `Cmd+` + `/*` (block-comment open that never
 * closes), and the build dies with "unclosed delimiter". Replacing the
 * slash with `\/` produces `*Cmd+\/*`, which parses as strong("Cmd+/").
 *
 * Skips content inside fenced code blocks (where `/*` is intentional raw
 * text — e.g. a JSON sample with `arn:...:inference-profile/*`). Inline
 * code spans and string literals are unaffected by the regex because the
 * surrounding strong markers don't appear inside them in markdown2typst
 * output.
 */
export function escapeSlashBeforeStrongClose(typstContent) {
  if (!typstContent.includes("/*")) return typstContent;

  const lines = typstContent.split("\n");
  let inFence = false;
  let fenceLen = 0;

  return lines.map(line => {
    const trimmed = line.trim();

    // Track fences (mirrors the fence-tracking logic in pdf-render.mjs)
    const fenceMatch = trimmed.match(/^(`{3,})/);
    if (fenceMatch) {
      const ticks = fenceMatch[1].length;
      if (!inFence) {
        inFence = true;
        fenceLen = ticks;
        return line;
      } else if (ticks >= fenceLen && trimmed.replace(/`/g, "").trim() === "") {
        inFence = false;
        fenceLen = 0;
        return line;
      }
      return line;
    }

    if (inFence) return line;
    if (!line.includes("/*")) return line;

    // Match `*content/*` — the opening `*` must be at a strong-open
    // boundary (start of line or after whitespace/open-bracket), so we
    // don't grab the close-`*` of a previous strong span. Content
    // excludes `*` and newline so we never cross spans or lines.
    return line.replace(/(^|[\s(\[{])\*([^*\n]+?)\/\*/g, "$1*$2\\/*");
  }).join("\n");
}

/**
 * Repair markdown2typst's \` escape sequences inside inline raw text.
 *
 * markdown2typst uses `\`` to mean "literal backtick inside raw content",
 * but Typst's raw text is literal — it does not process escapes — so
 * ``\`foo\\`bar\` `` parses as an unclosed raw + stray backtick. We rewrite
 * these spans to use multi-backtick delimiters with appropriate padding.
 *
 * GUARD: only process lines with an ODD number of backticks. A genuine
 * markdown2typst escape adds exactly one extra ` to its span (open +
 * escape + close = 3 instead of 2), so odd parity is the signature of a
 * broken span Typst will reject. Even parity means every span is already
 * closed correctly — any \` on that line is a literal backslash before a
 * closing delimiter (e.g. `ctrl+\`) and must be left alone. Without this
 * guard the regex can greedy-match across adjacent spans, mis-treating
 * inter-span prose as escape content.
 */
export function fixEscapedBackticks(typstContent) {
  if (!typstContent.includes("\\`")) return typstContent;

  return typstContent.split("\n").map(line => {
    if (!line.includes("\\`")) return line;
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount % 2 === 0) return line;

    // Replace raw spans containing \` — match opening `, content
    // with at least one \`, and closing `. Iterate since fixing one
    // span may reveal another (adjacent spans can merge).
    let prev;
    do {
      prev = line;
      line = line.replace(/`([^`\n]+?\\`[^`\n]*?)`/g, (_, inner) => {
        const unescaped = inner.replace(/\\`/g, "`");
        const maxTicks = (unescaped.match(/`+/g) || [])
          .reduce((max, m) => Math.max(max, m.length), 0);
        // Typst inline raw needs 3+ backtick delimiters to contain backticks.
        const delimLen = Math.max(3, maxTicks + 1);
        const delim = "`".repeat(delimLen);
        // Typst multi-backtick raw text needs space padding when
        // content starts or ends with a backtick.
        const pad = unescaped.startsWith("`") || unescaped.endsWith("`") ? " " : "";
        return `${delim}${pad}${unescaped}${pad}${delim}`;
      });
    } while (line !== prev);
    return line;
  }).join("\n");
}
