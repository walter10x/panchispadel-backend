// ─── Event Constants ─────────────────────────────────────────────────────────
// Match events
export const WS_EVENT_MATCH_CREATED = 'match:created' as const;
export const WS_EVENT_MATCH_UPDATED = 'match:updated' as const;
export const WS_EVENT_MATCH_PLAYER_JOINED = 'match:player_joined' as const;
export const WS_EVENT_MATCH_PLAYER_CONFIRMED = 'match:player_confirmed' as const;
export const WS_EVENT_MATCH_PLAYER_REJECTED = 'match:player_rejected' as const;
export const WS_EVENT_MATCH_PLAYER_LEFT = 'match:player_left' as const;
export const WS_EVENT_MATCH_CANCELLED = 'match:cancelled' as const;

// Result events
export const WS_EVENT_RESULT_PENDING = 'result:pending' as const;
export const WS_EVENT_RESULT_CONFIRMED = 'result:confirmed' as const;

// Notification events
export const WS_EVENT_NOTIFICATION_NEW = 'notification:new' as const;

// Client events (emitted by client to server)
export const WS_CLIENT_ROOM_JOIN_MATCH = 'room:join:match' as const;
export const WS_CLIENT_ROOM_LEAVE_MATCH = 'room:leave:match' as const;

// ─── Payload Types ──────────────────────────────────────────────────────────
export interface MatchCreatedPayload {
  matchId: string;
  creatorId: string;
  date: string;
  clubId: string;
}

export interface MatchUpdatedPayload {
  matchId: string;
  changes: Record<string, unknown>;
}

export interface MatchPlayerJoinedPayload {
  matchId: string;
  userId: string;
  userName: string;
  playersCount: number;
  maxPlayers: number;
}

export interface MatchPlayerConfirmedPayload {
  matchId: string;
  userId: string;
  userName: string;
}

export interface MatchPlayerRejectedPayload {
  matchId: string;
  userId: string;
  userName: string;
}

export interface MatchPlayerLeftPayload {
  matchId: string;
  userId: string;
  userName: string;
  playersCount: number;
}

export interface MatchCancelledPayload {
  matchId: string;
  reason?: string;
}

export interface ResultPendingPayload {
  matchId: string;
  resultId: string;
  recordedBy: string;
}

export interface ResultConfirmedPayload {
  matchId: string;
  resultId: string;
}

export interface NotificationNewPayload {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  matchId?: string;
  playerId?: string;
  timestamp: string;
}

// ─── Union type for all WS payloads ─────────────────────────────────────────
export type WsPayload =
  | MatchCreatedPayload
  | MatchUpdatedPayload
  | MatchPlayerJoinedPayload
  | MatchPlayerConfirmedPayload
  | MatchPlayerRejectedPayload
  | MatchPlayerLeftPayload
  | MatchCancelledPayload
  | ResultPendingPayload
  | ResultConfirmedPayload
  | NotificationNewPayload;

// ─── Room name helpers ──────────────────────────────────────────────────────
export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function matchRoom(matchId: string): string {
  return `match:${matchId}`;
}

// ─── Valid event names for type safety ──────────────────────────────────────
export type WsServerEvent =
  | typeof WS_EVENT_MATCH_CREATED
  | typeof WS_EVENT_MATCH_UPDATED
  | typeof WS_EVENT_MATCH_PLAYER_JOINED
  | typeof WS_EVENT_MATCH_PLAYER_CONFIRMED
  | typeof WS_EVENT_MATCH_PLAYER_REJECTED
  | typeof WS_EVENT_MATCH_PLAYER_LEFT
  | typeof WS_EVENT_MATCH_CANCELLED
  | typeof WS_EVENT_RESULT_PENDING
  | typeof WS_EVENT_RESULT_CONFIRMED
  | typeof WS_EVENT_NOTIFICATION_NEW;

export type WsClientEvent =
  | typeof WS_CLIENT_ROOM_JOIN_MATCH
  | typeof WS_CLIENT_ROOM_LEAVE_MATCH;
