import { Notification } from './notification.entity';
import { NotificationType } from './value-objects/notification-type';

describe('Notification entity', () => {
  describe('create (factory)', () => {
    it('crea notificación con valores por defecto', () => {
      const notification = Notification.create({
        userId: 'user-1',
        type: NotificationType.create('match_created'),
        title: 'Nuevo partido',
        message: 'Se ha creado un nuevo partido',
      });

      expect(notification.userId).toBe('user-1');
      expect(notification.type.getValue()).toBe('match_created');
      expect(notification.title).toBe('Nuevo partido');
      expect(notification.message).toBe('Se ha creado un nuevo partido');
      expect(notification.read).toBe(false);
      expect(notification.matchId).toBeUndefined();
      expect(notification.id).toBeDefined();
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it('crea notificación con matchId opcional', () => {
      const notification = Notification.create({
        userId: 'user-1',
        type: NotificationType.create('player_joined'),
        title: 'Jugador unido',
        message: 'Un jugador se ha unido',
        matchId: 'match-123',
      });

      expect(notification.matchId).toBe('match-123');
    });
  });

  describe('reconstitute', () => {
    it('reconstruye desde datos persistidos', () => {
      const notification = Notification.reconstitute({
        id: 'notif-1',
        userId: 'user-1',
        type: NotificationType.create('match_cancelled'),
        title: 'Partido cancelado',
        message: 'El partido ha sido cancelado',
        read: true,
        matchId: 'match-1',
        createdAt: new Date('2024-01-01'),
      });

      expect(notification.id).toBe('notif-1');
      expect(notification.userId).toBe('user-1');
      expect(notification.read).toBe(true);
      expect(notification.matchId).toBe('match-1');
    });

    it('reconstruye sin matchId opcional', () => {
      const notification = Notification.reconstitute({
        id: 'notif-2',
        userId: 'user-2',
        type: NotificationType.create('result_confirmed'),
        title: 'Resultado confirmado',
        message: 'El resultado del partido ha sido confirmado',
        read: false,
        matchId: undefined,
        createdAt: new Date('2024-06-01'),
      });

      expect(notification.matchId).toBeUndefined();
    });
  });

  describe('markAsRead', () => {
    it('marca la notificación como leída', () => {
      const notification = Notification.create({
        userId: 'user-1',
        type: NotificationType.create('match_created'),
        title: 'Título',
        message: 'Mensaje',
      });

      expect(notification.read).toBe(false);
      notification.markAsRead();
      expect(notification.read).toBe(true);
    });

    it('no cambia el estado si ya está leída', () => {
      const notification = Notification.reconstitute({
        id: 'notif-3',
        userId: 'user-1',
        type: NotificationType.create('match_created'),
        title: 'Título',
        message: 'Mensaje',
        read: true,
        matchId: undefined,
        createdAt: new Date(),
      });

      notification.markAsRead();
      expect(notification.read).toBe(true);
    });
  });
});
