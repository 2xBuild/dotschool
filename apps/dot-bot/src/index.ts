import { config } from './config';
import { startServer } from './server';
import { initializeVerifiedAccess } from './lib/verified-access';
import { testConnection } from './database/db';

let server: ReturnType<typeof startServer>;

const shutdown = () => {
  console.log('[Shutdown] Graceful shutdown...');
  server?.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function main(): Promise<void> {
  // Validate database connection before starting
  try {
    await testConnection();
    console.log('[Startup] Database connection OK');
  } catch (err) {
    console.error('[Startup] Database connection failed:', err);
    process.exit(1);
  }

  server = startServer();

  console.log('[Startup] Bot ready (HTTP interactions mode)');

  // Initialize verified role and channel permissions via REST API (non-blocking).
  // Uses a timeout so a stuck Discord API call won't block the REST queue.
  const INIT_TIMEOUT_MS = 15_000;
  Promise.race([
    initializeVerifiedAccess(config.guildId),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timed out after 15s')), INIT_TIMEOUT_MS),
    ),
  ])
    .then(({ roleCreatedOrFound, generalLocked }) => {
      console.log(
        `[Startup] Verified role ready as "${roleCreatedOrFound.name}". #general restricted: ${generalLocked ? 'yes' : 'no'}.`,
      );
    })
    .catch((err) => {
      console.error('[Startup] Failed to initialize verified access:', err);
    });
}

main().catch((err) => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
