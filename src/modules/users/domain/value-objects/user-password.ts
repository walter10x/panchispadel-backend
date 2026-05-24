import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

export class UserPassword extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  static from(value: string): UserPassword {
    if (value.length < 8) {
      throw new ValidationError(
        'Password must be at least 8 characters',
      );
    }
    return new UserPassword(value);
  }

  get value(): string {
    return this._value;
  }

  protected validate(): void {
    /* validated in static factory */
  }

  toString(): string {
    return this._value;
  }
}
