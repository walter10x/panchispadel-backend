import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';

@Entity('notifications')
export class NotificationOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'uuid', name: 'match_id', nullable: true })
  matchId!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'player_name', nullable: true })
  playerName!: string | null;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Column({ type: 'timestamp', name: 'created_at', default: () => 'NOW()' })
  createdAt!: Date;
}
