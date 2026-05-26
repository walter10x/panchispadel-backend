import { INotificationService } from '../domain/notification-service';
import { CreateNotificationUseCase } from '../../notifications/application/create-notification.use-case';

export class NotificationServiceImpl implements INotificationService {
  constructor(
    private readonly createNotification: CreateNotificationUseCase,
  ) {}

  async notifyPlayerJoined(
    matchId: string,
    creatorId: string,
    playerName: string,
    playerId?: string,
  ): Promise<void> {
    await this.createNotification.execute({
      userId: creatorId,
      type: 'player_joined',
      title: 'Nuevo jugador',
      message: `${playerName} se ha unido a tu partido`,
      matchId,
      playerId,
      playerName,
    });
  }

  async notifyPlayerLeft(
    matchId: string,
    creatorId: string,
    playerName: string,
  ): Promise<void> {
    await this.createNotification.execute({
      userId: creatorId,
      type: 'player_left',
      title: 'Jugador salió',
      message: `${playerName} ha salido del partido`,
      matchId,
      playerName,
    });
  }

  async notifyMatchCancelled(
    matchId: string,
    playerIds: string[],
    creatorName: string,
  ): Promise<void> {
    for (const userId of playerIds) {
      await this.createNotification.execute({
        userId,
        type: 'match_cancelled',
        title: 'Partido cancelado',
        message: `${creatorName} ha cancelado el partido`,
        matchId,
        playerName: creatorName,
      });
    }
  }

  async notifyMatchCreated(
    matchId: string,
    creatorId: string,
  ): Promise<void> {
    await this.createNotification.execute({
      userId: creatorId,
      type: 'match_created',
      title: 'Partido creado',
      message: 'Tu partido ha sido creado exitosamente',
      matchId,
    });
  }

  async notifyMatchFull(
    matchId: string,
    creatorId: string,
  ): Promise<void> {
    await this.createNotification.execute({
      userId: creatorId,
      type: 'match_full',
      title: 'Partido completo',
      message: 'Tu partido está completo',
      matchId,
    });
  }

  async notifyPlayerConfirmed(
    matchId: string,
    playerId: string,
    playerName: string,
    otherPlayerIds: string[],
  ): Promise<void> {
    // Notify confirmed player
    await this.createNotification.execute({
      userId: playerId,
      type: 'player_joined',
      title: 'Confirmado',
      message: `${playerName} ha sido confirmado en el partido`,
      matchId,
      playerName,
    });

    // Notify other confirmed players
    for (const userId of otherPlayerIds) {
      if (userId !== playerId) {
        await this.createNotification.execute({
          userId,
          type: 'player_joined',
          title: 'Nuevo jugador',
          message: `${playerName} se ha unido al partido`,
          matchId,
          playerName,
        });
      }
    }
  }

  async notifyPlayerRejected(
    matchId: string,
    playerId: string,
    playerName: string,
  ): Promise<void> {
    await this.createNotification.execute({
      userId: playerId,
      type: 'player_rejected',
      title: 'Rechazado',
      message: `${playerName} no ha sido aceptado en el partido`,
      matchId,
      playerName,
    });
  }
}
