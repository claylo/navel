# navel reports

Auto-generated tracking data for Claude Code versions, hooks, commands, and environment variables.

<details>
<summary>Hooks (27)</summary>

| Hook | Since | Documented |
|------|-------|------------|
| ConfigChange | 2.1.48 | yes |
| CwdChanged | 2.1.83 | yes |
| Elicitation | 2.1.63 | yes |
| ElicitationResult | 2.1.63 | yes |
| FileChanged | 2.1.83 | yes |
| InstructionsLoaded | 2.1.64 | yes |
| Notification | 2.0.0 | yes |
| PermissionDenied | 2.1.89 | yes |
| PermissionRequest | 2.0.45 | yes |
| PostCompact | 2.1.76 | yes |
| PostToolUse | 2.0.0 | yes |
| PostToolUseFailure | 2.0.56 | yes |
| PreCompact | 2.0.0 | yes |
| PreToolUse | 2.0.0 | yes |
| SessionEnd | 2.0.0 | yes |
| SessionStart | 2.0.0 | yes |
| Setup | 2.1.10 | yes |
| Stop | 2.0.0 | yes |
| StopFailure | 2.1.78 | yes |
| SubagentStart | 2.0.43 | yes |
| SubagentStop | 2.0.0 | yes |
| TaskCompleted | 2.1.33 | yes |
| TaskCreated | 2.1.84 | yes |
| TeammateIdle | 2.1.33 | yes |
| UserPromptSubmit | 2.0.0 | yes |
| WorktreeCreate | 2.1.50 | yes |
| WorktreeRemove | 2.1.50 | yes |

</details>

<details>
<summary>Commands (94)</summary>

