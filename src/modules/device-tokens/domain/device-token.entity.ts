import { v4 as uuid } from 'uuid';

export type DevicePlatform = 'android' | 'ios';

export interface DeviceTokenCreateParams {
  userId: string;
  token: string;
  platform: DevicePlatform;
}

export interface DeviceTokenReconstituteParams {
  id: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
  createdAt: Date;
  updatedAt: Date;
}

export class DeviceToken {
  public readonly id: string;
  public readonly userId: string;
  public token: string;
  public readonly platform: DevicePlatform;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(
    id: string,
    userId: string,
    token: string,
    platform: DevicePlatform,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.platform = platform;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: DeviceTokenCreateParams): DeviceToken {
    const now = new Date();
    return new DeviceToken(uuid(), params.userId, params.token, params.platform, now, now);
  }

  static reconstitute(params: DeviceTokenReconstituteParams): DeviceToken {
    return new DeviceToken(
      params.id,
      params.userId,
      params.token,
      params.platform,
      params.createdAt,
      params.updatedAt,
    );
  }

  updateToken(token: string): void {
    this.token = token;
    this.updatedAt = new Date();
  }
}
