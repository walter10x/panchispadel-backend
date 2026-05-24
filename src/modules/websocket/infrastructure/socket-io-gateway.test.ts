import * as http from 'http';
import { Server } from 'socket.io';
import { verifyWsToken } from './ws-auth';
import { SocketIoGateway } from './socket-io-gateway';
import type {
  MatchUpdatedPayload,
  MatchCreatedPayload,
  MatchPlayerJoinedPayload,
  NotificationNewPayload,
} from '../domain/ws-events';
import {
  WS_EVENT_MATCH_CREATED,
  WS_EVENT_MATCH_UPDATED,
  WS_EVENT_MATCH_PLAYER_JOINED,
  WS_EVENT_NOTIFICATION_NEW,
} from '../domain/ws-events';

// ─── Module mocks (hoisted by Jest) ────────────────────────────────────────

jest.mock('socket.io', () => ({
  Server: jest.fn(),
}));

jest.mock('./ws-auth', () => ({
  verifyWsToken: jest.fn(),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Type-narrow a function reference to jest.Mock for strict TypeScript. */
function asMock<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): jest.Mock<R, Args> {
  return fn as unknown as jest.Mock<R, Args>;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('SocketIoGateway', () => {
  let mockIo: {
    to: jest.Mock;
    emit: jest.Mock;
    use: jest.Mock;
    on: jest.Mock;
  };
  let mockToResult: { emit: jest.Mock };
  let httpServer: http.Server;
  let gateway: SocketIoGateway;

  beforeEach(() => {
    mockToResult = { emit: jest.fn() };
    mockIo = {
      to: jest.fn(() => mockToResult),
      emit: jest.fn(),
      use: jest.fn(),
      on: jest.fn(),
    };
    (Server as unknown as jest.Mock).mockReturnValue(mockIo);

    httpServer = new http.Server();
    gateway = new SocketIoGateway(httpServer);
  });

  // ─── emitToUser ────────────────────────────────────────────────────────

  describe('emitToUser', () => {
    it('emits an event to the user:{userId} room', () => {
      const payload: MatchUpdatedPayload = {
        matchId: 'm-1',
        changes: { score: '6-3' },
      };

      gateway.emitToUser('user-1', WS_EVENT_MATCH_UPDATED, payload);

      expect(mockIo.to).toHaveBeenCalledWith('user:user-1');
      expect(mockToResult.emit).toHaveBeenCalledWith(
        WS_EVENT_MATCH_UPDATED,
        payload,
      );
    });
  });

  // ─── emitToMatch ───────────────────────────────────────────────────────

  describe('emitToMatch', () => {
    it('emits an event to the match:{matchId} room', () => {
      const payload: MatchCreatedPayload = {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-06-01',
        clubId: 'club-1',
      };

      gateway.emitToMatch('match-1', WS_EVENT_MATCH_CREATED, payload);

      expect(mockIo.to).toHaveBeenCalledWith('match:match-1');
      expect(mockToResult.emit).toHaveBeenCalledWith(
        WS_EVENT_MATCH_CREATED,
        payload,
      );
    });
  });

  // ─── broadcast ─────────────────────────────────────────────────────────

  describe('broadcast', () => {
    it('emits an event to all connected clients', () => {
      const payload: NotificationNewPayload = {
        notificationId: 'n-1',
        type: 'info',
        title: 'Server notice',
        message: 'Scheduled maintenance',
        timestamp: new Date().toISOString(),
      };

      gateway.broadcast(WS_EVENT_NOTIFICATION_NEW, payload);

      expect(mockIo.emit).toHaveBeenCalledWith(
        WS_EVENT_NOTIFICATION_NEW,
        payload,
      );
    });
  });

  // ─── rawServer accessor ─────────────────────────────────────────────────

  describe('rawServer', () => {
    it('returns the underlying Socket.IO Server instance', () => {
      expect(gateway.rawServer).toBe(mockIo);
    });
  });

  // ─── Multiple consecutive sends ────────────────────────────────────────

  describe('multiple consecutive sends', () => {
    it('handles interleaved emitToUser and emitToMatch calls', () => {
      const payload1: MatchUpdatedPayload = {
        matchId: 'm-1',
        changes: { score: '6-3' },
      };
      const payload2: MatchCreatedPayload = {
        matchId: 'm-2',
        creatorId: 'u-2',
        date: '2024-06-02',
        clubId: 'club-2',
      };
      const payload3: MatchPlayerJoinedPayload = {
        matchId: 'm-1',
        userId: 'u-3',
        userName: 'Player3',
        playersCount: 3,
        maxPlayers: 4,
      };

      gateway.emitToUser('user-1', WS_EVENT_MATCH_UPDATED, payload1);
      gateway.emitToMatch('match-2', WS_EVENT_MATCH_CREATED, payload2);
      gateway.emitToUser('user-3', WS_EVENT_MATCH_PLAYER_JOINED, payload3);

      // First call — emitToUser
      expect(mockIo.to.mock.calls[0] as [string]).toEqual(['user:user-1']);
      expect(mockToResult.emit.mock.calls[0] as [string, MatchUpdatedPayload]).toEqual([
        WS_EVENT_MATCH_UPDATED,
        payload1,
      ]);

      // Second call — emitToMatch
      expect(mockIo.to.mock.calls[1] as [string]).toEqual(['match:match-2']);
      expect(mockToResult.emit.mock.calls[1] as [string, MatchCreatedPayload]).toEqual([
        WS_EVENT_MATCH_CREATED,
        payload2,
      ]);

      // Third call — emitToUser again
      expect(mockIo.to.mock.calls[2] as [string]).toEqual(['user:user-3']);
      expect(mockToResult.emit.mock.calls[2] as [string, MatchPlayerJoinedPayload]).toEqual([
        WS_EVENT_MATCH_PLAYER_JOINED,
        payload3,
      ]);
    });
  });

  // ─── Edge cases / error handling ──────────────────────────────────────

  describe('edge cases and error handling', () => {
    it('does not throw with minimal payload', () => {
      const payload: MatchUpdatedPayload = { matchId: '', changes: {} };

      expect(() => {
        gateway.emitToUser('user-1', WS_EVENT_MATCH_UPDATED, payload);
      }).not.toThrow();

      expect(mockToResult.emit).toHaveBeenCalledWith(
        WS_EVENT_MATCH_UPDATED,
        payload,
      );
    });

    it('does not throw with empty userId', () => {
      const payload: MatchUpdatedPayload = { matchId: 'm-1', changes: {} };

      expect(() => {
        gateway.emitToUser('', WS_EVENT_MATCH_UPDATED, payload);
      }).not.toThrow();

      expect(mockIo.to).toHaveBeenCalledWith('user:');
    });

    it('does not throw with empty matchId', () => {
      const payload: MatchUpdatedPayload = { matchId: '', changes: {} };

      expect(() => {
        gateway.emitToMatch('', WS_EVENT_MATCH_UPDATED, payload);
      }).not.toThrow();

      expect(mockIo.to).toHaveBeenCalledWith('match:');
    });
  });

  // ─── Authentication middleware ─────────────────────────────────────────

  describe('authentication middleware', () => {
    /**
     * Extract the middleware function that was registered via io.use().
     * The first argument to the first use() call is the middleware callback.
     */
    function getMiddleware(): (
      socket: Record<string, unknown>,
      next: (err?: Error) => void,
    ) => void {
      return mockIo.use.mock.calls[0]![0] as (
        socket: Record<string, unknown>,
        next: (err?: Error) => void,
      ) => void;
    }

    it('rejects connections with no token', () => {
      asMock(verifyWsToken).mockReturnValue(null);

      const middleware = getMiddleware();
      const next = jest.fn();
      const socket = {
        handshake: { auth: {}, query: {} },
        data: {},
      };

      middleware(socket, next);

      expect(verifyWsToken).toHaveBeenCalledWith(undefined);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('rejects connections with an invalid token', () => {
      asMock(verifyWsToken).mockReturnValue(null);

      const middleware = getMiddleware();
      const next = jest.fn();
      const socket = {
        handshake: { auth: { token: 'bad-token' }, query: {} },
        data: {},
      };

      middleware(socket, next);

      expect(verifyWsToken).toHaveBeenCalledWith('bad-token');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0]![0] as Error;
      expect(error.message).toContain('Authentication failed');
    });

    it('rejects connections with a token in query string', () => {
      // Socket.IO clients can send tokens via query param too.
      // Both paths should be checked.
      const middleware = getMiddleware();
      const next = jest.fn();
      const socket = {
        handshake: { auth: {}, query: { token: 'query-token' } },
        data: {},
      };

      asMock(verifyWsToken).mockReturnValue(null);

      middleware(socket, next);

      expect(verifyWsToken).toHaveBeenCalledWith('query-token');
    });

    it('prefers auth token over query token when both present', () => {
      const middleware = getMiddleware();
      const next = jest.fn();
      const socket = {
        handshake: { auth: { token: 'auth-token' }, query: { token: 'query-token' } },
        data: {},
      };

      asMock(verifyWsToken).mockReturnValue(null);

      middleware(socket, next);

      // nullish coalescing means auth token wins
      expect(verifyWsToken).toHaveBeenCalledWith('auth-token');
    });

    it('accepts connections with a valid token and attaches user data', () => {
      asMock(verifyWsToken).mockReturnValue({
        userId: 'u-1',
        email: 'test@example.com',
      });

      const middleware = getMiddleware();
      const next = jest.fn();
      const socket: { handshake: { auth: { token: string }; query: {} }; data: Record<string, unknown> } = {
        handshake: { auth: { token: 'valid-token' }, query: {} },
        data: {},
      };

      middleware(socket, next);

      expect(verifyWsToken).toHaveBeenCalledWith('valid-token');
      expect(next).toHaveBeenCalledWith();
      expect(socket.data['userId']).toBe('u-1');
      expect(socket.data['email']).toBe('test@example.com');
    });
  });

  // ─── Connection handler ────────────────────────────────────────────────

  describe('connection handler', () => {
    function getConnectionHandler(): (socket: Record<string, unknown>) => void {
      return mockIo.on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'connection',
      )![1] as (socket: Record<string, unknown>) => void;
    }

    it('joins the user to their personal room on connection', () => {
      const handler = getConnectionHandler();
      const socket = {
        data: { userId: 'u-1' },
        join: jest.fn(),
        on: jest.fn(),
        disconnect: jest.fn(),
        leave: jest.fn(),
      };

      handler(socket);

      expect(socket.join).toHaveBeenCalledWith('user:u-1');
    });

    it('disconnects the socket if userId is missing from socket.data', () => {
      const handler = getConnectionHandler();
      const socket = {
        data: {},
        join: jest.fn(),
        on: jest.fn(),
        disconnect: jest.fn(),
        leave: jest.fn(),
      };

      handler(socket);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
      expect(socket.join).not.toHaveBeenCalled();
    });

    it('registers room:join:match handler on the socket', () => {
      const handler = getConnectionHandler();
      const socket = {
        data: { userId: 'u-1' },
        join: jest.fn(),
        on: jest.fn(),
        disconnect: jest.fn(),
        leave: jest.fn(),
      };

      handler(socket);

      const calls = asMock(socket.on).mock.calls.filter(
        (call) => call[0] === 'room:join:match',
      );
      expect(calls).toHaveLength(1);
    });

    it('room:join:match handler joins the specified match room', () => {
      const handler = getConnectionHandler();
      let registeredHandler: ((data: { matchId: string }) => void) | undefined;
      const socket = {
        data: { userId: 'u-1' },
        join: jest.fn(),
        on: jest.fn(
          (event: string, cb: (data: { matchId: string }) => void) => {
            if (event === 'room:join:match') {
              registeredHandler = cb;
            }
          },
        ),
        disconnect: jest.fn(),
        leave: jest.fn(),
      };

      handler(socket);
      registeredHandler!({ matchId: 'm-42' });

      expect(socket.join).toHaveBeenCalledWith('match:m-42');
    });

    it('room:leave:match handler leaves the specified match room', () => {
      const handler = getConnectionHandler();
      let registeredHandler: ((data: { matchId: string }) => void) | undefined;
      const socket = {
        data: { userId: 'u-1' },
        join: jest.fn(),
        on: jest.fn(
          (event: string, cb: (data: { matchId: string }) => void) => {
            if (event === 'room:leave:match') {
              registeredHandler = cb;
            }
          },
        ),
        disconnect: jest.fn(),
        leave: jest.fn(),
      };

      handler(socket);
      registeredHandler!({ matchId: 'm-99' });

      expect(socket.leave).toHaveBeenCalledWith('match:m-99');
    });

    it('registers a disconnect handler on the socket', () => {
      const handler = getConnectionHandler();
      const socket = {
        data: { userId: 'u-1' },
        join: jest.fn(),
        on: jest.fn(),
        disconnect: jest.fn(),
        leave: jest.fn(),
      };

      handler(socket);

      const calls = asMock(socket.on).mock.calls.filter(
        (call) => call[0] === 'disconnect',
      );
      expect(calls).toHaveLength(1);
    });
  });
});
