import { Club } from './club.entity';

export interface IClubRepository {
  save(club: Club): Promise<void>;
  findById(id: string): Promise<Club | null>;
  findAll(): Promise<Club[]>;
  findByName(name: string): Promise<Club | null>;
}
