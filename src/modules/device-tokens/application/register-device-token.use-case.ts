import { IDeviceTokenRepository } from '../domain/device-token.repository';
import { DeviceToken } from '../domain/device-token.entity';
import { RegisterDeviceTokenDTO } from './dtos/register-device-token.dto';

export class RegisterDeviceTokenUseCase {
  constructor(private readonly repo: IDeviceTokenRepository) {}

  async execute(userId: string, dto: RegisterDeviceTokenDTO): Promise<void> {
    const existing = await this.repo.findByToken(dto.token);

    if (existing !== null) {
      if (existing.userId === userId) {
        existing.updateToken(dto.token);
        await this.repo.save(existing);
        return;
      }

      await this.repo.delete(existing.id);
    }

    const deviceToken = DeviceToken.create({
      userId,
      token: dto.token,
      platform: dto.platform,
    });

    await this.repo.save(deviceToken);
  }
}
