# navel reports

Auto-generated tracking data for Claude Code versions, hooks, and commands.

<details>
<summary>Hooks (23)</summary>

| Hook | Since | Documented |
|------|-------|------------|
| ConfigChange | 2.1.48 | yes |
| **Elicitation** | 2.1.63 | **no** |
| **ElicitationResult** | 2.1.63 | **no** |
| InstructionsLoaded | 2.1.64 | yes |
| Notification | 2.0.0 | yes |
| PermissionRequest | 2.0.45 | yes |
| **PostCompact** | 2.1.76 | **no** |
| PostToolUse | 2.0.0 | yes |
| PostToolUseFailure | 2.0.56 | yes |
| PreCompact | 2.0.0 | yes |
| PreToolUse | 2.0.0 | yes |
| SessionEnd | 2.0.0 | yes |
| SessionStart | 2.0.0 | yes |
| Setup | 2.1.10 | yes |
| Stop | 2.0.0 | yes |
| **StopFailure** | 2.1.78 | **no** |
| SubagentStart | 2.0.43 | yes |
| SubagentStop | 2.0.0 | yes |
| TaskCompleted | 2.1.33 | yes |
| TeammateIdle | 2.1.33 | yes |
| UserPromptSubmit | 2.0.0 | yes |
| WorktreeCreate | 2.1.50 | yes |
| WorktreeRemove | 2.1.50 | yes |

</details>

<details>
<summary>Commands (84)</summary>

