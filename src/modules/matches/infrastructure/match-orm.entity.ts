import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';

@Entity('matches')
export class MatchOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @Column({ type: 'varchar', length: 255 })
  creatorEmail!: string;

  @Column({ type: 'uuid' })
  clubId!: string;

  @Column({ type: 'timestamp' })
  dateTime!: Date;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'int', default: 90 })
  durationMinutes!: number;

  @Column({ type: 'varchar', length: 20, default: 'abierto' })
  status!: string;

  @Column({ type: 'int', default: 4 })
  maxPlayers!: number;

  @Column({ type: 'varchar', length: 20, default: 'medio' })
  level!: string;

  @Column({ type: 'jsonb', default: '[]' })
  players!: string;

  @Column({ type: 'timestamp' })
  createdAt!: Date;
}
