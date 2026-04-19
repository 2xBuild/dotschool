import { config } from './config';
import { startServer } from './server';
import { initializeVerifiedAccess } from './lib/verified-access';

let server: ReturnType<typeof startServer>;

const shutdown = () => {
  console.log('[Shutdown] Graceful shutdown...');
  server?.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function main(): Promise<void> {
  server = startServer();

  // Initialize verified role and channel permissions via REST API
  try {
    const { roleCreatedOrFound, generalLocked } =
      await initializeVerifiedAccess(config.guildId);
    console.log(
      `[Startup] Verified role ready as "${roleCreatedOrFound.name}". #general restricted: ${generalLocked ? 'yes' : 'no'}.`,
    );
  } catch (err) {
    console.error('[Startup] Failed to initialize verified access:', err);
  }

  console.log('[Startup] Bot ready (HTTP interactions mode)');
}

main().catch((err) => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
