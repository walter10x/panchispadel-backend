import type { IWsGateway } from './ws-gateway';
import type { WsPayload } from './ws-events';
import {
  WS_EVENT_MATCH_CREATED,
  WS_EVENT_RESULT_CONFIRMED,
  WS_EVENT_MATCH_PLAYER_JOINED,
  WS_EVENT_NOTIFICATION_NEW,
} from './ws-events';

// ─── Mock factory ────────────────────────────────────────────────────────────

function createMockWsGateway(): jest.Mocked<IWsGateway> {
  return {
    emitToUser: jest.fn(),
    emitToMatch: jest.fn(),
    broadcast: jest.fn(),
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('IWsGateway', () => {
  let gateway: jest.Mocked<IWsGateway>;

  beforeEach(() => {
    gateway = createMockWsGateway();
  });

  describe('interface contract', () => {
    it('creates a mock that satisfies the IWsGateway interface (compile-time)', () => {
      // Compile-time check: if the mock did not match IWsGateway, this would not compile.
      const _mock: IWsGateway = createMockWsGateway();
      expect(_mock).toBeDefined();
    });

    it('exposes all three expected methods', () => {
      expect(gateway.emitToUser).toBeDefined();
      expect(gateway.emitToMatch).toBeDefined();
      expect(gateway.broadcast).toBeDefined();
    });

    it('each method is a jest function (mockable)', () => {
      expect(jest.isMockFunction(gateway.emitToUser)).toBe(true);
      expect(jest.isMockFunction(gateway.emitToMatch)).toBe(true);
      expect(jest.isMockFunction(gateway.broadcast)).toBe(true);
    });
  });

  describe('emitToUser', () => {
    it('accepts a valid user ID, server event and payload without error', () => {
      const payload: WsPayload = {
        matchId: 'match-1',
        creatorId: 'user-1',
        date: '2024-06-01',
        clubId: 'Padel Club',
      };

      gateway.emitToUser('user-1', WS_EVENT_MATCH_CREATED, payload);

      expect(gateway.emitToUser).toHaveBeenCalledTimes(1);
      expect(gateway.emitToUser).toHaveBeenCalledWith('user-1', 'match:created', payload);
    });

    it('accepts any WsServerEvent value', () => {
      const payload: WsPayload = { matchId: 'm-1', resultId: 'r-1' };

      gateway.emitToUser('user-2', WS_EVENT_RESULT_CONFIRMED, payload);

      expect(gateway.emitToUser).toHaveBeenCalledWith('user-2', 'result:confirmed', payload);
    });

    it('handles empty userId gracefully', () => {
      gateway.emitToUser('', WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });
      expect(gateway.emitToUser).toHaveBeenCalled();
    });

    it('handles userId with special characters', () => {
      gateway.emitToUser('user@email.com', WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });
      expect(gateway.emitToUser).toHaveBeenCalledWith(
        'user@email.com',
        'match:created',
        expect.any(Object),
      );
    });
  });

  describe('emitToMatch', () => {
    it('accepts a valid match ID, event and payload', () => {
      const payload: WsPayload = {
        matchId: 'match-42',
        userId: 'user-7',
        userName: 'Alice',
        playersCount: 3,
        maxPlayers: 4,
      };

      gateway.emitToMatch('match-42', WS_EVENT_MATCH_PLAYER_JOINED, payload);

      expect(gateway.emitToMatch).toHaveBeenCalledWith(
        'match-42',
        expect.any(String),
        payload,
      );
    });

    it('forwards the correct event name string', () => {
      gateway.emitToMatch('m-1', WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });

      expect(gateway.emitToMatch.mock.calls[0]?.[1]).toBe('match:created');
    });

    it('handles empty matchId', () => {
      gateway.emitToMatch('', WS_EVENT_MATCH_CREATED, {
        matchId: '',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });
      expect(gateway.emitToMatch).toHaveBeenCalled();
    });
  });

  describe('broadcast', () => {
    it('accepts an event and payload', () => {
      const payload: WsPayload = {
        notificationId: 'notif-1',
        type: 'info',
        title: 'System',
        message: 'Maintenance',
        timestamp: '2024-06-01T00:00:00Z',
      };

      gateway.broadcast(WS_EVENT_NOTIFICATION_NEW, payload);

      expect(gateway.broadcast).toHaveBeenCalledWith(expect.any(String), payload);
    });

    it('forwards the correct event name string', () => {
      gateway.broadcast(WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });

      expect(gateway.broadcast.mock.calls[0]?.[0]).toBe('match:created');
    });
  });

  describe('method isolation', () => {
    it('emitToUser does not affect emitToMatch or broadcast', () => {
      gateway.emitToUser('u-1', WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });
      expect(gateway.emitToUser).toHaveBeenCalledTimes(1);
      expect(gateway.emitToMatch).not.toHaveBeenCalled();
      expect(gateway.broadcast).not.toHaveBeenCalled();
    });

    it('emitToMatch does not affect emitToUser or broadcast', () => {
      gateway.emitToMatch('m-1', WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });
      expect(gateway.emitToMatch).toHaveBeenCalledTimes(1);
      expect(gateway.emitToUser).not.toHaveBeenCalled();
      expect(gateway.broadcast).not.toHaveBeenCalled();
    });

    it('broadcast does not affect emitToUser or emitToMatch', () => {
      gateway.broadcast(WS_EVENT_MATCH_CREATED, {
        matchId: 'm-1',
        creatorId: 'u-1',
        date: '2024-01-01',
        clubId: 'C',
      });
      expect(gateway.broadcast).toHaveBeenCalledTimes(1);
      expect(gateway.emitToUser).not.toHaveBeenCalled();
      expect(gateway.emitToMatch).not.toHaveBeenCalled();
    });
  });
});
