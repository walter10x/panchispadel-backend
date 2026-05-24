import { PlayerSlot } from './player-slot';

describe('PlayerSlot value object', () => {
  describe('create', () => {
    it('crea PlayerSlot con estado confirmado por defecto', () => {
      const slot = PlayerSlot.create('player-1', 'player-1@test.com');
      expect(slot.playerId).toBe('player-1');
      expect(slot.email).toBe('player-1@test.com');
      expect(slot.status).toBe('confirmado');
      expect(slot.joinedAt).toBeInstanceOf(Date);
    });
  });

  describe('createWithStatus', () => {
    it('crea PlayerSlot con estado personalizado', () => {
      const slot = PlayerSlot.createWithStatus('player-2', 'pendiente', 'player-2@test.com');
      expect(slot.playerId).toBe('player-2');
      expect(slot.email).toBe('player-2@test.com');
      expect(slot.status).toBe('pendiente');
    });

    it('crea PlayerSlot con estado rechazado', () => {
      const slot = PlayerSlot.createWithStatus('player-3', 'rechazado', 'player-3@test.com');
      expect(slot.status).toBe('rechazado');
    });

    it('lanza error para estado inválido', () => {
      expect(() =>
        PlayerSlot.createWithStatus('player-4', 'invalido' as never, 'player-4@test.com'),
      ).toThrow();
    });
  });

  describe('reconstitute', () => {
    it('reconstruye desde datos persistidos', () => {
      const date = new Date('2024-06-01T10:00:00Z');
      const slot = PlayerSlot.reconstitute({
        playerId: 'player-1',
        email: 'player-1@test.com',
        status: 'pendiente',
        joinedAt: date,
      });
      expect(slot.playerId).toBe('player-1');
      expect(slot.email).toBe('player-1@test.com');
      expect(slot.status).toBe('pendiente');
      expect(slot.joinedAt).toBe(date);
    });
  });

  describe('equals', () => {
    it('devuelve true para mismo playerId y status', () => {
      const date = new Date('2024-06-01T10:00:00Z');
      const a = PlayerSlot.reconstitute({
        playerId: 'p1',
        email: 'p1@test.com',
        status: 'confirmado',
        joinedAt: date,
      });
      const b = PlayerSlot.reconstitute({
        playerId: 'p1',
        email: 'p1@test.com',
        status: 'confirmado',
        joinedAt: date,
      });
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para diferentes playerId', () => {
      const a = PlayerSlot.create('p1', 'p1@test.com');
      const b = PlayerSlot.create('p2', 'p2@test.com');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toPlain', () => {
    it('serializa a objeto plano', () => {
      const slot = PlayerSlot.create('player-1', 'player-1@test.com');
      const plain = slot.toPlain();
      expect(plain).toEqual({
        playerId: 'player-1',
        email: 'player-1@test.com',
        status: 'confirmado',
        joinedAt: expect.any(String),
      });
    });
  });

  describe('toString', () => {
    it('devuelve representación en string', () => {
      const slot = PlayerSlot.create('p1', 'p1@test.com');
      expect(slot.toString()).toContain('p1');
      expect(slot.toString()).toContain('p1@test.com');
      expect(slot.toString()).toContain('confirmado');
    });
  });
});