| Command | Description | Since | Status | Documented |
|---------|-------------|-------|--------|------------|
| /add-dir | Add a new working directory | 2.0.0 | available | yes |
| /agents | Manage agent configurations | 2.0.0 | available | yes |
| /batch | Research and plan a large-scale change, then execute it i... | 2.1.63 | available | yes |
| /branch | — | 2.1.77 | available | yes |
| **/bridge-kick** | Inject bridge failure states for manual recovery testing | 2.1.76 | *disabled* | **no** |
| **/brief** | Toggle brief-only mode | 2.1.72 | available | **no** |
| /btw | Ask a quick side question without interrupting the main c... | 2.1.6 | available | yes |
| /chrome | Claude in Chrome (Beta) settings | 2.0.71 | available | yes |
| /claude-api | Build apps with the Claude API or Anthropic SDK.\nTRIGGER... | 2.1.69 | available | yes |
| /claude-in-chrome | Automates your Chrome browser to interact with web pages ... | 2.1.7 | available | yes |
| /clear | Clear conversation history and free up context | 2.0.0 | available | yes |
| /color | Set the prompt bar color for this session | 2.1.7 | available | yes |
| /commit | Create a git commit | 2.1.51 | available | yes |
| /commit-push-pr | Commit, push, and open a PR | 2.1.51 | available | yes |
| /compact | Clear conversation history but keep a summary in context.... | 2.0.0 | available | yes |
| /config | Open config panel | 2.0.0 | available | yes |
| /context | Visualize current context usage as a colored grid | 2.0.0 | available | yes |
| /copy | Copy Claude's last response to clipboard (or /copy N for ... | 2.1.20 | available | yes |
| /cost | Show the total cost and duration of the current session | 2.0.0 | available | yes |
| /debug | Enable debug logging for this session and help diagnose i... | 2.1.30 | available | yes |
| /desktop | — | 2.1.42 | available | yes |
| /diff | View uncommitted changes and per-turn diffs | 2.1.50 | available | yes |
| /doctor | Diagnose and verify your Claude Code installation and set... | 2.0.0 | available | yes |
| /effort | Set effort level for model usage | 2.1.76 | available | yes |
| /exit | — | 2.0.0 | available | yes |
| /export | Export the current conversation to a file or clipboard | 2.0.0 | available | yes |
| /extra-usage | Configure extra usage to keep working when limits are hit | 2.0.36 | available | yes |
| /fast | — | 2.1.36 | available | yes |
| /feedback | Submit feedback about Claude Code | 2.0.0 | available | yes |
| **/files** | List all files currently in context | 2.0.0 | *disabled* | yes |
| **/heapdump** | Dump the JS heap to ~/Desktop | 2.1.71 | available | **no** |
| /help | Show help and available commands | 2.0.0 | available | yes |
| /hooks | View hook configurations for tool events | 2.0.0 | available | yes |
| /ide | Manage IDE integrations and show status | 2.0.0 | available | yes |
| /init | — | 2.0.0 | available | yes |
| **/init-verifiers** | Create verifier skill(s) for automated verification of co... | 2.1.51 | available | **no** |
| /insights | Generate a report analyzing your Claude Code sessions | 2.1.30 | available | yes |
| /install | Install Claude Code native build | 2.0.0 | available | yes |
| /install-github-app | Set up Claude GitHub Actions for a repository | 2.0.0 | available | yes |
| /install-slack-app | Install the Claude Slack app | 2.0.62 | available | yes |
| /keybindings | Open or create your keybindings configuration file | 2.1.6 | available | yes |
| **/keybindings-help** | — | 2.1.20 | available | **no** |
| /login | — | 2.0.0 | available | yes |
| /logout | Sign out from your Anthropic account | 2.0.0 | available | yes |
| /loop | Run a prompt or slash command on a recurring interval (e.... | 2.1.71 | available | yes |
| /mcp | Manage MCP servers | 2.0.0 | available | yes |
| /memory | Edit Claude memory files | 2.0.0 | available | yes |
| /mobile | — | 2.0.72 | available | yes |
| /model | — | 2.0.0 | available | yes |
| /output-style | — | 2.0.0 | available | yes |
| /passes | — | 2.0.45 | available | yes |
| /permissions | — | 2.0.0 | available | yes |
| /plan | Enable plan mode or view the current session plan | 2.0.56 | available | yes |
| /plugin | — | 2.0.12 | available | yes |
| /pr-comments | Get comments from a GitHub pull request | 2.0.0 | available | yes |
| /privacy-settings | View and update your privacy settings | 2.0.0 | available | yes |
| **/rate-limit-options** | — | 2.0.43 | available | **no** |
| /release-notes | — | 2.0.0 | available | yes |
| /reload-plugins | Activate pending plugin changes in the current session | 2.1.64 | available | yes |
| /remote-control | — | 2.1.51 | available | yes |
| /remote-env | — | 2.0.47 | available | yes |
| /rename | Rename the current conversation | 2.0.41 | available | yes |
| /resume | Resume a previous conversation | 2.0.0 | available | yes |
| /review | Review a pull request | 2.0.0 | available | yes |
| /rewind | — | 2.0.0 | available | yes |
| /security-review | Complete a security review of the pending changes on the ... | 2.0.0 | available | yes |
| /session | — | 2.1.15 | available | yes |
| /simplify | Review changed code for reuse, quality, and efficiency, t... | 2.1.63 | available | yes |
| /skills | List available skills | 2.0.73 | available | yes |
| /stats | Show your Claude Code usage statistics and activity | 2.0.63 | available | yes |
| /status | Show Claude Code status including version, model, account... | 2.0.0 | available | yes |
| /statusline | — | 2.0.0 | available | yes |
| /stickers | Order Claude Code stickers | 2.0.32 | available | yes |
| **/tag** | — | 2.0.65 | *disabled* | yes |
| /tasks | — | 2.0.45 | available | yes |
| /terminal-setup | — | 2.0.0 | available | yes |
| /theme | Change the theme | 2.0.73 | available | yes |
| **/think-back** | Your 2025 Claude Code Year in Review | 2.0.66 | available | **no** |
| **/thinkback-play** | Play the thinkback animation | 2.0.66 | available | **no** |
| /upgrade | Upgrade to Max for higher rate limits and more Opus | 2.0.0 | available | yes |
| /usage | Show plan usage limits | 2.0.0 | available | yes |
| /vim | Toggle between Vim and Normal editing modes | 2.0.0 | available | yes |
| /voice | Toggle voice mode | 2.1.59 | available | yes |
| **/web-setup** | Setup Claude Code on the web (requires connecting your Gi... | 2.1.79 | available | **no** |

</details>

<details>
<summary>Changelog</summary>

| Version | Hooks | Commands |
|---------|-------|----------|
| 2.1.79 | — | +web-setup |
| 2.1.78 | +StopFailure | — |
| 2.1.77 | — | +branch |
| 2.1.76 | +PostCompact | +bridge-kick, +effort |
| 2.1.72 | — | +brief |
| 2.1.71 | — | +heapdump, +loop |
| 2.1.69 | +InstructionsLoaded | +claude-api, +reload-plugins |
| 2.1.64 | +InstructionsLoaded | +reload-plugins |
| 2.1.63 | +Elicitation, +ElicitationResult | +batch, +claude-developer-platform, +simplify |
| 2.1.59 | — | +voice |
| 2.1.51 | — | +commit, +commit-push-pr, +init-verifiers, +remote-control |
| 2.1.50 | +WorktreeCreate, +WorktreeRemove | +diff |
| 2.1.48 | +ConfigChange | — |
| 2.1.42 | — | +desktop |
| 2.1.36 | — | +fast |
| 2.1.33 | +TaskCompleted, +TeammateIdle | — |
| 2.1.30 | — | +debug, +insights |
| 2.1.20 | — | +copy, +keybindings-help |
| 2.1.15 | — | +session |
| 2.1.10 | +Setup | — |
| 2.1.8 | — | +fork |
| 2.1.7 | — | +claude-in-chrome, +color |
| 2.1.6 | — | +btw, +keybindings |
| 2.0.73 | — | +skills, +theme |
| 2.0.72 | — | +mobile |
| 2.0.71 | — | +chrome |
| 2.0.70 | — | +discover |
| 2.0.66 | — | +think-back, +thinkback-play |
| 2.0.65 | — | +tag |
| 2.0.63 | — | +stats |
| 2.0.62 | — | +install-slack-app |
| 2.0.56 | +PostToolUseFailure | +plan |
| 2.0.47 | — | +remote-env |
| 2.0.45 | +PermissionRequest | +passes, +tasks |
| 2.0.43 | +SubagentStart | +rate-limit-options |
| 2.0.41 | — | +rename |
| 2.0.36 | — | +extra-usage |
| 2.0.32 | — | +stickers |
| 2.0.12 | — | +plugin |
| 2.0.0 | +Notification, +PostToolUse, +PreCompact, +PreToolUse, +SessionEnd, +SessionStart, +Stop, +SubagentStop, +UserPromptSubmit | +add-dir, +agents, +bashes, +clear, +compact, +config, +context, +cost, +doctor, +exit, +export, +feedback, +files, +help, +hooks, +ide, +init, +install, +install-github-app, +login, +logout, +mcp, +memory, +migrate-installer, +model, +output-style, +permissions, +pr-comments, +privacy-settings, +release-notes, +resume, +review, +rewind, +security-review, +status, +statusline, +terminal-setup, +todos, +upgrade, +usage, +vim |

</details>

---
*Last updated: 2026-03-18*
