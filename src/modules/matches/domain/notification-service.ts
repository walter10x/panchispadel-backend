export interface INotificationService {
  notifyPlayerJoined(
    matchId: string,
    creatorId: string,
    playerName: string,
    playerId?: string,
  ): Promise<void>;

  notifyPlayerLeft(
    matchId: string,
    creatorId: string,
    playerName: string,
  ): Promise<void>;

  notifyMatchCancelled(
    matchId: string,
    playerIds: string[],
    creatorName: string,
  ): Promise<void>;

  notifyMatchCreated(
    matchId: string,
    creatorId: string,
  ): Promise<void>;

  notifyMatchFull(
    matchId: string,
    creatorId: string,
  ): Promise<void>;

  notifyPlayerConfirmed(
    matchId: string,
    playerId: string,
    playerName: string,
    otherPlayerIds: string[],
  ): Promise<void>;

  notifyPlayerRejected(
    matchId: string,
    playerId: string,
    playerName: string,
  ): Promise<void>;
}
