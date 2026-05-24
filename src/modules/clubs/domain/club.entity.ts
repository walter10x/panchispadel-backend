import { v4 as uuid } from 'uuid';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { ValidationError } from '../../../shared/domain/errors';

export interface CreateClubParams {
  name: string;
  address: string;
  phone?: string;
  courtsCount: number;
  latitude?: number;
  longitude?: number;
}

export interface ReconstituteClubParams {
  id: string;
  name: string;
  address: string;
  phone?: string;
  courtsCount: number;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}

export class Club extends BaseEntity<string> {
  public readonly name: string;
  public readonly address: string;
  public readonly phone: string | undefined;
  public readonly courtsCount: number;
  public readonly latitude: number | undefined;
  public readonly longitude: number | undefined;

  private constructor(
    id: string,
    name: string,
    address: string,
    courtsCount: number,
    phone: string | undefined,
    latitude: number | undefined,
    longitude: number | undefined,
    createdAt: Date,
  ) {
    super(id, createdAt);
    this.name = name;
    this.address = address;
    this.courtsCount = courtsCount;
    this.phone = phone;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static create(params: CreateClubParams): Club {
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError('El nombre del club es obligatorio');
    }
    if (!Number.isInteger(params.courtsCount) || params.courtsCount < 1) {
      throw new ValidationError('La cantidad de pistas debe ser al menos 1');
    }

    return new Club(
      uuid(),
      params.name.trim(),
      params.address,
      params.courtsCount,
      params.phone,
      params.latitude,
      params.longitude,
      new Date(),
    );
  }

  static reconstitute(params: ReconstituteClubParams): Club {
    return new Club(
      params.id,
      params.name,
      params.address,
      params.courtsCount,
      params.phone,
      params.latitude,
      params.longitude,
      params.createdAt,
    );
  }
}
