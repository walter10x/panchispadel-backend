import { Request, Response, NextFunction } from 'express';
import { RegisterDeviceTokenUseCase } from '../application/register-device-token.use-case';

export class DeviceTokenController {
  constructor(
    private readonly registerUseCase: RegisterDeviceTokenUseCase,
  ) {}

  async registerToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await this.registerUseCase.execute(userId, req.body);
      res.status(200).json({ message: 'Device token registered successfully' });
    } catch (error) {
      next(error);
    }
  }
}
