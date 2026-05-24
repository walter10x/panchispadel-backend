export interface NotificationResponseDTO {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  matchId: string | undefined;
  createdAt: string;
}
