import { DeviceToken } from './device-token.entity';

export interface IDeviceTokenRepository {
  save(token: DeviceToken): Promise<void>;
  findByUser(userId: string): Promise<DeviceToken[]>;
  findByToken(token: string): Promise<DeviceToken | null>;
  delete(id: string): Promise<void>;
}
