import { NotificationType, NOTIFICATION_TYPE_VALUES } from './notification-type';

describe('NotificationType value object', () => {
  describe('create', () => {
    it('crea NotificationType para match_created', () => {
      const sut = NotificationType.create('match_created');
      expect(sut.getValue()).toBe('match_created');
    });

    it('crea NotificationType para match_full', () => {
      const sut = NotificationType.create('match_full');
      expect(sut.getValue()).toBe('match_full');
    });

    it('crea NotificationType para match_cancelled', () => {
      const sut = NotificationType.create('match_cancelled');
      expect(sut.getValue()).toBe('match_cancelled');
    });

    it('crea NotificationType para result_pending', () => {
      const sut = NotificationType.create('result_pending');
      expect(sut.getValue()).toBe('result_pending');
    });

    it('crea NotificationType para result_confirmed', () => {
      const sut = NotificationType.create('result_confirmed');
      expect(sut.getValue()).toBe('result_confirmed');
    });

    it('crea NotificationType para player_joined', () => {
      const sut = NotificationType.create('player_joined');
      expect(sut.getValue()).toBe('player_joined');
    });

    it('crea NotificationType para player_left', () => {
      const sut = NotificationType.create('player_left');
      expect(sut.getValue()).toBe('player_left');
    });

    it('crea NotificationType para player_rejected', () => {
      const sut = NotificationType.create('player_rejected');
      expect(sut.getValue()).toBe('player_rejected');
    });

    it('lanza error para valor inválido', () => {
      expect(() => NotificationType.create('invalid_type' as never)).toThrow();
    });
  });

  describe('from', () => {
    it('crea desde string sin validación', () => {
      const sut = NotificationType.from('match_created');
      expect(sut.getValue()).toBe('match_created');
    });
  });

  describe('equals', () => {
    it('devuelve true para valores iguales', () => {
      const a = NotificationType.create('match_created');
      const b = NotificationType.create('match_created');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para valores diferentes', () => {
      const a = NotificationType.create('match_created');
      const b = NotificationType.create('match_full');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    it('devuelve el valor del tipo', () => {
      const sut = NotificationType.create('player_joined');
      expect(sut.toString()).toBe('player_joined');
    });
  });

  describe('NOTIFICATION_TYPE_VALUES', () => {
    it('contiene los ocho valores permitidos', () => {
      expect(NOTIFICATION_TYPE_VALUES).toEqual([
        'match_created',
        'match_full',
        'match_cancelled',
        'result_pending',
        'result_confirmed',
        'player_joined',
        'player_left',
        'player_rejected',
      ]);
    });
  });
});
