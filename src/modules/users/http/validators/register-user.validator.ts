import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  level: z
    .enum(['principiante', 'medio', 'avanzado', 'pro'])
    .optional(),
  phone: z.string().optional(),
});
