import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

export type MatchLevelType =
  | 'principiante'
  | 'medio'
  | 'avanzado'
  | 'pro';

export const VALID_MATCH_LEVELS: readonly MatchLevelType[] = [
  'principiante',
  'medio',
  'avanzado',
  'pro',
] as const;

export class MatchLevel extends ValueObject {
  private readonly _value: MatchLevelType;

  private constructor(value: MatchLevelType) {
    super();
    this._value = value;
  }

  static from(value: string): MatchLevel {
    if (!VALID_MATCH_LEVELS.includes(value as MatchLevelType)) {
      const valid = VALID_MATCH_LEVELS.join(', ');
      throw new ValidationError(
        `Invalid level: "${value}". Valid levels: ${valid}`,
      );
    }
    return new MatchLevel(value as MatchLevelType);
  }

  static default(): MatchLevel {
    return new MatchLevel('medio');
  }

  get value(): MatchLevelType {
    return this._value;
  }

  protected validate(): void {
    /* validated in static factory */
  }

  toString(): string {
    return this._value;
  }
}
