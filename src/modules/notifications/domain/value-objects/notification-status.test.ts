import { NotificationStatus, NOTIFICATION_STATUS_VALUES } from './notification-status';

describe('NotificationStatus value object', () => {
  describe('create', () => {
    it('crea NotificationStatus para unread', () => {
      const sut = NotificationStatus.create('unread');
      expect(sut.getValue()).toBe('unread');
    });

    it('crea NotificationStatus para read', () => {
      const sut = NotificationStatus.create('read');
      expect(sut.getValue()).toBe('read');
    });

    it('lanza error para valor inválido', () => {
      expect(() => NotificationStatus.create('deleted' as never)).toThrow();
    });
  });

  describe('from', () => {
    it('crea desde string sin validación', () => {
      const sut = NotificationStatus.from('unread');
      expect(sut.getValue()).toBe('unread');
    });
  });

  describe('equals', () => {
    it('devuelve true para valores iguales', () => {
      const a = NotificationStatus.create('unread');
      const b = NotificationStatus.create('unread');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para valores diferentes', () => {
      const a = NotificationStatus.create('unread');
      const b = NotificationStatus.create('read');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('isRead', () => {
    it('devuelve false para unread', () => {
      const sut = NotificationStatus.create('unread');
      expect(sut.isRead()).toBe(false);
    });

    it('devuelve true para read', () => {
      const sut = NotificationStatus.create('read');
      expect(sut.isRead()).toBe(true);
    });
  });

  describe('toString', () => {
    it('devuelve el valor del status', () => {
      const sut = NotificationStatus.create('read');
      expect(sut.toString()).toBe('read');
    });
  });

  describe('NOTIFICATION_STATUS_VALUES', () => {
    it('contiene los dos valores permitidos', () => {
      expect(NOTIFICATION_STATUS_VALUES).toEqual(['unread', 'read']);
    });
  });
});
