import { Repository } from 'typeorm';
import { IDeviceTokenRepository } from '../domain/device-token.repository';
import { DeviceToken, DevicePlatform } from '../domain/device-token.entity';
import { DeviceTokenOrmEntity } from './device-token-orm.entity';

export class TypeOrmDeviceTokenRepository implements IDeviceTokenRepository {
  constructor(private readonly ormRepo: Repository<DeviceTokenOrmEntity>) {}

  async save(deviceToken: DeviceToken): Promise<void> {
    const orm = this.toOrm(deviceToken);
    await this.ormRepo.save(orm);
  }

  async findByUser(userId: string): Promise<DeviceToken[]> {
    const orms = await this.ormRepo.find({ where: { userId } });
    return orms.map((o) => this.toDomain(o));
  }

  async findByToken(token: string): Promise<DeviceToken | null> {
    const orm = await this.ormRepo.findOne({ where: { token } });
    if (orm === null) {
      return null;
    }
    return this.toDomain(orm);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  private toOrm(domain: DeviceToken): DeviceTokenOrmEntity {
    const orm = new DeviceTokenOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.token = domain.token;
    orm.platform = domain.platform;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  private toDomain(orm: DeviceTokenOrmEntity): DeviceToken {
    return DeviceToken.reconstitute({
      id: orm.id,
      userId: orm.userId,
      token: orm.token,
      platform: orm.platform as DevicePlatform,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }
}
