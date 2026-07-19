import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

/**
 * Mismos códigos que UserLevel. UI (escala 1–7):
 * principiante 1.0–1.9 · medio 2.0–3.9 · avanzado 4.0–5.9 · pro 6.0–7.0
 */
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
