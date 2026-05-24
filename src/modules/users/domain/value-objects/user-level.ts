import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

export type UserLevelType = 'principiante' | 'medio' | 'avanzado' | 'pro';

export const VALID_LEVELS: readonly UserLevelType[] = [
  'principiante',
  'medio',
  'avanzado',
  'pro',
] as const;

export class UserLevel extends ValueObject {
  private readonly _value: UserLevelType;

  private constructor(value: UserLevelType) {
    super();
    this._value = value;
  }

  static from(value: string): UserLevel {
    if (!VALID_LEVELS.includes(value as UserLevelType)) {
      const valid = VALID_LEVELS.join(', ');
      throw new ValidationError(
        `Invalid level: "${value}". Valid levels: ${valid}`,
      );
    }
    return new UserLevel(value as UserLevelType);
  }

  static default(): UserLevel {
    return new UserLevel('principiante');
  }

  get value(): UserLevelType {
    return this._value;
  }

  protected validate(): void {
    /* validated in static factory */
  }

  toString(): string {
    return this._value;
  }
}
