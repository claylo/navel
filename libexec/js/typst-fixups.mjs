// Post-conversion fixups for Typst output produced by markdown2typst.
//
// These functions repair cases where markdown2typst emits syntactically
// invalid Typst and operate purely on strings, so they are easy to unit-test.

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
