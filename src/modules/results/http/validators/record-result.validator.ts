import { z } from 'zod';

export const recordResultSchema = z.object({
  matchId: z.string().uuid('matchId must be a valid UUID'),
  team1Score: z.number().int().min(0, 'team1Score must be >= 0'),
  team2Score: z.number().int().min(0, 'team2Score must be >= 0'),
});
