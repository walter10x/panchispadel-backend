import http from 'http';
import { app } from '../app';
import { env } from './env';
import { initializeDatabase } from './database';
import { registerRoutes } from './register-routes';
import { SocketIoGateway } from '../modules/websocket/infrastructure/socket-io-gateway';
import { seedAdmin } from './seeds/admin-seed';

async function start(): Promise<void> {
  try {
    await initializeDatabase();

    try {
      await seedAdmin();
    } catch (seedError) {
      console.error('[seed] admin seed falló (el server sigue):', seedError);
    }

    // Create HTTP server from Express app (required by Socket.IO)
    const httpServer = http.createServer(app);

    // Initialize WebSocket gateway (Socket.IO)
    const wsGateway = new SocketIoGateway(httpServer);

    // Pass wsGateway to route registration for optional injection
    registerRoutes(app, wsGateway);

    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
