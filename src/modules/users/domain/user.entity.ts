import { v4 } from 'uuid';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { UserEmail } from './value-objects/user-email';
import { UserLevel } from './value-objects/user-level';

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  name: string;
  level: string | undefined;
  photoUrl: string | undefined;
  phone: string | undefined;
}

export interface ReconstituteUserParams {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  level: string;
  photoUrl: string | undefined;
  phone: string | undefined;
  createdAt: Date;
}

export class User extends BaseEntity<string> {
  private _email: UserEmail;
  private _passwordHash: string;
  private _name: string;
  private _level: UserLevel;
  private _photoUrl: string | undefined;
  private _phone: string | undefined;

  private constructor(
    id: string,
    email: UserEmail,
    passwordHash: string,
    name: string,
    level: UserLevel,
    photoUrl: string | undefined,
    phone: string | undefined,
    createdAt?: Date,
  ) {
    super(id, createdAt);
    this._email = email;
    this._passwordHash = passwordHash;
    this._name = name;
    this._level = level;
    this._photoUrl = photoUrl;
    this._phone = phone;
  }

  static create(params: CreateUserParams): User {
    return new User(
      v4(),
      UserEmail.from(params.email),
      params.passwordHash,
      params.name,
      params.level !== undefined
        ? UserLevel.from(params.level)
        : UserLevel.default(),
      params.photoUrl,
      params.phone,
    );
  }

  static reconstitute(params: ReconstituteUserParams): User {
    return new User(
      params.id,
      UserEmail.from(params.email),
      params.passwordHash,
      params.name,
      UserLevel.from(params.level),
      params.photoUrl,
      params.phone,
      params.createdAt,
    );
  }

  get email(): UserEmail {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string {
    return this._name;
  }

  get level(): UserLevel {
    return this._level;
  }

  get photoUrl(): string | undefined {
    return this._photoUrl;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  updateProfile(name: string, level: string, photoUrl?: string): void {
    this._name = name;
    this._level = UserLevel.from(level);
    this._photoUrl = photoUrl;
  }

  updatePassword(newHash: string): void {
    this._passwordHash = newHash;
  }
}
