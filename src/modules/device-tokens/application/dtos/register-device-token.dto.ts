import { z } from 'zod';

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  platform: z.enum(['android', 'ios'], {
    errorMap: () => ({ message: 'Platform must be android or ios' }),
  }),
});

export type RegisterDeviceTokenDTO = z.infer<typeof registerDeviceTokenSchema>;
