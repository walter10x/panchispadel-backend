export interface ResultResponseDTO {
  id: string;
  matchId: string;
  team1Score: number;
  team2Score: number;
  confirmedBy: string[];
  isFullyConfirmed: boolean;
  createdAt: Date;
}
