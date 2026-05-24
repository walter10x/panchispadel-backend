import { Result } from './result.entity';
import { MatchScore } from './value-objects/match-score';

describe('Result entity', () => {
  const validParams = {
    matchId: '550e8400-e29b-41d4-a716-446655440000',
    registrarId: 'player-1',
    team1Score: 2,
    team2Score: 0,
  };

  describe('create', () => {
    it('creates a valid result with generated id', () => {
      const result = Result.create(validParams);

      expect(result.id).toBeDefined();
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.matchId).toBe(validParams.matchId);
      expect(result.team1Score).toBe(2);
      expect(result.team2Score).toBe(0);
      expect(result.confirmedBy).toEqual(['player-1']);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('starts with the registrar as the first confirmation', () => {
      const result = Result.create(validParams);

      expect(result.isConfirmedBy('player-1')).toBe(true);
    });

    it('throws when team1Score is negative', () => {
      expect(() =>
        Result.create({ ...validParams, team1Score: -1 }),
      ).toThrow();
    });

    it('throws when team2Score is negative', () => {
      expect(() =>
        Result.create({ ...validParams, team2Score: -1 }),
      ).toThrow();
    });

    it('throws when scores are equal (no ties in pádel)', () => {
      expect(() =>
        Result.create({ ...validParams, team1Score: 1, team2Score: 1 }),
      ).toThrow();
    });
  });

  describe('reconstitute', () => {
    it('restores a result from persisted data', () => {
      const createdAt = new Date('2024-01-15');
      const result = Result.reconstitute({
        id: 'existing-id-123',
        matchId: validParams.matchId,
        team1Score: 2,
        team2Score: 1,
        confirmedBy: ['player-1', 'player-2'],
        createdAt,
      });

      expect(result.id).toBe('existing-id-123');
      expect(result.team1Score).toBe(2);
      expect(result.team2Score).toBe(1);
      expect(result.confirmedBy).toEqual(['player-1', 'player-2']);
      expect(result.createdAt).toEqual(createdAt);
    });
  });

  describe('confirm', () => {
    it('adds a player to confirmedBy', () => {
      const result = Result.create(validParams);

      result.confirm('player-2');

      expect(result.confirmedBy).toContain('player-2');
    });

    it('does not add a duplicate player', () => {
      const result = Result.create(validParams);

      result.confirm('player-1');

      expect(result.confirmedBy).toEqual(['player-1']);
    });
  });

  describe('isConfirmedBy', () => {
    it('returns true for a confirmed player', () => {
      const result = Result.create(validParams);

      expect(result.isConfirmedBy('player-1')).toBe(true);
    });

    it('returns false for a non-confirmed player', () => {
      const result = Result.create(validParams);

      expect(result.isConfirmedBy('player-99')).toBe(false);
    });
  });

  describe('isFullyConfirmed', () => {
    it('returns false with only one confirmation', () => {
      const result = Result.create(validParams);

      expect(result.isFullyConfirmed).toBe(false);
    });

    it('returns true with two confirmations', () => {
      const result = Result.create(validParams);
      result.confirm('player-2');

      expect(result.isFullyConfirmed).toBe(true);
    });

    it('returns true with more than two confirmations', () => {
      const result = Result.create(validParams);
      result.confirm('player-2');
      result.confirm('player-3');

      expect(result.isFullyConfirmed).toBe(true);
    });
  });

  describe('MatchScore value object', () => {
    it('creates a valid MatchScore', () => {
      const score = new MatchScore({ team1Score: 6, team2Score: 4 });

      expect(score.team1Score).toBe(6);
      expect(score.team2Score).toBe(4);
    });

    it('rejects negative scores', () => {
      expect(() => new MatchScore({ team1Score: -1, team2Score: 4 })).toThrow();
    });

    it('rejects equal scores', () => {
      expect(() => new MatchScore({ team1Score: 3, team2Score: 3 })).toThrow();
    });

    it('toString returns formatted score', () => {
      const score = new MatchScore({ team1Score: 2, team2Score: 0 });

      expect(score.toString()).toBe('2-0');
    });

    it('equals returns true for same scores', () => {
      const a = new MatchScore({ team1Score: 2, team2Score: 1 });
      const b = new MatchScore({ team1Score: 2, team2Score: 1 });

      expect(a.equals(b)).toBe(true);
    });

    it('equals returns false for different scores', () => {
      const a = new MatchScore({ team1Score: 2, team2Score: 0 });
      const b = new MatchScore({ team1Score: 2, team2Score: 1 });

      expect(a.equals(b)).toBe(false);
    });
  });
});
