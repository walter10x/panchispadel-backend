import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('results')
export class ResultOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  matchId!: string;

  @Column({ type: 'int' })
  team1Score!: number;

  @Column({ type: 'int' })
  team2Score!: number;

  @Column({ type: 'jsonb', default: [] })
  confirmedBy!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}
