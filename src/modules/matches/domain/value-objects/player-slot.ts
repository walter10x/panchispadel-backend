import { ValidationError } from '../../../../shared/domain/errors';

export type PlayerSlotStatus = 'confirmado' | 'pendiente' | 'rechazado';

const VALID_STATUSES: PlayerSlotStatus[] = [
  'confirmado',
  'pendiente',
  'rechazado',
];

export interface PlayerSlotPlain {
  playerId: string;
  email: string;
  status: PlayerSlotStatus;
  joinedAt: string;
}

export class PlayerSlot {
  public readonly playerId: string;
  public readonly email: string;
  public readonly status: PlayerSlotStatus;
  public readonly joinedAt: Date;

  private constructor(
    playerId: string,
    email: string,
    status: PlayerSlotStatus,
    joinedAt: Date,
  ) {
    this.playerId = playerId;
    this.email = email;
    this.status = status;
    this.joinedAt = joinedAt;
  }

  static create(playerId: string, email: string): PlayerSlot {
    return new PlayerSlot(playerId, email, 'confirmado', new Date());
  }

  static createWithStatus(
    playerId: string,
    status: PlayerSlotStatus,
    email: string,
  ): PlayerSlot {
    if (!isValidSlotStatus(status)) {
      throw new ValidationError(
        `Status inválido: ${status}. Valores: ${VALID_STATUSES.join(', ')}`,
      );
    }
    return new PlayerSlot(playerId, email, status, new Date());
  }

  static reconstitute(data: {
    playerId: string;
    email: string;
    status: PlayerSlotStatus;
    joinedAt: Date;
  }): PlayerSlot {
    return new PlayerSlot(data.playerId, data.email, data.status, data.joinedAt);
  }

  equals(other: PlayerSlot): boolean {
    return (
      this.playerId === other.playerId && this.status === other.status
    );
  }

  toPlain(): PlayerSlotPlain {
    return {
      playerId: this.playerId,
      email: this.email,
      status: this.status,
      joinedAt: this.joinedAt.toISOString(),
    };
  }

  toString(): string {
    return `${this.playerId}:${this.email}:${this.status}`;
  }
}

function isValidSlotStatus(value: string): value is PlayerSlotStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}
