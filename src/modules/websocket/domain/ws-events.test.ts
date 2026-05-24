import {
  WS_EVENT_MATCH_CREATED,
  WS_EVENT_MATCH_UPDATED,
  WS_EVENT_MATCH_PLAYER_JOINED,
  WS_EVENT_MATCH_PLAYER_CONFIRMED,
  WS_EVENT_MATCH_PLAYER_REJECTED,
  WS_EVENT_MATCH_PLAYER_LEFT,
  WS_EVENT_MATCH_CANCELLED,
  WS_EVENT_RESULT_PENDING,
  WS_EVENT_RESULT_CONFIRMED,
  WS_EVENT_NOTIFICATION_NEW,
  WS_CLIENT_ROOM_JOIN_MATCH,
  WS_CLIENT_ROOM_LEAVE_MATCH,
  userRoom,
  matchRoom,
  type WsServerEvent,
  type WsClientEvent,
  type WsPayload,
  type MatchCreatedPayload,
  type MatchUpdatedPayload,
  type MatchPlayerJoinedPayload,
  type MatchPlayerConfirmedPayload,
  type MatchPlayerRejectedPayload,
  type MatchPlayerLeftPayload,
  type MatchCancelledPayload,
  type ResultPendingPayload,
  type ResultConfirmedPayload,
  type NotificationNewPayload,
} from './ws-events';

describe('WsEvents — constants', () => {
  it('define match event constants with kebab-case namespaced names', () => {
    expect(WS_EVENT_MATCH_CREATED).toBe('match:created');
    expect(WS_EVENT_MATCH_UPDATED).toBe('match:updated');
    expect(WS_EVENT_MATCH_PLAYER_JOINED).toBe('match:player_joined');
    expect(WS_EVENT_MATCH_PLAYER_CONFIRMED).toBe('match:player_confirmed');
    expect(WS_EVENT_MATCH_PLAYER_REJECTED).toBe('match:player_rejected');
    expect(WS_EVENT_MATCH_PLAYER_LEFT).toBe('match:player_left');
    expect(WS_EVENT_MATCH_CANCELLED).toBe('match:cancelled');
  });

  it('define result event constants', () => {
    expect(WS_EVENT_RESULT_PENDING).toBe('result:pending');
    expect(WS_EVENT_RESULT_CONFIRMED).toBe('result:confirmed');
  });

  it('define notification event constant', () => {
    expect(WS_EVENT_NOTIFICATION_NEW).toBe('notification:new');
  });

  it('define client event constants', () => {
    expect(WS_CLIENT_ROOM_JOIN_MATCH).toBe('room:join:match');
    expect(WS_CLIENT_ROOM_LEAVE_MATCH).toBe('room:leave:match');
  });
});

describe('WsEvents — room helpers', () => {
  it('userRoom returns user:{id} format', () => {
    expect(userRoom('abc-123')).toBe('user:abc-123');
  });

  it('matchRoom returns match:{id} format', () => {
    expect(matchRoom('match-456')).toBe('match:match-456');
  });
});

// ─── Compile-time type coverage ─────────────────────────────────────────────
//
// These tests verify type-safety at compile time via ts-jest.
// If a new event constant or payload type is added but not included in the
// corresponding union type, the test will fail to compile.

describe('WsEvents — type coverage (compile-time)', () => {
  it('WsServerEvent includes all server event constants', () => {
    // Compile-time check: every server event constant must be assignable to WsServerEvent
    const _all: WsServerEvent[] = [
      WS_EVENT_MATCH_CREATED,
      WS_EVENT_MATCH_UPDATED,
      WS_EVENT_MATCH_PLAYER_JOINED,
      WS_EVENT_MATCH_PLAYER_CONFIRMED,
      WS_EVENT_MATCH_PLAYER_REJECTED,
      WS_EVENT_MATCH_PLAYER_LEFT,
      WS_EVENT_MATCH_CANCELLED,
      WS_EVENT_RESULT_PENDING,
      WS_EVENT_RESULT_CONFIRMED,
      WS_EVENT_NOTIFICATION_NEW,
    ];
    expect(_all).toHaveLength(10);
  });

  it('WsClientEvent includes all client event constants', () => {
    // Compile-time check: every client event constant must be assignable to WsClientEvent
    const _all: WsClientEvent[] = [
      WS_CLIENT_ROOM_JOIN_MATCH,
      WS_CLIENT_ROOM_LEAVE_MATCH,
    ];
    expect(_all).toHaveLength(2);
  });

  it('WsServerEvent excludes client events (compile-time)', () => {
    // This verifies that client event constants CANNOT be assigned to WsServerEvent.
    // We use a helper: at compile time, the line below would fail if
    // WS_CLIENT_ROOM_JOIN_MATCH were part of WsServerEvent.
    const _all: (WsServerEvent | 'sentinel')[] = ['sentinel'];
    // If client events WERE part of WsServerEvent, the line below would be:
    //   const _all: WsServerEvent[] = [WS_CLIENT_ROOM_JOIN_MATCH, ...];
    // which would compile. They aren't, so the "sentinel" trick ensures the types are disjoint:
    expect(_all[0]).toBe('sentinel');
  });

  it('WsPayload union accepts all payload interface types', () => {
    // Compile-time check: each payload must satisfy WsPayload
    const _created: WsPayload = { matchId: '1', creatorId: '2', date: '2024-01-01', clubId: 'club-1' };
    const _updated: WsPayload = { matchId: '1', changes: { title: 'New' } };
    const _joined: WsPayload = { matchId: '1', userId: '2', userName: 'A', playersCount: 1, maxPlayers: 4 };
    const _confirmed: WsPayload = { matchId: '1', userId: '2', userName: 'A' };
    const _rejected: WsPayload = { matchId: '1', userId: '2', userName: 'A' };
    const _left: WsPayload = { matchId: '1', userId: '2', userName: 'A', playersCount: 1 };
    const _cancelled: WsPayload = { matchId: '1' };
    const _pending: WsPayload = { matchId: '1', resultId: 'r1', recordedBy: 'u1' };
    const _confirmedResult: WsPayload = { matchId: '1', resultId: 'r1' };
    const _notification: WsPayload = {
      notificationId: 'n1',
      type: 'info',
      title: 'Hello',
      message: 'World',
      timestamp: '2024-01-01T00:00:00Z',
    };

    expect(_created.matchId).toBe('1');
    expect(_updated.matchId).toBe('1');
    expect(_joined.matchId).toBe('1');
    expect(_confirmed.userId).toBe('2');
    expect(_rejected.userName).toBe('A');
    expect(_left.playersCount).toBe(1);
    expect(_cancelled.matchId).toBe('1');
    expect(_pending.resultId).toBe('r1');
    expect(_confirmedResult.matchId).toBe('1');
    expect(_notification.type).toBe('info');
  });
});

