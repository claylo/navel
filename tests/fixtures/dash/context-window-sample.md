# Explore the context window

> An interactive simulation of how Claude Code's context window fills.

export const ContextWindow = () => {
  const MAX = 200000;
  const STARTUP_END = 0.2;
  {}
  const EVENTS = useMemo(() => [{}, {
    t: 0.015,
    kind: 'auto',
    label: 'System prompt',
    tokens: 4200,
    color: '#6B6964',
    vis: 'hidden',
    desc: 'Core instructions for behavior, tool use, and response formatting.',
    link: null
  }, {
    t: 0.035,
    kind: 'auto',
    label: 'Auto memory (MEMORY.md)',
    tokens: 680,
    color: '#E8A45C',
    vis: 'hidden',
    desc: "Claude's notes to itself from previous sessions.",
    tip: 'Keep it under 200 lines.',
    link: '/en/memory#auto-memory'
  }, {
    t: 0.22,
    kind: 'user',
    label: 'Your prompt',
    tokens: 45,
    color: '#558A42',
    vis: 'full',
    desc: '"Fix the auth bug where users get 401 after token refresh"',
    link: null
  }, {
    t: 0.28,
    kind: 'claude',
    label: 'Read src/api/auth.ts',
    tokens: 2400,
    color: '#8A8880',
    vis: 'brief',
    desc: 'Main auth file. You see "Read auth.ts" in your terminal.',
    link: null
  }, {
    t: 0.795,
    kind: 'sub',
    label: 'System prompt',
    tokens: 0,
    subTokens: 900,
    color: '#6B6964',
    vis: 'hidden',
    desc: "The subagent gets its own system prompt.",
    link: '/en/sub-agents'
  }, {
    t: 0.93,
    kind: 'compact',
    label: '/compact',
    tokens: 0,
    color: '#D97757',
    vis: 'brief',
    desc: 'Replaces the conversation with a structured summary.',
    link: '/en/how-claude-code-works#the-context-window'
  }].filter(e => e.t !== undefined), []);
  return <div>widget</div>;
};

<ContextWindow />

## What the timeline shows

Some prose here.