| Command | Description | Since | Status | Documented |
|---------|-------------|-------|--------|------------|
| /add-dir | Add a new working directory | 2.0.0 | available | yes |
| **/advisor** | Configure the Advisor Tool to consult a stronger model fo... | 2.1.83 | available | **no** |
| /agents | Manage agent configurations | 2.0.0 | available | yes |
| **/autocompact** | Configure the auto-compact window size | 2.1.89 | available | **no** |
| /autofix-pr | Spawn a remote Claude Code session that monitors and auto... | 2.1.94 | available | yes |
| /batch | Research and plan a large-scale change, then execute it i... | 2.1.63 | available | yes |
| /branch | — | 2.1.77 | available | yes |
| **/bridge-kick** | Inject bridge failure states for manual recovery testing | 2.1.76 | *disabled* | **no** |
| **/brief** | Toggle brief-only mode | 2.1.72 | available | **no** |
| /btw | Ask a quick side question without interrupting the main c... | 2.1.6 | available | yes |
| /chrome | Claude in Chrome (Beta) settings | 2.0.71 | available | yes |
| /claude-api | Build Claude API / Anthropic SDK apps.\nTRIGGER when: cod... | 2.1.69 | available | yes |
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
| **/dream** | — | 2.1.97 | available | **no** |
| /effort | Set effort level for model usage | 2.1.76 | available | yes |
| /exit | — | 2.0.0 | available | yes |
| /export | Export the current conversation to a file or clipboard | 2.0.0 | available | yes |
| /extra-usage | Configure extra usage to keep working when limits are hit | 2.0.36 | available | yes |
| /fast | — | 2.1.36 | available | yes |
| /feedback | Submit feedback about Claude Code | 2.0.0 | available | yes |
| **/files** | List all files currently in context | 2.0.0 | *disabled* | yes |
| /heapdump | Dump the JS heap to ~/Desktop | 2.1.71 | available | yes |
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
| /loop | — | 2.1.71 | available | yes |
| /mcp | Manage MCP servers | 2.0.0 | available | yes |
| /memory | Edit Claude memory files | 2.0.0 | available | yes |
| /mobile | — | 2.0.72 | available | yes |
| /model | — | 2.0.0 | available | yes |
| /passes | — | 2.0.45 | available | yes |
| /permissions | — | 2.0.0 | available | yes |
| /plan | Enable plan mode or view the current session plan | 2.0.56 | available | yes |
| /plugin | — | 2.0.12 | available | yes |
| /powerup | Discover Claude Code features through quick interactive l... | 2.1.90 | available | yes |
| /privacy-settings | View and update your privacy settings | 2.0.0 | available | yes |
| **/rate-limit-options** | Show options when rate limit is reached | 2.0.43 | available | **no** |
| /release-notes | — | 2.0.0 | available | yes |
| /reload-plugins | Activate pending plugin changes in the current session | 2.1.64 | available | yes |
| /remote-control | — | 2.1.51 | available | yes |
| /remote-env | Configure the default remote environment for teleport ses... | 2.0.47 | available | yes |
| /rename | Rename the current conversation | 2.0.41 | available | yes |
| /resume | Resume a previous conversation | 2.0.0 | available | yes |
| /review | Review a pull request | 2.0.0 | available | yes |
| /rewind | — | 2.0.0 | available | yes |
| /schedule | Create, update, list, or run scheduled remote agents (tri... | 2.1.80 | available | yes |
| /security-review | Complete a security review of the pending changes on the ... | 2.0.0 | available | yes |
| /session | — | 2.1.15 | available | yes |
| /setup-bedrock | Reconfigure AWS Bedrock authentication, region, or model ... | 2.1.92 | available | yes |
| /simplify | Review changed code for reuse, quality, and efficiency, t... | 2.1.63 | available | yes |
| /skills | List available skills | 2.0.73 | available | yes |
| /stats | Show your Claude Code usage statistics and activity | 2.0.63 | available | yes |
| /status | Show Claude Code status including version, model, account... | 2.0.0 | available | yes |
| /statusline | — | 2.0.0 | available | yes |
| /stickers | Order Claude Code stickers | 2.0.32 | available | yes |
| **/stop-hook** | Set a session-only Stop hook with a quick prompt | 2.1.92 | *disabled* | **no** |
| /tasks | — | 2.0.45 | available | yes |
| **/team-onboarding** | Help teammates ramp on Claude Code with a guide from your... | 2.1.94 | available | **no** |
| /teleport | Resume a Claude Code session from claude.ai | 2.1.92 | available | yes |
| /terminal-setup | — | 2.0.0 | available | yes |
| /theme | Change the theme | 2.0.73 | available | yes |
| **/think-back** | Your 2025 Claude Code Year in Review | 2.0.66 | available | **no** |
| **/thinkback-play** | Play the thinkback animation | 2.0.66 | available | **no** |
| **/toggle-memory** | Toggle automemory off/on for this session | 2.1.90 | *disabled* | **no** |
| /ultraplan | — | 2.1.83 | available | yes |
| **/ultrareview** | — | 2.1.83 | available | **no** |
| /upgrade | Upgrade to Max for higher rate limits and more Opus | 2.0.0 | available | yes |
| /usage | Show plan usage limits | 2.0.0 | available | yes |
| **/version** | Print the version this session is running (not what autou... | 2.1.83 | *disabled* | yes |
| /voice | Toggle voice mode | 2.1.59 | available | yes |
| /web-setup | Setup Claude Code on the web (requires connecting your Gi... | 2.1.79 | available | yes |

</details>

<details>
<summary>Environment Variables (448 tracked, 146 documented)</summary>

| Variable | Since | Documented |
|----------|-------|------------|
| **__CFB** | 0.2.33 | **no** |
| **ALACRITTY_LOG** | 0.2.33 | **no** |
| **ANALYTICS_LOG_TOOL_DETAILS** | 2.1.31 | **no** |
| ANTHROPIC_API_KEY | 0.2.54 | yes |
| ANTHROPIC_AUTH_TOKEN | 0.2.33 | yes |
| ANTHROPIC_BASE_URL | 0.2.56 | yes |
| ANTHROPIC_BEDROCK_BASE_URL | 2.0.71 | yes |
| ANTHROPIC_BETAS | 0.2.104 | yes |
| ANTHROPIC_CUSTOM_HEADERS | 0.2.40 | yes |
| ANTHROPIC_CUSTOM_MODEL_OPTION | 2.1.78 | yes |
| ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION | 2.1.78 | yes |
| ANTHROPIC_CUSTOM_MODEL_OPTION_NAME | 2.1.78 | yes |
| ANTHROPIC_DEFAULT_HAIKU_MODEL | 1.0.114 | yes |
| ANTHROPIC_DEFAULT_OPUS_MODEL | 1.0.87 | yes |
| ANTHROPIC_DEFAULT_SONNET_MODEL | 1.0.87 | yes |
| ANTHROPIC_FOUNDRY_API_KEY | 2.0.45 | yes |
| ANTHROPIC_FOUNDRY_BASE_URL | 2.0.45 | yes |
| ANTHROPIC_FOUNDRY_RESOURCE | 2.0.45 | yes |
| ANTHROPIC_MODEL | 0.2.33 | yes |
| ANTHROPIC_SMALL_FAST_MODEL | 0.2.46 | yes |
| ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION | 1.0.42 | yes |
| **ANTHROPIC_UNIX_SOCKET** | 2.1.73 | **no** |
| ANTHROPIC_VERTEX_PROJECT_ID | 0.2.106 | yes |
| **API_TIMEOUT_MS** | 0.2.33 | **no** |
| **APP_URL** | 2.0.15 | **no** |
| APPDATA | 0.2.33 | yes |
| **AUDIO_CAPTURE_NODE_PATH** | 2.1.59 | **no** |
| AWS_ACCESS_KEY_ID | 0.2.33 | yes |
| AWS_BEARER_TOKEN_BEDROCK | 1.0.49 | yes |
| **AWS_DEFAULT_REGION** | 0.2.33 | **no** |
| **AWS_EXECUTION_ENV** | 0.2.33 | **no** |
| **AWS_LAMBDA_BENCHMARK_MODE** | 2.0.63 | **no** |
| **AWS_LAMBDA_FUNCTION_NAME** | 2.0.15 | **no** |
| **AWS_LOGIN_CACHE_DIRECTORY** | 2.0.63 | **no** |
| AWS_PROFILE | 0.2.89 | yes |
| AWS_REGION | 0.2.33 | yes |
| AWS_SECRET_ACCESS_KEY | 0.2.33 | yes |
| AWS_SESSION_TOKEN | 0.2.33 | yes |
| **AZURE_ADDITIONALLY_ALLOWED_TENANTS** | 2.0.45 | **no** |
| **AZURE_AUTHORITY_HOST** | 2.0.45 | **no** |
| **AZURE_CLIENT_CERTIFICATE_PASSWORD** | 2.0.45 | **no** |
| **AZURE_CLIENT_CERTIFICATE_PATH** | 2.0.45 | **no** |
| **AZURE_CLIENT_ID** | 2.0.45 | **no** |
| **AZURE_CLIENT_SECRET** | 2.0.45 | **no** |
| **AZURE_CLIENT_SEND_CERTIFICATE_CHAIN** | 2.0.45 | **no** |
| **AZURE_FEDERATED_TOKEN_FILE** | 2.0.45 | **no** |
| **AZURE_FUNCTIONS_ENVIRONMENT** | 2.0.15 | **no** |
| **AZURE_IDENTITY_DISABLE_MULTITENANTAUTH** | 2.0.45 | **no** |
| **AZURE_PASSWORD** | 2.0.45 | **no** |
| **AZURE_POD_IDENTITY_AUTHORITY_HOST** | 2.0.45 | **no** |
| **AZURE_REGIONAL_AUTHORITY_NAME** | 2.0.45 | **no** |
| **AZURE_TENANT_ID** | 2.0.45 | **no** |
| **AZURE_TOKEN_CREDENTIALS** | 2.0.45 | **no** |
| **AZURE_USERNAME** | 2.0.45 | **no** |
| BASH_MAX_OUTPUT_LENGTH | 0.2.109 | yes |
| BEDROCK_BASE_URL | 1.0.4 | yes |
| **BETA_TRACING_ENDPOINT** | 2.0.70 | **no** |
| BROWSER | 1.0.19 | yes |
| **BUILDKITE** | 2.0.28 | **no** |
| C | 0.2.33 | yes |
| **CCR_ENABLE_BUNDLE** | 2.1.80 | **no** |
| **CCR_FORCE_BUNDLE** | 2.1.80 | **no** |
| **CF_PAGES** | 2.0.28 | **no** |
| **CHOKIDAR_INTERVAL** | 1.0.49 | **no** |
| **CHOKIDAR_USEPOLLING** | 1.0.49 | **no** |
| **CIRCLECI** | 2.0.28 | **no** |
| **CLAUBBIT** | 0.2.79 | **no** |
| **CLAUDE_AFTER_LAST_COMPACT** | 2.1.40 | **no** |
| **CLAUDE_AGENT_SDK_CLIENT_APP** | 2.1.39 | **no** |
| **CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS** | 2.1.27 | **no** |
| **CLAUDE_AGENT_SDK_MCP_NO_PREFIX** | 2.1.10 | **no** |
| **CLAUDE_AGENT_SDK_VERSION** | 1.0.128 | **no** |
| **CLAUDE_AUTO_BACKGROUND_TASKS** | 2.1.47 | **no** |
| CLAUDE_AUTOCOMPACT_PCT_OVERRIDE | 2.0.20 | yes |
| CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR | 1.0.18 | yes |
| **CLAUDE_BRIDGE_USE_CCR_V2** | 2.1.70 | **no** |
| **CLAUDE_CHROME_PERMISSION_MODE** | 2.1.26 | **no** |
| **CLAUDE_CODE_ACCESSIBILITY** | 2.0.77 | **no** |
| **CLAUDE_CODE_ACCOUNT_TAGGED_ID** | 2.1.76 | **no** |
| CLAUDE_CODE_ACCOUNT_UUID | 2.1.51 | yes |
| **CLAUDE_CODE_ACTION** | 0.2.114 | **no** |
| CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD | 2.1.20 | yes |
| **CLAUDE_CODE_ADDITIONAL_PROTECTION** | 2.0.23 | **no** |
| **CLAUDE_CODE_ALWAYS_ENABLE_EFFORT** | 2.1.70 | **no** |
| **CLAUDE_CODE_API_BASE_URL** | 2.1.8 | **no** |
| **CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR** | 1.0.109 | **no** |
| CLAUDE_CODE_API_KEY_HELPER_TTL_MS | 0.2.116 | yes |
| **CLAUDE_CODE_ATTRIBUTION_HEADER** | 2.1.15 | **no** |
| CLAUDE_CODE_AUTO_COMPACT_WINDOW | 2.1.75 | yes |
| CLAUDE_CODE_AUTO_CONNECT_IDE | 1.0.35 | yes |
| **CLAUDE_CODE_BASE_REF** | 2.1.16 | **no** |
| **CLAUDE_CODE_BASH_SANDBOX_SHOW_INDICATOR** | 2.0.14 | **no** |
| **CLAUDE_CODE_BLOCKING_LIMIT_OVERRIDE** | 2.0.77 | **no** |
| **CLAUDE_CODE_BRIEF** | 2.1.72 | **no** |
| **CLAUDE_CODE_BRIEF_UPLOAD** | 2.1.72 | **no** |
| **CLAUDE_CODE_BUBBLEWRAP** | 2.0.52 | **no** |
| CLAUDE_CODE_CLIENT_CERT | 1.0.36 | yes |
| CLAUDE_CODE_CLIENT_KEY | 1.0.36 | yes |
| CLAUDE_CODE_CLIENT_KEY_PASSPHRASE | 1.0.36 | yes |
| **CLAUDE_CODE_CONTAINER_ID** | 1.0.120 | **no** |
| **CLAUDE_CODE_CUSTOM_OAUTH_URL** | 2.1.32 | **no** |
| **CLAUDE_CODE_DATADOG_FLUSH_INTERVAL_MS** | 2.1.21 | **no** |
| **CLAUDE_CODE_DEBUG_LOG_LEVEL** | 2.1.71 | **no** |
| **CLAUDE_CODE_DEBUG_LOGS_DIR** | 1.0.122 | **no** |
| **CLAUDE_CODE_DIAGNOSTICS_FILE** | 2.0.56 | **no** |
| CLAUDE_CODE_DISABLE_1M_CONTEXT | 2.1.50 | yes |
| CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING | 2.1.41 | yes |
| **CLAUDE_CODE_DISABLE_ATTACHMENTS** | 1.0.128 | **no** |
| CLAUDE_CODE_DISABLE_AUTO_MEMORY | 2.1.31 | yes |
| CLAUDE_CODE_DISABLE_BACKGROUND_TASKS | 2.1.4 | yes |
| **CLAUDE_CODE_DISABLE_CLAUDE_MDS** | 1.0.111 | **no** |
| **CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK** | 1.0.53 | **no** |
| CLAUDE_CODE_DISABLE_CRON | 2.1.72 | yes |
| CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS | 2.0.45 | yes |
| CLAUDE_CODE_DISABLE_FAST_MODE | 2.1.39 | yes |
| CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY | 2.0.22 | yes |
| **CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING** | 1.0.128 | **no** |
| CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS | 2.1.64 | yes |
| **CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP** | 2.1.68 | **no** |
| CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC | 0.2.116 | yes |
| **CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL** | 2.1.14 | **no** |
| **CLAUDE_CODE_DISABLE_PRECOMPACT_SKIP** | 2.1.69 | **no** |
| CLAUDE_CODE_DISABLE_TERMINAL_TITLE | 1.0.52 | yes |
| **CLAUDE_CODE_DISABLE_THINKING** | 2.1.41 | **no** |
| **CLAUDE_CODE_DISABLE_VIRTUAL_SCROLL** | 2.1.72 | **no** |
| **CLAUDE_CODE_DONT_INHERIT_ENV** | 0.2.119 | **no** |
| **CLAUDE_CODE_EAGER_FLUSH** | 2.1.32 | **no** |
| CLAUDE_CODE_EFFORT_LEVEL | 2.0.46 | yes |
| **CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES** | 2.1.19 | **no** |
| **CLAUDE_CODE_ENABLE_CFC** | 2.0.71 | **no** |
| **CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING** | 2.1.40 | **no** |
| CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION | 2.0.66 | yes |
| **CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING** | 2.0.43 | **no** |
| CLAUDE_CODE_ENABLE_TASKS | 2.1.19 | yes |
| CLAUDE_CODE_ENABLE_TELEMETRY | 0.2.76 | yes |
| **CLAUDE_CODE_ENABLE_TOKEN_USAGE_ATTACHMENT** | 2.0.0 | **no** |
| **CLAUDE_CODE_ENHANCED_TELEMETRY_BETA** | 2.1.7 | **no** |
| **CLAUDE_CODE_ENTRYPOINT** | 0.2.89 | **no** |
| **CLAUDE_CODE_ENVIRONMENT_KIND** | 2.1.32 | **no** |
| **CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION** | 2.1.6 | **no** |
| **CLAUDE_CODE_EXIT_AFTER_FIRST_RENDER** | 2.1.27 | **no** |
| CLAUDE_CODE_EXIT_AFTER_STOP_DELAY | 2.0.35 | yes |
| CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS | 2.1.32 | yes |
| **CLAUDE_CODE_EXTRA_BODY** | 0.2.45 | **no** |
| **CLAUDE_CODE_EXTRA_METADATA** | 2.1.78 | **no** |
| CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS | 2.0.77 | yes |
| **CLAUDE_CODE_FORCE_FULL_LOGO** | 2.0.11 | **no** |
| **CLAUDE_CODE_FORCE_GLOBAL_CACHE** | 2.1.23 | **no** |
| **CLAUDE_CODE_FRAME_TIMING_LOG** | 2.1.74 | **no** |
| CLAUDE_CODE_GIT_BASH_PATH | 1.0.49 | yes |
| **CLAUDE_CODE_GLOB_HIDDEN** | 2.1.14 | **no** |
| **CLAUDE_CODE_GLOB_NO_IGNORE** | 2.1.14 | **no** |
| **CLAUDE_CODE_GLOB_TIMEOUT_SECONDS** | 2.1.14 | **no** |
| **CLAUDE_CODE_HOST_PLATFORM** | 2.1.40 | **no** |
| **CLAUDE_CODE_IDE_HOST_OVERRIDE** | 1.0.4 | **no** |
| CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL | 1.0.4 | yes |
| **CLAUDE_CODE_IDE_SKIP_VALID_CHECK** | 1.0.4 | **no** |
| **CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES** | 2.1.32 | **no** |
| **CLAUDE_CODE_IS_COWORK** | 2.1.32 | **no** |
| CLAUDE_CODE_MAX_OUTPUT_TOKENS | 1.0.10 | yes |
| **CLAUDE_CODE_MAX_RETRIES** | 1.0.44 | **no** |
| **CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY** | 2.0.32 | **no** |
| **CLAUDE_CODE_MCP_INSTR_DELTA** | 2.1.70 | **no** |
| CLAUDE_CODE_NEW_INIT | 2.1.77 | yes |
| **CLAUDE_CODE_OAUTH_CLIENT_ID** | 2.1.2 | **no** |
| **CLAUDE_CODE_OAUTH_REFRESH_TOKEN** | 2.1.59 | **no** |
| **CLAUDE_CODE_OAUTH_SCOPES** | 2.1.59 | **no** |
| **CLAUDE_CODE_OAUTH_TOKEN** | 1.0.44 | **no** |
| **CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR** | 1.0.109 | **no** |
| CLAUDE_CODE_ORGANIZATION_UUID | 2.1.47 | yes |
| **CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS** | 2.0.10 | **no** |
| CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS | 2.0.73 | yes |
| **CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS** | 0.2.126 | **no** |
| **CLAUDE_CODE_PERFETTO_TRACE** | 2.1.10 | **no** |
| **CLAUDE_CODE_PLAN_MODE_INTERVIEW_PHASE** | 2.1.16 | **no** |
| CLAUDE_CODE_PLAN_MODE_REQUIRED | 2.0.70 | yes |
| **CLAUDE_CODE_PLAN_V2_AGENT_COUNT** | 2.0.41 | **no** |
| **CLAUDE_CODE_PLAN_V2_EXPLORE_AGENT_COUNT** | 2.0.45 | **no** |
| CLAUDE_CODE_PLUGIN_CACHE_DIR | 2.1.42 | yes |
| CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS | 2.1.51 | yes |
| CLAUDE_CODE_PLUGIN_SEED_DIR | 2.1.63 | yes |
| **CLAUDE_CODE_PLUGIN_USE_ZIP_CACHE** | 2.1.59 | **no** |
| **CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2** | 2.1.27 | **no** |
| **CLAUDE_CODE_PROFILE_STARTUP** | 2.0.31 | **no** |
| CLAUDE_CODE_PROXY_RESOLVES_HOSTS | 2.0.55 | yes |
| **CLAUDE_CODE_QUESTION_PREVIEW_FORMAT** | 2.1.69 | **no** |
| CLAUDE_CODE_REMOTE | 2.0.20 | yes |
| **CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE** | 2.0.20 | **no** |
| **CLAUDE_CODE_REMOTE_MEMORY_DIR** | 2.1.38 | **no** |
| **CLAUDE_CODE_REMOTE_SEND_KEEPALIVES** | 2.1.50 | **no** |
| **CLAUDE_CODE_REMOTE_SESSION_ID** | 2.0.52 | **no** |
| **CLAUDE_CODE_RESUME_INTERRUPTED_TURN** | 2.1.42 | **no** |
| **CLAUDE_CODE_SAVE_HOOK_ADDITIONAL_CONTEXT** | 2.1.40 | **no** |
| **CLAUDE_CODE_SEARCH_HINTS_IN_LIST** | 2.1.64 | **no** |
| **CLAUDE_CODE_SESSION_ACCESS_TOKEN** | 1.0.77 | **no** |
| CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS | 2.1.74 | yes |
| CLAUDE_CODE_SHELL | 2.0.65 | yes |
| CLAUDE_CODE_SHELL_PREFIX | 1.0.60 | yes |
| CLAUDE_CODE_SIMPLE | 2.1.48 | yes |
| CLAUDE_CODE_SKIP_BEDROCK_AUTH | 0.2.125 | yes |
| CLAUDE_CODE_SKIP_FAST_MODE_NETWORK_ERRORS | 2.1.76 | yes |
| CLAUDE_CODE_SKIP_FOUNDRY_AUTH | 2.0.45 | yes |
| **CLAUDE_CODE_SKIP_PROMPT_HISTORY** | 2.0.70 | **no** |
| CLAUDE_CODE_SKIP_VERTEX_AUTH | 0.2.104 | yes |
| **CLAUDE_CODE_SLOW_OPERATION_THRESHOLD_MS** | 2.1.38 | **no** |
| **CLAUDE_CODE_SSE_PORT** | 0.2.106 | **no** |
| **CLAUDE_CODE_STALL_TIMEOUT_MS_FOR_TESTING** | 2.1.69 | **no** |
| CLAUDE_CODE_SUBAGENT_MODEL | 1.0.57 | yes |
| **CLAUDE_CODE_SUBPROCESS_ENV_SCRUB** | 2.1.79 | **no** |
| **CLAUDE_CODE_SYNC_PLUGIN_INSTALL** | 2.1.40 | **no** |
| **CLAUDE_CODE_SYNC_PLUGIN_INSTALL_TIMEOUT_MS** | 2.1.41 | **no** |
| **CLAUDE_CODE_SYNTAX_HIGHLIGHT** | 2.0.31 | **no** |
| **CLAUDE_CODE_TAGS** | 2.0.28 | **no** |
| CLAUDE_CODE_TASK_LIST_ID | 2.1.2 | yes |
| **CLAUDE_CODE_TEST_FIXTURES_ROOT** | 1.0.109 | **no** |
| CLAUDE_CODE_TMPDIR | 2.1.5 | yes |
| **CLAUDE_CODE_TMUX_PREFIX** | 2.1.8 | **no** |
| **CLAUDE_CODE_TMUX_PREFIX_CONFLICTS** | 2.1.8 | **no** |
| **CLAUDE_CODE_TMUX_SESSION** | 2.1.8 | **no** |
| CLAUDE_CODE_USE_BEDROCK | 0.2.33 | yes |
| **CLAUDE_CODE_USE_CCR_V2** | 2.1.47 | **no** |
| **CLAUDE_CODE_USE_COWORK_PLUGINS** | 2.1.15 | **no** |
| CLAUDE_CODE_USE_FOUNDRY | 2.0.45 | yes |
| **CLAUDE_CODE_USE_NATIVE_FILE_SEARCH** | 2.0.28 | **no** |
| CLAUDE_CODE_USE_VERTEX | 0.2.33 | yes |
| CLAUDE_CODE_USER_EMAIL | 2.1.51 | yes |
| **CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR** | 1.0.78 | **no** |
| **CLAUDE_CODE_WORKER_EPOCH** | 2.1.51 | **no** |
| **CLAUDE_CODE_WORKSPACE_HOST_PATHS** | 2.1.76 | **no** |
| CLAUDE_CONFIG_DIR | 0.2.33 | yes |
| **CLAUDE_COWORK_MEMORY_EXTRA_GUIDELINES** | 2.1.77 | **no** |
| **CLAUDE_COWORK_MEMORY_PATH_OVERRIDE** | 2.1.64 | **no** |
| **CLAUDE_DEBUG** | 1.0.91 | **no** |
| **CLAUDE_ENABLE_STREAM_WATCHDOG** | 2.1.40 | **no** |
| CLAUDE_ENV_FILE | 2.0.52 | yes |
| **CLAUDE_FORCE_DISPLAY_SURVEY** | 1.0.64 | **no** |
| **CLAUDE_REPL_MODE** | 2.1.14 | **no** |
| **CLAUDE_TMPDIR** | 2.1.15 | **no** |
| **CLI_WIDTH** | 2.1.69 | **no** |
| CLOUD_ML_REGION | 0.2.33 | yes |
| **CLOUD_RUN_JOB** | 0.2.33 | **no** |
| **CODESPACES** | 2.0.28 | **no** |
| **COLORTERM** | 2.0.66 | **no** |
| **COREPACK_ENABLE_AUTO_PIN** | 0.2.74 | **no** |
| **CURSOR_TRACE_ID** | 0.2.33 | **no** |
| DEBUG | 0.2.33 | yes |
| **DEBUG_AUTH** | 0.2.33 | **no** |
| **DEBUG_SDK** | 1.0.122 | **no** |
| **DEMO_VERSION** | 2.0.70 | **no** |
| **DENO_DEPLOYMENT_ID** | 2.0.28 | **no** |
| **DETECT_GCP_RETRIES** | 0.2.33 | **no** |
| **DISABLE_AUTO_COMPACT** | 2.0.77 | **no** |
| **DISABLE_AUTO_MIGRATE_TO_NATIVE** | 1.0.108 | **no** |
| DISABLE_AUTOUPDATER | 0.2.39 | yes |
| DISABLE_BUG_COMMAND | 0.2.39 | yes |
| **DISABLE_CLAUDE_CODE_SM_COMPACT** | 2.1.14 | **no** |
| **DISABLE_COMPACT** | 2.0.30 | **no** |
| DISABLE_COST_WARNINGS | 0.2.39 | yes |
| **DISABLE_DOCTOR_COMMAND** | 1.0.58 | **no** |
| DISABLE_ERROR_REPORTING | 0.2.39 | yes |
| **DISABLE_EXTRA_USAGE_COMMAND** | 2.0.36 | **no** |
| DISABLE_FEEDBACK_COMMAND | 1.0.102 | yes |
| **DISABLE_INSTALL_GITHUB_APP_COMMAND** | 1.0.58 | **no** |
| DISABLE_INSTALLATION_CHECKS | 1.0.114 | yes |
| DISABLE_INTERLEAVED_THINKING | 1.0.1 | yes |
| **DISABLE_LOGIN_COMMAND** | 1.0.58 | **no** |
| **DISABLE_LOGOUT_COMMAND** | 1.0.58 | **no** |
| DISABLE_PROMPT_CACHING | 0.2.33 | yes |
| DISABLE_PROMPT_CACHING_HAIKU | 1.0.113 | yes |
| DISABLE_PROMPT_CACHING_OPUS | 1.0.113 | yes |
| DISABLE_PROMPT_CACHING_SONNET | 1.0.113 | yes |
| DISABLE_TELEMETRY | 0.2.39 | yes |
| **DISABLE_UPGRADE_COMMAND** | 1.0.58 | **no** |
| **DYNO** | 0.2.33 | **no** |
| **EDITOR** | 0.2.54 | **no** |
| **EMBEDDED_SEARCH_TOOLS** | 2.1.71 | **no** |
| **ENABLE_BETA_TRACING_DETAILED** | 2.0.70 | **no** |
| **ENABLE_CLAUDE_CODE_SM_COMPACT** | 2.1.14 | **no** |
| ENABLE_CLAUDEAI_MCP_SERVERS | 2.1.14 | yes |
| **ENABLE_ENHANCED_TELEMETRY_BETA** | 2.0.18 | **no** |
| **ENABLE_MCP_LARGE_OUTPUT_FILES** | 2.0.71 | **no** |
| **ENABLE_PROMPT_CACHING_1H_BEDROCK** | 2.1.42 | **no** |
| ENABLE_TOOL_SEARCH | 2.0.70 | yes |
| **FALLBACK_FOR_ALL_PRIMARY_MODELS** | 2.0.35 | **no** |
| **FLY_APP_NAME** | 2.0.15 | **no** |
| **FLY_MACHINE_ID** | 2.0.15 | **no** |
| FORCE_AUTOUPDATE_PLUGINS | 2.1.2 | yes |
| **FORCE_CODE_TERMINAL** | 0.2.65 | **no** |
| **FUNCTION_NAME** | 0.2.33 | **no** |
| **FUNCTION_TARGET** | 0.2.33 | **no** |
| **GAE_MODULE_NAME** | 0.2.33 | **no** |
| **GAE_SERVICE** | 0.2.33 | **no** |
| **GCE_METADATA_HOST** | 0.2.33 | **no** |
| **GCE_METADATA_IP** | 0.2.33 | **no** |
| GCLOUD_PROJECT | 0.2.33 | yes |
| **GITHUB_ACTION_INPUTS** | 1.0.85 | **no** |
| **GITHUB_ACTION_PATH** | 1.0.87 | **no** |
| **GITHUB_ACTIONS** | 0.2.65 | **no** |
| **GITHUB_ACTOR** | 0.2.109 | **no** |
| **GITHUB_ACTOR_ID** | 0.2.109 | **no** |
| **GITHUB_EVENT_NAME** | 0.2.109 | **no** |
| **GITHUB_REPOSITORY** | 1.0.87 | **no** |
| **GITHUB_REPOSITORY_ID** | 1.0.58 | **no** |
| **GITHUB_REPOSITORY_OWNER** | 0.2.109 | **no** |
| **GITHUB_REPOSITORY_OWNER_ID** | 0.2.109 | **no** |
| **GITLAB_CI** | 2.0.15 | **no** |
| **GITPOD_WORKSPACE_ID** | 2.0.28 | **no** |
| **GNOME_TERMINAL_SERVICE** | 0.2.33 | **no** |
| GOOGLE_APPLICATION_CREDENTIALS | 0.2.33 | yes |
| GOOGLE_CLOUD_PROJECT | 0.2.33 | yes |
| **GOOGLE_CLOUD_QUOTA_PROJECT** | 0.2.33 | **no** |
| **GRACEFUL_FS_PLATFORM** | 0.2.104 | **no** |
| **GRPC_DEFAULT_SSL_ROOTS_FILE_PATH** | 0.2.76 | **no** |
| **GRPC_EXPERIMENTAL_ENABLE_OUTLIER_DETECTION** | 0.2.76 | **no** |
| **GRPC_NODE_TRACE** | 0.2.76 | **no** |
| **GRPC_NODE_USE_ALTERNATIVE_RESOLVER** | 0.2.76 | **no** |
| **GRPC_NODE_VERBOSITY** | 0.2.76 | **no** |
| **GRPC_SSL_CIPHER_SUITES** | 0.2.76 | **no** |
| **GRPC_TRACE** | 0.2.76 | **no** |
| **GRPC_VERBOSITY** | 0.2.76 | **no** |
| HOME | 0.2.33 | yes |
| HTTP_PROXY | 0.2.33 | yes |
| HTTPS_PROXY | 0.2.33 | yes |
| IS_DEMO | 0.2.39 | yes |
| **IS_SANDBOX** | 1.0.44 | **no** |
| **ITERM_SESSION_ID** | 2.0.70 | **no** |
| **JEST_WORKER_ID** | 0.2.125 | **no** |
| **K_CONFIGURATION** | 0.2.33 | **no** |
| **K_SERVICE** | 0.2.33 | **no** |
| **KITTY_WINDOW_ID** | 0.2.33 | **no** |
| **KONSOLE_VERSION** | 0.2.33 | **no** |
| **KUBERNETES_SERVICE_HOST** | 2.0.28 | **no** |
| **LC_TERMINAL** | 2.1.26 | **no** |
| **LOCAL_BRIDGE** | 2.1.26 | **no** |
| LOCALAPPDATA | 0.2.90 | yes |
| MAX_MCP_OUTPUT_TOKENS | 1.0.28 | yes |
| **MAX_STRUCTURED_OUTPUT_RETRIES** | 2.0.43 | **no** |
| MAX_THINKING_TOKENS | 0.2.47 | yes |
| MCP_CLIENT_SECRET | 2.1.30 | yes |
| MCP_OAUTH_CALLBACK_PORT | 1.0.54 | yes |
| **MCP_REMOTE_SERVER_CONNECTION_BATCH_SIZE** | 2.0.77 | **no** |
| **MCP_SERVER_CONNECTION_BATCH_SIZE** | 1.0.53 | **no** |
| MCP_TIMEOUT | 0.2.42 | yes |
| MCP_TOOL_TIMEOUT | 0.2.55 | yes |
| **METADATA_SERVER_DETECTION** | 0.2.33 | **no** |
| **MODIFIERS_NODE_PATH** | 2.0.77 | **no** |
| **MSYSTEM** | 0.2.33 | **no** |
| N | 1.0.109 | yes |
| **NETLIFY** | 0.2.33 | **no** |
| NO_PROXY | 0.2.33 | yes |
| **NODE_DEBUG** | 0.2.33 | **no** |
| NODE_EXTRA_CA_CERTS | 1.0.36 | yes |
| **NODE_OPTIONS** | 0.2.51 | **no** |
| **NODE_V8_COVERAGE** | 0.2.125 | **no** |
| **OSTYPE** | 0.2.76 | **no** |
| OTEL_EXPORTER_OTLP_ENDPOINT | 0.2.76 | yes |
| OTEL_EXPORTER_OTLP_HEADERS | 0.2.76 | yes |
| **OTEL_EXPORTER_OTLP_INSECURE** | 0.2.76 | **no** |
| OTEL_EXPORTER_OTLP_LOGS_PROTOCOL | 1.0.7 | yes |
| OTEL_EXPORTER_OTLP_METRICS_PROTOCOL | 0.2.76 | yes |
| OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE | 0.2.79 | yes |
| OTEL_EXPORTER_OTLP_PROTOCOL | 0.2.76 | yes |
| **OTEL_EXPORTER_OTLP_TRACES_PROTOCOL** | 2.0.18 | **no** |
| **OTEL_EXPORTER_PROMETHEUS_HOST** | 0.2.76 | **no** |
| **OTEL_EXPORTER_PROMETHEUS_PORT** | 0.2.76 | **no** |
| **OTEL_LOG_TOOL_CONTENT** | 2.0.18 | **no** |
| OTEL_LOG_TOOL_DETAILS | 2.1.20 | yes |
| OTEL_LOG_USER_PROMPTS | 1.0.7 | yes |
| OTEL_LOGS_EXPORT_INTERVAL | 1.0.7 | yes |
| OTEL_LOGS_EXPORTER | 1.0.7 | yes |
| OTEL_METRIC_EXPORT_INTERVAL | 0.2.76 | yes |
| OTEL_METRICS_EXPORTER | 0.2.76 | yes |
| **OTEL_TRACES_EXPORT_INTERVAL** | 2.0.18 | **no** |
| **OTEL_TRACES_EXPORTER** | 2.0.18 | **no** |
| P | 2.0.45 | yes |
| **P4PORT** | 2.1.59 | **no** |
| PATH | 0.2.33 | yes |
| **PATHEXT** | 0.2.76 | **no** |
| **PKG_CONFIG_PATH** | 0.2.33 | **no** |
| **PROJECT_DOMAIN** | 2.0.28 | **no** |
| **PWD** | 1.0.4 | **no** |
| **RAILWAY_ENVIRONMENT_NAME** | 2.0.15 | **no** |
| **RAILWAY_SERVICE_NAME** | 2.0.15 | **no** |
| **RENDER** | 2.0.15 | **no** |
| **REPL_ID** | 2.0.28 | **no** |
| **REPL_SLUG** | 2.0.28 | **no** |
| **RUNNER_ENVIRONMENT** | 0.2.109 | **no** |
| **RUNNER_OS** | 0.2.109 | **no** |
| S | 2.0.45 | yes |
| **SAFEUSER** | 2.1.51 | **no** |
| **SESSION_INGRESS_URL** | 1.0.98 | **no** |
| **SESSIONNAME** | 0.2.33 | **no** |
| **SHARP_FORCE_GLOBAL_LIBVIPS** | 0.2.33 | **no** |
| **SHARP_IGNORE_GLOBAL_LIBVIPS** | 0.2.33 | **no** |
| SHELL | 0.2.33 | yes |
| SLASH_COMMAND_TOOL_CHAR_BUDGET | 1.0.122 | yes |
| **SPACE_CREATOR_USER_ID** | 2.0.28 | **no** |
| **SRT_DEBUG** | 2.0.49 | **no** |
| **SSH_CLIENT** | 0.2.33 | **no** |
| **SSH_CONNECTION** | 0.2.33 | **no** |
| **SSH_TTY** | 0.2.33 | **no** |
| **STY** | 0.2.33 | **no** |
| **SWE_BENCH_INSTANCE_ID** | 1.0.70 | **no** |
| **SWE_BENCH_RUN_ID** | 1.0.70 | **no** |
| **SWE_BENCH_TASK_ID** | 1.0.70 | **no** |
| **SYSTEM_OIDCREQUESTURI** | 2.1.38 | **no** |
| **SYSTEMROOT** | 0.2.33 | **no** |
| **TASK_MAX_OUTPUT_LENGTH** | 2.0.77 | **no** |
| **TEAM_MEMORY_SYNC_URL** | 2.1.71 | **no** |
| TEMP | 0.2.76 | yes |
| TERM | 0.2.33 | yes |
| **TERM_PROGRAM** | 0.2.33 | **no** |
| **TERM_PROGRAM_VERSION** | 1.0.114 | **no** |
| **TERMINAL_EMULATOR** | 0.2.108 | **no** |
| **TERMINATOR_UUID** | 0.2.33 | **no** |
| **TEST_ENABLE_SESSION_PERSISTENCE** | 1.0.106 | **no** |
| **TEST_GRACEFUL_FS_GLOBAL_PATCH** | 0.2.104 | **no** |
| **TILIX_ID** | 0.2.33 | **no** |
| TMPDIR | 1.0.125 | yes |
| **TMUX** | 0.2.33 | **no** |
| **TMUX_PANE** | 2.1.8 | **no** |
| **UNDICI_NO_FG** | 0.2.125 | **no** |
| **USE_API_CONTEXT_MANAGEMENT** | 1.0.71 | **no** |
| USE_BUILTIN_RIPGREP | 0.2.33 | yes |
| **USE_LOCAL_OAUTH** | 1.0.26 | **no** |
| **USE_STAGING_OAUTH** | 2.1.38 | **no** |
| USER | 1.0.124 | yes |
| **USERNAME** | 2.0.71 | **no** |
| USERPROFILE | 0.2.36 | yes |
| **UV_THREADPOOL_SIZE** | 1.0.93 | **no** |
| V | 1.0.71 | yes |
| **VCR_RECORD** | 2.1.69 | **no** |
| **VERCEL** | 0.2.33 | **no** |
| VERTEX_BASE_URL | 1.0.4 | yes |
| **VISUAL** | 0.2.54 | **no** |
| **VOICE_STREAM_BASE_URL** | 2.1.59 | **no** |
| **VSCODE_GIT_ASKPASS_MAIN** | 0.2.104 | **no** |
| **VTE_VERSION** | 0.2.33 | **no** |
| **WEBSITE_SITE_NAME** | 0.2.33 | **no** |
| **WEBSITE_SKU** | 2.0.15 | **no** |
| **WS_NO_BUFFER_UTIL** | 0.2.33 | **no** |
| **WS_NO_UTF_8_VALIDATE** | 0.2.33 | **no** |
| **WSL_DISTRO_NAME** | 0.2.33 | **no** |
| **WT_SESSION** | 0.2.33 | **no** |
| **XDG_CONFIG_HOME** | 1.0.3 | **no** |
| **XDG_RUNTIME_DIR** | 2.0.30 | **no** |
| **XTERM_VERSION** | 0.2.33 | **no** |
| **ZED_TERM** | 2.1.26 | **no** |

</details>

<details>
<summary>Changelog</summary>

| Version | Hooks | Commands | Env vars |
|---------|-------|----------|----------|
| 2.1.97 | — | +dream | — |
| 2.1.94 | — | +autofix-pr, +team-onboarding | — |
| 2.1.92 | — | +setup-bedrock, +stop-hook, +teleport | — |
| 2.1.91 | — | +ultraplan | — |
| 2.1.90 | — | +powerup, +toggle-memory | — |
| 2.1.89 | +PermissionDenied | +autocompact, +buddy | — |
| 2.1.84 | +TaskCreated | — | — |
| 2.1.83 | +CwdChanged, +FileChanged | +advisor, +ultraplan, +ultrareview, +version | — |
| 2.1.80 | — | +schedule | +2 |
| 2.1.79 | — | +web-setup | +1, -1 |
| 2.1.78 | +StopFailure | — | +4, -1 |
| 2.1.77 | — | +branch | +3 |
| 2.1.76 | +PostCompact | +bridge-kick, +effort | +3, -1 |
| 2.1.75 | — | — | +1, -1 |
| 2.1.74 | — | — | +2, -1 |
| 2.1.73 | — | — | +1 |
| 2.1.72 | — | +brief | +4 |
| 2.1.71 | — | +heapdump, +loop | +4, -2 |
| 2.1.70 | — | — | +3 |
| 2.1.69 | +InstructionsLoaded | +claude-api, +reload-plugins | +9, -3 |
| 2.1.68 | — | — | +1 |
| 2.1.66 | — | — | +1, -4 |
| 2.1.64 | +InstructionsLoaded | +reload-plugins | +4, -1 |
| 2.1.63 | +Elicitation, +ElicitationResult | +batch, +claude-developer-platform, +simplify | +2 |
| 2.1.59 | — | +voice | +6, -1 |
| 2.1.53 | — | — | -1 |
| 2.1.51 | — | +commit, +commit-push-pr, +init-verifiers, +remote-control | +5, -1 |
| 2.1.50 | +WorktreeCreate, +WorktreeRemove | +diff | +3 |
| 2.1.48 | +ConfigChange | — | +1, -5 |
| 2.1.47 | — | — | +3 |
| 2.1.45 | — | — | -11 |
| 2.1.42 | — | +desktop | +4 |
| 2.1.41 | — | — | +3 |
| 2.1.40 | — | — | +7 |
| 2.1.39 | — | — | +2 |
| 2.1.38 | — | — | +7 |
| 2.1.36 | — | +fast | — |
| 2.1.33 | +TaskCompleted, +TeammateIdle | — | -1 |
| 2.1.32 | — | — | +6, -1 |
| 2.1.31 | — | — | +3 |
| 2.1.30 | — | +debug, +insights | +1, -1 |
| 2.1.27 | — | — | +3, -29 |
| 2.1.26 | — | — | +6 |
| 2.1.23 | — | — | +2 |
| 2.1.21 | — | — | +1 |
| 2.1.20 | — | +copy, +keybindings-help | +2 |
| 2.1.19 | — | — | +2, -10 |
| 2.1.16 | — | — | +5 |
| 2.1.15 | — | +session | +3, -2 |
| 2.1.14 | — | — | +9, -8 |
| 2.1.10 | +Setup | — | +2, -1 |
| 2.1.9 | — | — | +1, -1 |
| 2.1.8 | — | +fork | +6 |
| 2.1.7 | — | +claude-in-chrome, +color | +1, -3 |
| 2.1.6 | — | +btw, +keybindings | +8, -3 |
| 2.1.5 | — | — | +1 |
| 2.1.4 | — | — | +1 |
| 2.1.3 | — | — | +1, -4 |
| 2.1.2 | — | — | +5 |
| 2.1.0 | — | — | +1 |
| 2.0.77 | — | — | +8, -1 |
| 2.0.74 | — | — | -7 |
| 2.0.73 | — | +skills, +theme | +3 |
| 2.0.72 | — | +mobile | — |
| 2.0.71 | — | +chrome | +4, -1 |
| 2.0.70 | — | +discover | +9, -2 |
| 2.0.66 | — | +think-back, +thinkback-play | +2 |
| 2.0.65 | — | +tag | +1, -1 |
| 2.0.63 | — | +stats | +3, -2 |
| 2.0.62 | — | +install-slack-app | +1 |
| 2.0.60 | — | — | +5, -1 |
| 2.0.59 | — | — | +1, -3 |
| 2.0.56 | +PostToolUseFailure | +plan | +1 |
| 2.0.55 | — | — | +1, -1 |
| 2.0.54 | — | — | -1 |
| 2.0.52 | — | — | +3 |
| 2.0.50 | — | — | +1, -1 |
| 2.0.49 | — | — | +3 |
| 2.0.47 | — | +remote-env | +2, -1 |
| 2.0.46 | — | — | +1 |
| 2.0.45 | +PermissionRequest | +passes, +tasks | +25, -2 |
| 2.0.43 | +SubagentStart | +rate-limit-options | +3 |
| 2.0.41 | — | +rename | +4 |
| 2.0.36 | — | +extra-usage | +5 |
| 2.0.35 | — | — | +2 |
| 2.0.34 | — | — | +1 |
| 2.0.32 | — | +stickers | +1, -1 |
| 2.0.31 | — | — | +2 |
| 2.0.30 | — | — | +5 |
| 2.0.28 | — | — | +14 |
| 2.0.25 | — | — | +1 |
| 2.0.24 | — | — | +1 |
| 2.0.23 | — | — | +1 |
| 2.0.22 | — | — | +1 |
| 2.0.20 | — | — | +4 |
| 2.0.18 | — | — | +6 |
| 2.0.17 | — | — | +1 |
| 2.0.15 | — | — | +10 |
| 2.0.14 | — | — | +4 |
| 2.0.12 | — | +plugin | -1 |
| 2.0.11 | — | — | +1 |
| 2.0.10 | — | — | +1 |
| 2.0.0 | +Notification, +PostToolUse, +PreCompact, +PreToolUse, +SessionEnd, +SessionStart, +Stop, +SubagentStop, +UserPromptSubmit | +add-dir, +agents, +bashes, +clear, +compact, +config, +context, +cost, +doctor, +exit, +export, +feedback, +files, +help, +hooks, +ide, +init, +install, +install-github-app, +login, +logout, +mcp, +memory, +migrate-installer, +model, +output-style, +permissions, +pr-comments, +privacy-settings, +release-notes, +resume, +review, +rewind, +security-review, +status, +statusline, +terminal-setup, +todos, +upgrade, +usage, +vim | +3 |
| 1.0.128 | — | — | +3 |
| 1.0.127 | — | — | -1 |
| 1.0.125 | — | — | +1 |
| 1.0.124 | — | — | +3, -1 |
| 1.0.122 | — | — | +3, -1 |
| 1.0.120 | — | — | +1 |
| 1.0.114 | — | — | +3 |
| 1.0.113 | — | — | +3 |
| 1.0.111 | — | — | +1, -1 |
| 1.0.109 | — | — | +5 |
| 1.0.108 | — | — | +1 |
| 1.0.107 | — | — | -1 |
| 1.0.106 | — | — | +1, -1 |
| 1.0.102 | — | — | +1 |
| 1.0.98 | — | — | +2 |
| 1.0.93 | — | — | +1 |
| 1.0.91 | — | — | +1 |
| 1.0.87 | — | — | +4, -2 |
| 1.0.85 | — | — | +3 |
| 1.0.81 | — | — | +2 |
| 1.0.78 | — | — | +1 |
| 1.0.77 | — | — | +1 |
| 1.0.72 | — | — | -1 |
| 1.0.71 | — | — | +2 |
| 1.0.70 | — | — | +3, -1 |
| 1.0.69 | — | — | +1 |
| 1.0.68 | — | — | +2, -2 |
| 1.0.66 | — | — | -1 |
| 1.0.64 | — | — | +1 |
| 1.0.60 | — | — | +2, -1 |
| 1.0.59 | — | — | +2, -2 |
| 1.0.58 | — | — | +9 |
| 1.0.57 | — | — | +1 |
| 1.0.54 | — | — | +3 |
| 1.0.53 | — | — | +2 |
| 1.0.52 | — | — | +1 |
| 1.0.51 | — | — | -2 |
| 1.0.49 | — | — | +5 |
| 1.0.46 | — | — | -2 |
| 1.0.45 | — | — | -1 |
| 1.0.44 | — | — | +3 |
| 1.0.42 | — | — | +1, -2 |
| 1.0.37 | — | — | +1, -1 |
| 1.0.36 | — | — | +5 |
| 1.0.35 | — | — | +1 |
| 1.0.28 | — | — | +1 |
| 1.0.27 | — | — | +1 |
| 1.0.26 | — | — | +1, -1 |
| 1.0.23 | — | — | -1 |
| 1.0.22 | — | — | +3 |
| 1.0.19 | — | — | +1 |
| 1.0.18 | — | — | +1 |
| 1.0.17 | — | — | +1 |
| 1.0.14 | — | — | +1, -1 |
| 1.0.10 | — | — | +2 |
| 1.0.7 | — | — | +5 |
| 1.0.4 | — | — | +7 |
| 1.0.3 | — | — | +1 |
| 1.0.1 | — | — | +1 |
| 1.0.0 | — | — | +2, -2 |
| 0.2.126 | — | — | +1 |
| 0.2.125 | — | — | +4 |
| 0.2.119 | — | — | +1 |
| 0.2.117 | — | — | +2 |
| 0.2.116 | — | — | +2 |
| 0.2.114 | — | — | +1 |
| 0.2.113 | — | — | -1 |
| 0.2.109 | — | — | +9 |
| 0.2.108 | — | — | +4 |
| 0.2.106 | — | — | +2 |
| 0.2.104 | — | — | +5, -1 |
| 0.2.101 | — | — | +2 |
| 0.2.96 | — | — | -1 |
| 0.2.90 | — | — | +1 |
| 0.2.89 | — | — | +3 |
| 0.2.80 | — | — | +2, -1 |
| 0.2.79 | — | — | +2 |
| 0.2.76 | — | — | +22 |
| 0.2.74 | — | — | +1 |
| 0.2.65 | — | — | +2 |
| 0.2.56 | — | — | +1 |
| 0.2.55 | — | — | +1 |
| 0.2.54 | — | — | +3, -6 |
| 0.2.51 | — | — | +1 |
| 0.2.47 | — | — | +1 |
| 0.2.46 | — | — | +1 |
| 0.2.45 | — | — | +1 |
| 0.2.42 | — | — | +1 |
| 0.2.40 | — | — | +1 |
| 0.2.39 | — | — | +6 |
| 0.2.36 | — | — | +1 |
| 0.2.33 | — | — | +112 |

</details>

---
*Last updated: 2026-04-09*
