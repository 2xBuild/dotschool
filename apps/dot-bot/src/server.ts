import http from 'http';
import type { Client } from 'discord.js';
import { config } from './config';
import { handleStartBatch } from './handlers/start-batch';
import { handleSyncRole } from './handlers/sync-role';

export function startServer(client: Client): http.Server {
  const server = http.createServer(async (req, res) => {
    const url = req.url?.split('?')[0] ?? '';

    if (req.method === 'GET' && (url === '/' || url === '/health')) {
      json(res, 200, {
        status: 'ok',
        gateway: client.isReady() ? 'connected' : 'disconnected',
      });
      return;
    }

    if (req.method === 'GET' && url === '/redirect') {
      handleRedirect(req, res);
      return;
    }

    if (config.webhookSecret) {
      if (req.headers.authorization !== `Bearer ${config.webhookSecret}`) {
        json(res, 401, { error: 'Unauthorized' });
        return;
      }
    }

    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    let body: any;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      json(res, 400, { error: 'Invalid JSON' });
      return;
    }

    try {
      let result;
      if (url === '/start-batch') {
        result = await handleStartBatch(client, body);
      } else if (url === '/sync-role') {
        result = await handleSyncRole(client, body);
      } else {
        json(res, 404, { error: 'Not found' });
        return;
      }
      json(res, 'error' in result ? 400 : 200, result);
    } catch (err) {
      console.error('[Server] Handler error:', err);
      json(res, 500, { error: String(err) });
    }
  });

  server.listen(config.webhookPort, '0.0.0.0', () => {
    console.log(`[Server] Listening on 0.0.0.0:${config.webhookPort}`);
  });

  return server;
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function json(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function handleRedirect(req: http.IncomingMessage, res: http.ServerResponse) {
  const reqUrl = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const guildId = reqUrl.searchParams.get('guild_id') ?? '';
  const guildName = escapeHtml(reqUrl.searchParams.get('guild_name') ?? 'your server');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>dot.school Bot — Added</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f0f10; color: #e4e4e7; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 440px; width: 100%; padding: 2.5rem; border-radius: 1rem; background: #18181b; border: 1px solid #27272a; text-align: center; }
    .icon { width: 64px; height: 64px; margin: 0 auto 1.25rem; background: #22c55e20; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .icon svg { width: 32px; height: 32px; color: #22c55e; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 1.25rem; }
    .guild { display: inline-block; padding: 0.25rem 0.75rem; background: #27272a; border-radius: 9999px; font-size: 0.8rem; color: #d4d4d8; margin-bottom: 1.25rem; }
    .steps { text-align: left; margin: 1rem 0; }
    .steps li { font-size: 0.85rem; color: #a1a1aa; line-height: 1.8; }
    .steps li strong { color: #e4e4e7; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </div>
    <h1>Bot added successfully</h1>
    ${guildId ? `<div class="guild">${guildName}</div>` : ''}
    <p>The dot.school bot is now in your server. Here's what to do next:</p>
    <ol class="steps">
      <li>Make sure the bot role is <strong>above</strong> other roles it needs to manage</li>
      <li>Run <strong>/verify</strong> to register yourself</li>
      <li>Use <strong>/tag</strong>, <strong>/concern</strong>, and <strong>/announce</strong> to get started</li>
    </ol>
    <p>You can close this page now.</p>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}
