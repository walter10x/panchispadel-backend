import type { WsServerEvent, WsPayload } from './ws-events';

/**
 * WebSocket Gateway interface (hexagonal architecture port).
 *
 * Domain layer depends on this abstraction — NOT on infrastructure details
 * like Socket.IO. Implementation lives in infrastructure/.
 */
export interface IWsGateway {
  /**
   * Emit an event to a specific user's room.
   */
  emitToUser(userId: string, event: WsServerEvent, data: WsPayload): void;

  /**
   * Emit an event to all clients in a match room.
   */
  emitToMatch(matchId: string, event: WsServerEvent, data: WsPayload): void;

  /**
   * Emit an event to all connected clients.
   */
  broadcast(event: WsServerEvent, data: WsPayload): void;
}
