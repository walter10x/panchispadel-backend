import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

export type UserRoleType = 'player' | 'admin';

export const VALID_ROLES: readonly UserRoleType[] = ['player', 'admin'] as const;

export class UserRole extends ValueObject {
  private readonly _value: UserRoleType;

  private constructor(value: UserRoleType) {
    super();
    this._value = value;
  }

  static from(value: string): UserRole {
    if (!VALID_ROLES.includes(value as UserRoleType)) {
      const valid = VALID_ROLES.join(', ');
      throw new ValidationError(
        `Invalid role: "${value}". Valid roles: ${valid}`,
      );
    }
    return new UserRole(value as UserRoleType);
  }

  static player(): UserRole {
    return new UserRole('player');
  }

  static admin(): UserRole {
    return new UserRole('admin');
  }

  get value(): UserRoleType {
    return this._value;
  }

  get isAdmin(): boolean {
    return this._value === 'admin';
  }

  protected validate(): void {
    /* validated in static factory */
  }

  toString(): string {
    return this._value;
  }
}
