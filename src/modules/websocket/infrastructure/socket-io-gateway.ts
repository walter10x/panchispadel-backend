import type { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import type { WsServerEvent, WsPayload } from '../domain/ws-events';
import { userRoom, matchRoom } from '../domain/ws-events';
import type { IWsGateway } from '../domain/ws-gateway';
import { verifyWsToken } from './ws-auth';
import { env } from '../../../config/env';

/**
 * Socket.IO implementation of IWsGateway.
 *
 * Responsibilities:
 *   - Create and manage the Socket.IO server
 *   - Authenticate connections via JWT (from handshake auth or query)
 *   - Auto-join new connections to their user:{userId} room
 *   - Handle room:join:match / room:leave:match client events
 *   - Clean up on disconnect
 */
export class SocketIoGateway implements IWsGateway {
  private readonly io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN : true,
        credentials: true,
      },
      pingInterval: 25_000,
      pingTimeout: 20_000,
    });

    this.setupAuth();
  }

  /**
   * Returns the raw Server instance for advanced use (namespace access, admin,
   * etc.). Most consumers should use the IWsGateway interface instead.
   */
  get rawServer(): Server {
    return this.io;
  }

  // ─── IWsGateway implementation ───────────────────────────────────────────

  emitToUser(userId: string, event: WsServerEvent, data: WsPayload): void {
    this.io.to(userRoom(userId)).emit(event, data);
  }

  emitToMatch(matchId: string, event: WsServerEvent, data: WsPayload): void {
    this.io.to(matchRoom(matchId)).emit(event, data);
  }

  broadcast(event: WsServerEvent, data: WsPayload): void {
    this.io.emit(event, data);
  }

  // ─── Private setup ───────────────────────────────────────────────────────

  private setupAuth(): void {
    this.io.use((socket: Socket, next) => {
      const token =
        (socket.handshake.auth?.['token'] as string | undefined) ??
        (socket.handshake.query?.['token'] as string | undefined);

      const authResult = verifyWsToken(token);

      if (!authResult) {
        next(new Error('Authentication failed: invalid or expired token'));
        return;
      }

      // Attach userId to the socket for later use
      (socket.data as Record<string, unknown>)['userId'] = authResult.userId;
      (socket.data as Record<string, unknown>)['email'] = authResult.email;

      next();
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data['userId'] as string | undefined;

      if (!userId) {
        socket.disconnect(true);
        return;
      }

      // Auto-join to personal room
      socket.join(userRoom(userId));

      // Handle match room management
      socket.on('room:join:match', (data: { matchId: string }) => {
        socket.join(matchRoom(data.matchId));
      });

      socket.on('room:leave:match', (data: { matchId: string }) => {
        socket.leave(matchRoom(data.matchId));
      });

      // Auto-leave all rooms on disconnect
      socket.on('disconnect', () => {
        // Socket.IO auto-leaves all rooms on disconnect; we just log if desired
      });
    });
  }
}
