import { z } from 'zod';
import { createMatchSchema } from './create-match.validator';

export const updateMatchSchema = createMatchSchema.partial();

export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
