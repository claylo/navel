# Legal Analysis: navel Extraction and Scanning Methods

**Date:** 2026-02-28
**Scope:** Extraction and scanning tools in this repository, assessed against
the license and terms governing `@anthropic-ai/claude-code`.

> **Disclaimer:** This is a technical analysis, not legal advice. Consult an
> attorney for decisions affecting your use of Anthropic's services.

---

## License Posture of Claude Code

Claude Code is distributed on npm under `@anthropic-ai/claude-code`. Its
`LICENSE.md` reads:

> © Anthropic PBC. All rights reserved. Use is subject to Anthropic's
> Commercial Terms of Service.

The `package.json` field is `"license": "SEE LICENSE IN README.md"`.

**Claude Code is not open source.** The GitHub repository
(`anthropics/claude-code`) is public but contains scripts, plugins, examples,
and documentation — not the CLI source. The CLI itself is a single 11 MB
minified JavaScript bundle (`cli.js`) distributed via npm with all rights
reserved. The SPDX identifier is absent; the license is proprietary.

Two sets of terms govern use depending on subscription tier:

| Tier | Governing terms |
|------|----------------|
| Free, Pro, Max | [Consumer Terms of Service](https://www.anthropic.com/legal/consumer-terms) |
| Team, Enterprise, API | [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms) |

Both are supplemented by the [Acceptable Use Policy](https://www.anthropic.com/legal/aup).

---

## Relevant Contractual Restrictions

### Consumer Terms (Section 3)

> You agree not to use our Services ... To decompile, reverse engineer,
> disassemble, or otherwise reduce our Services to human-readable form,
> **except when these restrictions are prohibited by applicable law.**

### Commercial Terms (Section D.4)

> Customer may not and must not attempt to (a) access the Services to build a
> competing product or service ... (b) **reverse engineer or duplicate the
> Services**; or (c) support any third party's attempt at any of the conduct
> restricted in this sentence.

### Acceptable Use Policy

Prohibits unauthorized vulnerability discovery/exploitation and "jailbreaking
or prompt injection" without prior Anthropic authorization.

---

## Analysis by Method

### 1. API Gateway Intercept (`libexec/js/api-capture.mjs`)

**What it does:** Runs Claude Code normally, but sets `ANTHROPIC_BASE_URL` to a
local HTTP server. Captures the `messages.create()` request payload — including
the system prompt — that Claude Code sends on its behalf. Returns a minimal
valid response so Claude Code exits cleanly.

**Legal posture: Strongest.**

- **No reverse engineering.** The tool does not read, parse, decompile, or
  analyze `cli.js`. It treats Claude Code as a black box. The binary runs
  unmodified.

- **Captures your own API request.** The payload is an HTTP request that Claude
  Code constructs and sends from your machine, using your credentials, through
  your network stack. You are the client. The request originates from your
  process and is destined for an API endpoint you are authorized to call. The
  tool merely records the request before it leaves your machine — analogous to
  running a proxy, HTTP debugger, or `mitmproxy`.

- **No circumvention of access controls.** The tool does not bypass
  authentication, encryption, or any technical protection measure. It uses a
  documented environment variable (`ANTHROPIC_BASE_URL`) that Claude Code
  intentionally exposes for configuration.

- **CFAA / unauthorized access.** The Computer Fraud and Abuse Act (18 U.S.C.
  § 1030) prohibits accessing a "protected computer" without authorization.
  Here, the only computer accessed is your own localhost. No Anthropic server is
  contacted. The fake API key never reaches Anthropic's infrastructure.

- **The system prompt is not a trade secret in this context.** It is
  transmitted in plaintext to every API client on every request. There is no
  server-side secret — the prompt is part of the client-side request payload
  that Claude Code assembles locally from bundled constants.

- **Precedent.** Browser DevTools, Charles Proxy, Wireshark, `mitmproxy`, and
  `tcpdump` all operate on the same principle: inspecting traffic between
  software on your machine and a remote service. No court has held that
  recording your own outbound HTTP requests constitutes reverse engineering.

### 2. Hook and Command Scanning (`libexec/update-hooks-list`, `libexec/update-commands-list`)

**What it does:** Uses `rg` (ripgrep) to pattern-match hook event names and
command definitions in `cli.js`. Extracts metadata — names, summaries,
descriptions — not prompt content or behavioral instructions.

**Legal posture: Low-medium risk.**

- **Reads and pattern-matches proprietary source.** The tools scan `cli.js`
  with regex patterns to locate identifiers. This involves reading proprietary
  code, which both the Consumer Terms and Commercial Terms restrict.

- **Extracts factual identifiers, not creative content.** The extracted data
  consists of hook event names (e.g., "SessionStart", "PreToolUse") and command
  names (e.g., "batch", "debug") — functional interface identifiers that users
  interact with directly through documented APIs. No prompt text, tool schemas,
  or behavioral instructions are extracted.

- **Lower risk than prompt extraction** because:
  - The names are functional interfaces, not creative expression
  - Users encounter these identifiers through normal use of the software
  - The information is partially documented in Anthropic's own public docs
  - No copyrightable expression is reproduced

- **Statutory exceptions apply.** The Consumer Terms' "except when prohibited by
  applicable law" carve-out is relevant. Identifying interface names for
  interoperability purposes falls squarely within fair use and the EU Software
  Directive's Article 5(3) (observing, studying, and testing program
  functioning).

### 3. Automated Public Commits

**What it does:** A CI workflow publishes extracted metadata to a public GitHub
repository. The committed data consists of:

- Version numbers (factual data from the npm public registry)
- Hook event names (functional identifiers)
- Command names and brief descriptions (functional metadata)
- Documentation coverage status (derived analysis)

**Legal posture: Low risk.**

- **Factual metadata about publicly distributed software.** Version numbers,
  interface names, and documentation coverage status are factual information,
  not copyrightable expression. This is comparable to sites that track API
  changes, dependency updates, or feature matrices across software versions.

- **No prompt content or source code is published.** The repository contains
  only metadata derived from scanning — not the scanned source itself or any
  extracted prompt text.

- **Public registry data.** Version numbers and publication dates come from the
  npm public registry, which is freely accessible without authentication.

---

## Summary

| Method | Reads source? | Runs Claude Code? | Reverse engineering? | Risk |
|--------|:---:|:---:|:---:|:---:|
| API gateway intercept | No | Yes (unmodified) | No | Low |
| Hook/command scanning | Yes (regex) | No | Arguably | Low-medium |
| Automated public commits | No (derived data) | No | No | Low |

---

## The System Prompt Itself

Regardless of extraction method, the system prompt is:

- **Not encrypted or access-controlled.** It is assembled client-side and sent
  as plaintext in every API request.

- **Visible to any HTTP proxy or debugging tool.** Any user running Charles
  Proxy, Fiddler, or browser DevTools on API traffic can see it.

- **Included in the distributed binary.** The string constants that form the
  prompt are embedded in `cli.js`, which is publicly distributed via npm.

- **Functional, not creative.** The prompt is a set of behavioral instructions
  for an AI model — closer to configuration than to a creative literary work.
  This is relevant to both copyright (thin protection for functional works) and
  trade secret analysis (no reasonable measures to maintain secrecy when the
  content is distributed to every user).

---

## Applicable Law Considerations

### United States

- **CFAA (18 U.S.C. § 1030):** No unauthorized access to any protected
  computer occurs with any of these methods. All three operate on locally
  possessed files or localhost network traffic.

- **DMCA (17 U.S.C. § 1201):** No technological protection measure is
  circumvented. Minification is not a TPM.

- **Copyright (17 U.S.C. § 107):** Fair use analysis favors extracting
  functional instructions (not creative expression) from lawfully obtained
  software for personal analysis, with no market harm to Anthropic.

- **Contract:** The Consumer and Commercial Terms are the primary constraint.
  The Consumer Terms include an express statutory carve-out. The Commercial
  Terms do not, but are subject to the same underlying law.

### European Union

- **EU Software Directive (2009/24/EC), Article 5(3):** A lawful user may
  observe, study, or test the functioning of a program to determine the ideas
  and principles underlying it, without authorization.

- **Article 6:** Decompilation is permitted for interoperability purposes under
  specific conditions.

---

## Recommendations

1. **Prefer the API gateway intercept** for prompt capture. It avoids all
   reverse engineering arguments entirely.

2. **Hook and command scanning is low-risk metadata extraction.** The extracted
   data consists of functional identifiers, not creative content.

3. **Do not redistribute extracted prompt text commercially** or use it to
   build competing products. The Commercial Terms explicitly prohibit this
   (Section D.4(a)).

4. **Do not use extracted prompts for prompt injection or jailbreaking.** The
   Acceptable Use Policy prohibits this without Anthropic authorization.
