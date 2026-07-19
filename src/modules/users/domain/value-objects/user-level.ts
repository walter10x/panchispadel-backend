import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

/**
 * Códigos persistidos en API/BD (no cambiar sin migración).
 * Escala de pádel 1–7 (UI, rangos continuos sin huecos):
 *   principiante → 1.0–1.9 Iniciación
 *   medio        → 2.0–3.9 Intermedio
 *   avanzado     → 4.0–5.9 Avanzado
 *   pro          → 6.0–7.0 Profesional
 */
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
