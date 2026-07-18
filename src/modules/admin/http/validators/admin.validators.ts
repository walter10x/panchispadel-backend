import { z } from 'zod';

export const createClubSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1).optional(),
  courtsCount: z.number().int().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateClubSchema = createClubSchema.partial();

export const updateUserRoleSchema = z.object({
  role: z.enum(['player', 'admin']),
});
