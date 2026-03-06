#!/usr/bin/env node
/**
 * api-capture.mjs — API gateway intercept
 *
 * Intercepts Claude Code's Anthropic API request by acting as a local
 * HTTP gateway. Captures the full messages.create() payload — system
 * prompt, tool definitions, model, caching markers — and outputs a
 * clean markdown document.
 *
 * Usage:
 *   node api-capture.mjs <path-to-cli.js> [-- claude-code-flags...]
 *
 * Environment:
 *   CAPTURE_RAW_DIR   Where to write captured-payload.json (default: /tmp/claude)
 *
 * Output:
 *   stdout — Markdown: system prompt text + tool definitions
 *   stderr — Diagnostics (gateway activity, captured payload stats)
 */

import { createServer } from 'node:http';
import {
  existsSync, mkdirSync, writeFileSync, readFileSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CAPTURE_TIMEOUT_MS = 30_000;
const FAKE_API_KEY =
  'sk-ant-api03-capture-00000000000000000000000000000000000000000000000000000000-00000000AAAAAA';
const RAW_OUTPUT_DIR = process.env.CAPTURE_RAW_DIR || '/tmp/claude';
const RAW_OUTPUT_FILE = join(RAW_OUTPUT_DIR, 'captured-payload.json');

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  let cliPath = null;
  let realAuth = false;
  const passthroughArgs = [];

  const sepIdx = args.indexOf('--');
  const ownArgs = sepIdx >= 0 ? args.slice(0, sepIdx) : args;
  const extraArgs = sepIdx >= 0 ? args.slice(sepIdx + 1) : [];

  for (let i = 0; i < ownArgs.length; i++) {
    if (ownArgs[i] === '--model' && i + 1 < ownArgs.length) {
      passthroughArgs.push('--model', ownArgs[++i]);
    } else if (ownArgs[i] === '--real-auth') {
      realAuth = true;
    } else if (!ownArgs[i].startsWith('-')) {
      cliPath = ownArgs[i];
    }
  }

  passthroughArgs.push(...extraArgs);
  return { cliPath, passthroughArgs, realAuth };
}

// ---------------------------------------------------------------------------
// Version extraction
// ---------------------------------------------------------------------------

function extractVersion(cliPath) {
  const pathMatch = cliPath.match(/versions\/v(\d+\.\d+\.\d+)/);
  if (pathMatch) return pathMatch[1];

  try {
    const src = readFileSync(cliPath, 'utf8');
    const m = src.match(/VERSION:"(\d+\.\d+\.\d+)"/);
    if (m) return m[1];
  } catch { /* ignore */ }

  return 'unknown';
}

// ---------------------------------------------------------------------------
// SSE response builder
// ---------------------------------------------------------------------------

function writeSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sendStreamingResponse(res, model) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const msgId = `msg_capture_${Date.now()}`;

  writeSSE(res, 'message_start', {
    type: 'message_start',
    message: {
      id: msgId, type: 'message', role: 'assistant', content: [],
      model, stop_reason: null, stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 0 },
    },
  });

  writeSSE(res, 'content_block_start', {
    type: 'content_block_start', index: 0,
    content_block: { type: 'text', text: '' },
  });

  writeSSE(res, 'content_block_delta', {
    type: 'content_block_delta', index: 0,
    delta: { type: 'text_delta', text: 'Captured.' },
  });

  writeSSE(res, 'content_block_stop', {
    type: 'content_block_stop', index: 0,
  });

  writeSSE(res, 'message_delta', {
    type: 'message_delta',
    delta: { stop_reason: 'end_turn', stop_sequence: null },
    usage: { output_tokens: 1 },
  });

  writeSSE(res, 'message_stop', { type: 'message_stop' });

  res.end();
}

function sendJsonResponse(res, model) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    id: `msg_capture_${Date.now()}`,
    type: 'message', role: 'assistant',
    content: [{ type: 'text', text: 'Captured.' }],
    model, stop_reason: 'end_turn', stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 1 },
  }));
}

// ---------------------------------------------------------------------------
// Gateway server
// ---------------------------------------------------------------------------

function startGateway() {
  let onCapture, onError;
  const captured = new Promise((resolve, reject) => {
    onCapture = resolve;
    onError = reject;
  });

  let resolved = false;

  const server = createServer((req, res) => {
    const { method, url } = req;
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      console.error(`  gateway: ${method} ${url} (${body.length} bytes)`);

      if (method === 'POST' && url.includes('messages')) {
        let payload;
        try {
          payload = JSON.parse(body);
        } catch (e) {
          console.error(`  gateway: JSON parse error: ${e.message}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: e.message } }));
          return;
        }

        const model = payload.model || 'claude-sonnet-4-20250514';

        if (payload.stream) {
          sendStreamingResponse(res, model);
        } else {
          sendJsonResponse(res, model);
        }

        if (!resolved && payload.system) {
          resolved = true;
          console.error(
            `  gateway: captured — ${payload.system?.length || 0} system blocks, ` +
            `${payload.tools?.length || 0} tools, model=${model}`,
          );
          setTimeout(() => onCapture(payload), 200);
        }
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    });
  });

  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    console.error(`  gateway: listening on http://127.0.0.1:${port}`);
  });

  server.on('error', (e) => {
    if (!resolved) onError(e);
  });

  const timer = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      server.close();
      onError(new Error(
        `No API request captured within ${CAPTURE_TIMEOUT_MS / 1000}s. ` +
        'Claude Code may have failed to start or requires auth setup.',
      ));
    }
  }, CAPTURE_TIMEOUT_MS);

  captured.then(() => clearTimeout(timer)).catch(() => clearTimeout(timer));

  return { server, captured };
}

