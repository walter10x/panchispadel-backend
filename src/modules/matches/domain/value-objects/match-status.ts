import { ValueObject } from '../../../../shared/domain/value-object';
import { ValidationError } from '../../../../shared/domain/errors';

export const MATCH_STATUS_VALUES = [
  'abierto',
  'lleno',
  'completado',
  'cancelado',
] as const;

export type MatchStatusType = (typeof MATCH_STATUS_VALUES)[number];

export class MatchStatus extends ValueObject {
  private readonly value: MatchStatusType;

  private constructor(value: MatchStatusType) {
    super();
    this.value = value;
  }

  static create(value: string): MatchStatus {
    if (!isValidMatchStatus(value)) {
      throw new ValidationError(
        `Status inválido: ${value}. Valores permitidos: ${MATCH_STATUS_VALUES.join(', ')}`,
      );
    }
    return new MatchStatus(value);
  }

  static from(value: string): MatchStatus {
    return new MatchStatus(value as MatchStatusType);
  }

  getValue(): MatchStatusType {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  protected validate(): void {
    // validated in create()
  }
}

function isValidMatchStatus(value: string): value is MatchStatusType {
  return (MATCH_STATUS_VALUES as readonly string[]).includes(value);
}
