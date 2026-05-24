import { z } from 'zod';

export const createMatchSchema = z.object({
  clubId: z.string().uuid(),
  dateTime: z.string().datetime({ offset: true }).transform((val) => new Date(val)),
  title: z.string().min(1, 'Title is required'),
  durationMinutes: z.number().int().positive().optional(),
  maxPlayers: z.number().int().min(2).max(4).optional(),
  level: z.enum(['principiante', 'medio', 'avanzado', 'pro']).optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