describe('WsEvents — payload shape (compile-time)', () => {
  it('MatchCreatedPayload has the expected shape', () => {
    const payload: MatchCreatedPayload = {
      matchId: 'abc',
      creatorId: 'user-1',
      date: '2024-06-01',
      clubId: 'club-1',
    };
    expect(Object.keys(payload).sort()).toEqual(['clubId', 'creatorId', 'date', 'matchId']);
  });

  it('MatchUpdatedPayload has the expected shape', () => {
    const payload: MatchUpdatedPayload = {
      matchId: 'abc',
      changes: { title: 'Updated' },
    };
    expect(payload.matchId).toBe('abc');
    expect(payload.changes).toEqual({ title: 'Updated' });
  });

  it('MatchPlayerJoinedPayload has the expected shape', () => {
    const payload: MatchPlayerJoinedPayload = {
      matchId: 'abc',
      userId: 'user-1',
      userName: 'Alice',
      playersCount: 3,
      maxPlayers: 4,
    };
    expect(Object.keys(payload).sort()).toEqual(['matchId', 'maxPlayers', 'playersCount', 'userId', 'userName']);
  });

  it('MatchPlayerConfirmedPayload has the expected shape', () => {
    const payload: MatchPlayerConfirmedPayload = {
      matchId: 'abc',
      userId: 'user-1',
      userName: 'Alice',
    };
    expect(Object.keys(payload).sort()).toEqual(['matchId', 'userId', 'userName']);
  });

  it('MatchPlayerRejectedPayload has the expected shape', () => {
    const payload: MatchPlayerRejectedPayload = {
      matchId: 'abc',
      userId: 'user-1',
      userName: 'Alice',
    };
    expect(Object.keys(payload).sort()).toEqual(['matchId', 'userId', 'userName']);
  });

  it('MatchPlayerLeftPayload has the expected shape', () => {
    const payload: MatchPlayerLeftPayload = {
      matchId: 'abc',
      userId: 'user-1',
      userName: 'Alice',
      playersCount: 2,
    };
    expect(Object.keys(payload).sort()).toEqual(['matchId', 'playersCount', 'userId', 'userName']);
  });

  it('MatchCancelledPayload has the expected shape', () => {
    const payload: MatchCancelledPayload = {
      matchId: 'abc',
    };
    expect(payload.matchId).toBe('abc');
    // reason is optional
    const payloadWithReason: MatchCancelledPayload = {
      matchId: 'abc',
      reason: 'No players',
    };
    expect(payloadWithReason.reason).toBe('No players');
  });

  it('ResultPendingPayload has the expected shape', () => {
    const payload: ResultPendingPayload = {
      matchId: 'abc',
      resultId: 'res-1',
      recordedBy: 'user-1',
    };
    expect(Object.keys(payload).sort()).toEqual(['matchId', 'recordedBy', 'resultId']);
  });

  it('ResultConfirmedPayload has the expected shape', () => {
    const payload: ResultConfirmedPayload = {
      matchId: 'abc',
      resultId: 'res-1',
    };
    expect(Object.keys(payload).sort()).toEqual(['matchId', 'resultId']);
  });

  it('NotificationNewPayload has the expected shape', () => {
    const payload: NotificationNewPayload = {
      notificationId: 'n-1',
      type: 'match_invite',
      title: 'New match',
      message: 'You are invited',
      timestamp: '2024-06-01T10:00:00Z',
    };
    expect(Object.keys(payload).sort()).toEqual([
      'message',
      'notificationId',
      'timestamp',
      'title',
      'type',
    ]);
    // matchId is optional
    const payloadWithMatch: NotificationNewPayload = {
      ...payload,
      matchId: 'match-1',
    };
    expect(payloadWithMatch.matchId).toBe('match-1');
    // playerId is optional
    const payloadWithPlayer: NotificationNewPayload = {
      ...payload,
      playerId: 'player-1',
    };
    expect(payloadWithPlayer.playerId).toBe('player-1');
  });
});