// ---------------------------------------------------------------------------
// Spawn Claude Code
// ---------------------------------------------------------------------------

function spawnClaude(cliPath, port, { passthroughArgs, realAuth }) {
  const env = {
    ...process.env,
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}`,
    NO_COLOR: '1',
  };

  // In real-auth mode, keep the user's existing API key or session auth.
  // Otherwise use a fake key (the gateway responds before it matters).
  if (!realAuth) {
    env.ANTHROPIC_API_KEY = FAKE_API_KEY;
  }

  const claudeArgs = [cliPath, '-p', 'hello'];

  claudeArgs.push('--no-session-persistence');

  const emptyMcpConfig = join(RAW_OUTPUT_DIR, 'empty-mcp.json');
  mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
  writeFileSync(emptyMcpConfig, '{"mcpServers":{}}');
  claudeArgs.push('--strict-mcp-config', '--mcp-config', emptyMcpConfig);

  claudeArgs.push(...passthroughArgs);

  console.error(`  spawning: node ${claudeArgs.join(' ')}`);

  const proc = spawn(process.execPath, claudeArgs, {
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  proc.stdin.end();

  proc.stdout.on('data', (d) => {
    const msg = d.toString().trim();
    if (msg) console.error(`  claude stdout: ${msg}`);
  });

  proc.stderr.on('data', (d) => {
    const msg = d.toString().trim();
    if (msg) console.error(`  claude stderr: ${msg}`);
  });

  proc.on('exit', (code, signal) => {
    console.error(`  claude exited: code=${code} signal=${signal}`);
  });

  return proc;
}

// ---------------------------------------------------------------------------
// Format captured payload as markdown
// ---------------------------------------------------------------------------

function formatOutput(payload, version) {
  const lines = [];

  lines.push(`# Claude Code v${version} — System Prompt (API capture)`);
  lines.push('');
  lines.push('Captured by intercepting the Anthropic API request.');
  lines.push(`Model: ${payload.model || 'unknown'}`);
  lines.push(`Stream: ${payload.stream ?? 'unknown'}`);
  lines.push(`Max tokens: ${payload.max_tokens ?? 'unknown'}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  const systemBlocks = payload.system || [];
  if (typeof systemBlocks === 'string') {
    lines.push(systemBlocks);
    lines.push('');
  } else if (Array.isArray(systemBlocks)) {
    for (let i = 0; i < systemBlocks.length; i++) {
      const block = systemBlocks[i];
      const text = typeof block === 'string' ? block : block.text || '';
      const cacheInfo = block.cache_control
        ? ` [cache: ${JSON.stringify(block.cache_control)}]`
        : '';

      if (systemBlocks.length > 1) {
        lines.push(`<!-- system block ${i + 1}/${systemBlocks.length}${cacheInfo} -->`);
      }
      lines.push(text);
      lines.push('');
    }
  }

  const tools = payload.tools || [];
  if (tools.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push(`## Tool Definitions (${tools.length} tools)`);
    lines.push('');

    for (const tool of tools) {
      lines.push(`### ${tool.name}`);
      lines.push('');
      if (tool.description) {
        lines.push(tool.description);
        lines.push('');
      }

      const schema = tool.input_schema;
      if (schema && schema.properties) {
        const required = new Set(schema.required || []);
        const params = Object.entries(schema.properties);
        if (params.length > 0) {
          lines.push('**Parameters:**');
          for (const [name, prop] of params) {
            const req = required.has(name) ? ', required' : '';
            const type = prop.type || 'any';
            const desc = prop.description ? ` — ${prop.description.split('\n')[0]}` : '';
            lines.push(`- \`${name}\` (${type}${req})${desc}`);
          }
          lines.push('');
        }
      }
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Save raw payload
// ---------------------------------------------------------------------------

function saveRawPayload(payload) {
  try {
    mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
    writeFileSync(RAW_OUTPUT_FILE, JSON.stringify(payload, null, 2));
    console.error(`  raw payload: ${RAW_OUTPUT_FILE}`);
  } catch (e) {
    console.error(`  warning: could not save raw payload: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { cliPath, passthroughArgs, realAuth } = parseArgs(process.argv);
  if (!cliPath || !existsSync(cliPath)) {
    console.error(
      'Path to cli.js is required.\n' +
      'Usage: node api-capture.mjs [--real-auth] <path-to-cli.js> [-- claude-code-flags...]',
    );
    process.exit(1);
  }

  const version = extractVersion(cliPath);
  console.error(`Target: ${cliPath}`);
  console.error(`Version: ${version}`);
  if (realAuth) console.error('Auth: real (using existing credentials)');
  if (passthroughArgs.length > 0) {
    console.error(`Pass-through flags: ${passthroughArgs.join(' ')}`);
  }

  const { server, captured } = startGateway();

  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.on('listening', resolve);
  });
  const { port } = server.address();

  const proc = spawnClaude(cliPath, port, { passthroughArgs, realAuth });

  const cleanup = () => {
    proc.kill('SIGTERM');
    server.close();
  };
  process.on('SIGINT', () => { cleanup(); process.exit(130); });

  let payload;
  try {
    payload = await captured;
  } catch (e) {
    console.error(`\nFailed: ${e.message}`);
    cleanup();
    process.exit(1);
  }

  proc.kill('SIGTERM');
  server.close();

  saveRawPayload(payload);

  const md = formatOutput(payload, version);
  process.stdout.write(md);

  const systemBlocks = Array.isArray(payload.system) ? payload.system.length : 1;
  const toolCount = payload.tools?.length || 0;
  console.error(`\nDone. ${systemBlocks} system blocks, ${toolCount} tools captured.`);
}

main().catch((e) => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
