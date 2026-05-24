import { v4 as uuid } from 'uuid';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { ValidationError } from '../../../shared/domain/errors';
import { MatchStatus } from './value-objects/match-status';
import { PlayerSlot } from './value-objects/player-slot';
import { MatchLevel } from './value-objects/match-level';

export interface MatchCreateParams {
  creatorId: string;
  creatorEmail: string;
  clubId: string;
  dateTime: Date;
  title: string;
  durationMinutes?: number;
  maxPlayers?: number;
  level?: string;
}

export interface MatchReconstituteParams {
  id: string;
  creatorId: string;
  creatorEmail: string;
  clubId: string;
  dateTime: Date;
  title: string;
  durationMinutes: number;
  status: MatchStatus;
  maxPlayers: number;
  players: PlayerSlot[];
  createdAt: Date;
  level: string;
}

export class Match extends BaseEntity {
  public readonly creatorId: string;
  public readonly creatorEmail: string;
  public readonly clubId: string;
  public readonly dateTime: Date;
  public readonly title: string;
  public readonly durationMinutes: number;
  public readonly maxPlayers: number;
  public readonly level: string;
  private _status: MatchStatus;
  private _players: PlayerSlot[];

  private constructor(
    id: string,
    creatorId: string,
    creatorEmail: string,
    clubId: string,
    dateTime: Date,
    title: string,
    durationMinutes: number,
    maxPlayers: number,
    level: string,
    status: MatchStatus,
    players: PlayerSlot[],
    createdAt: Date,
  ) {
    super(id, createdAt);
    this.creatorId = creatorId;
    this.creatorEmail = creatorEmail;
    this.clubId = clubId;
    this.dateTime = dateTime;
    this.title = title;
    this.durationMinutes = durationMinutes;
    this.maxPlayers = maxPlayers;
    this.level = level;
    this._status = status;
    this._players = players;
  }

  static create(params: MatchCreateParams): Match {
    const durationMinutes = params.durationMinutes ?? 90;
    const maxPlayers = params.maxPlayers ?? 4;
    const level = params.level ?? MatchLevel.default().value;

    validateTitle(params.title);
    MatchLevel.from(level);
    validateMaxPlayers(maxPlayers);
    validateFutureDate(params.dateTime);

    const players = [PlayerSlot.create(params.creatorId, params.creatorEmail)];

    return new Match(
      uuid(),
      params.creatorId,
      params.creatorEmail,
      params.clubId,
      params.dateTime,
      params.title,
      durationMinutes,
      maxPlayers,
      level,
      MatchStatus.create('abierto'),
      players,
      new Date(),
    );
  }

  static reconstitute(params: MatchReconstituteParams): Match {
    return new Match(
      params.id,
      params.creatorId,
      params.creatorEmail,
      params.clubId,
      params.dateTime,
      params.title,
      params.durationMinutes,
      params.maxPlayers,
      params.level,
      params.status,
      params.players,
      params.createdAt,
    );
  }

  get status(): MatchStatus {
    return this._status;
  }

  get players(): ReadonlyArray<PlayerSlot> {
    return this._players;
  }

  get isFull(): boolean {
    return (
      this._players.filter((p) => p.status === 'confirmado').length >=
      this.maxPlayers
    );
  }

  join(playerId: string, email: string): void {
    if (this._players.some((p) => p.playerId === playerId)) {
      throw new ValidationError('El jugador ya está en el match');
    }

    if (this._players.length >= this.maxPlayers) {
      throw new ValidationError('Match está lleno');
    }

    if (this._status.getValue() !== 'abierto') {
      throw new ValidationError(
        'Match no está abierto para nuevos jugadores',
      );
    }

    this._players = [
      ...this._players,
      PlayerSlot.createWithStatus(playerId, 'pendiente', email),
    ];

    if (this._players.length >= this.maxPlayers) {
      this._status = MatchStatus.create('lleno');
    }
  }

  confirmPlayer(playerId: string): void {
    const index = this._players.findIndex(
      (p) => p.playerId === playerId,
    );
    if (index === -1) {
      throw new ValidationError('El jugador no está en el match');
    }
    if (this._players[index]!.status === 'confirmado') {
      throw new ValidationError('El jugador ya está confirmado');
    }
    if (
      this._status.getValue() !== 'abierto' &&
      this._status.getValue() !== 'lleno'
    ) {
      throw new ValidationError('El match no está activo');
    }

    const updated = [...this._players];
    updated[index] = PlayerSlot.createWithStatus(playerId, 'confirmado', this._players[index]!.email);
    this._players = updated;

    if (this._players.length >= this.maxPlayers) {
      this._status = MatchStatus.create('lleno');
    }
  }

  rejectPlayer(playerId: string): void {
    const index = this._players.findIndex(
      (p) => p.playerId === playerId,
    );
    if (index === -1) {
      throw new ValidationError('El jugador no está en el match');
    }
    if (this._players[index]!.status !== 'pendiente') {
      throw new ValidationError(
        'Solo se pueden rechazar jugadores pendientes',
      );
    }

    this._players = this._players.filter(
      (p) => p.playerId !== playerId,
    );
  }

  leave(playerId: string): void {
    if (!this._players.some((p) => p.playerId === playerId)) {
      throw new ValidationError('El jugador no está en el match');
    }

    if (playerId === this.creatorId) {
      throw new ValidationError(
        'El creador no puede salir del match, debe cancelarlo',
      );
    }

    this._players = this._players.filter(
      (p) => p.playerId !== playerId,
    );

    if (this._status.getValue() === 'lleno') {
      this._status = MatchStatus.create('abierto');
    }
  }

  cancel(playerId: string): void {
    if (playerId !== this.creatorId) {
      throw new ValidationError(
        'Solo el creador puede cancelar el match',
      );
    }

    this._status = MatchStatus.create('cancelado');
  }

  markAsCompleted(): void {
    this._status = MatchStatus.create('completado');
  }
}

function validateMaxPlayers(value: number): void {
  if (value < 2 || value > 4) {
    throw new ValidationError('maxPlayers debe estar entre 2 y 4');
  }
}

function validateTitle(value: string): void {
  if (value.trim().length === 0) {
    throw new ValidationError('Title is required');
  }
}

function validateFutureDate(date: Date): void {
  if (date <= new Date()) {
    throw new ValidationError('dateTime debe ser una fecha futura');
  }
}
