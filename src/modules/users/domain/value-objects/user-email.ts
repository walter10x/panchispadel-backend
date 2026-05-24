import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserEmail extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  static from(value: string): UserEmail {
    const trimmed = value.trim().toLowerCase();

    if (trimmed.length === 0 || !EMAIL_REGEX.test(trimmed)) {
      throw new ValidationError('Invalid email format');
    }

    return new UserEmail(trimmed);
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
