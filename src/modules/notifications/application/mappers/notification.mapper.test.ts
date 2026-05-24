import { NotificationMapper } from './notification.mapper';
import { Notification } from '../../domain/notification.entity';
import { NotificationType } from '../../domain/value-objects/notification-type';

describe('NotificationMapper', () => {
  describe('toResponse', () => {
    it('mapea entidad a response DTO', () => {
      const notification = Notification.reconstitute({
        id: 'notif-1',
        userId: 'user-1',
        type: NotificationType.from('player_joined'),
        title: 'Jugador unido',
        message: 'Un jugador se ha unido al partido',
        read: false,
        matchId: 'match-123',
        createdAt: new Date('2024-06-01T10:00:00.000Z'),
      });

      const dto = NotificationMapper.toResponse(notification);

      expect(dto.id).toBe('notif-1');
      expect(dto.userId).toBe('user-1');
      expect(dto.type).toBe('player_joined');
      expect(dto.title).toBe('Jugador unido');
      expect(dto.message).toBe('Un jugador se ha unido al partido');
      expect(dto.read).toBe(false);
      expect(dto.matchId).toBe('match-123');
      expect(dto.createdAt).toBe('2024-06-01T10:00:00.000Z');
    });

    it('mapea sin matchId opcional', () => {
      const notification = Notification.reconstitute({
        id: 'notif-2',
        userId: 'user-2',
        type: NotificationType.from('result_confirmed'),
        title: 'Resultado',
        message: 'Mensaje',
        read: true,
        matchId: undefined,
        createdAt: new Date(),
      });

      const dto = NotificationMapper.toResponse(notification);

      expect(dto.matchId).toBeUndefined();
    });
  });
});
