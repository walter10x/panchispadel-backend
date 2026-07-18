import { User } from '../../domain/user.entity';
import { UserMapper } from './user.mapper';
import { UserOrmEntity } from '../../infrastructure/user-orm.entity';

describe('UserMapper', () => {
  const user = User.create({
    email: 'test@example.com',
    passwordHash: '$2a$10$hash',
    name: 'Test User',
    level: 'medio',
    photoUrl: undefined,
    phone: undefined,
  });

  describe('toResponse', () => {
    it('mapea User a UserResponseDTO', () => {
      const dto = UserMapper.toResponse(user);

      expect(dto.id).toBe(user.id);
      expect(dto.email).toBe('test@example.com');
      expect(dto.name).toBe('Test User');
      expect(dto.level).toBe('medio');
      expect(dto.role).toBe('player');
      expect(dto.createdAt).toBe(user.createdAt);
    });

    it('incluye photoUrl cuando está presente', () => {
      const userWithPhoto = User.create({
        email: 'photo@example.com',
        passwordHash: 'hash',
        name: 'Photo User',
        level: 'pro',
        photoUrl: 'https://example.com/photo.jpg',
        phone: undefined,
      });

      const dto = UserMapper.toResponse(userWithPhoto);

      expect(dto.photoUrl).toBe('https://example.com/photo.jpg');
    });

    it('no incluye photoUrl cuando es undefined', () => {
      const dto = UserMapper.toResponse(user);

      expect(dto.photoUrl).toBeUndefined();
    });

    it('incluye phone en la respuesta', () => {
      const userWithPhone = User.create({
        email: 'phone@example.com',
        passwordHash: 'hash',
        name: 'Phone User',
        level: 'medio',
        photoUrl: undefined,
        phone: '+541155512345',
      });

      const dto = UserMapper.toResponse(userWithPhone);

      expect(dto.phone).toBe('+541155512345');
    });

    it('no incluye phone cuando es undefined', () => {
      const dto = UserMapper.toResponse(user);

      expect(dto.phone).toBeUndefined();
    });
  });

  describe('toOrmEntity', () => {
    it('mapea User a UserOrmEntity', () => {
      const orm = UserMapper.toOrmEntity(user);

      expect(orm).toBeInstanceOf(UserOrmEntity);
      expect(orm.id).toBe(user.id);
      expect(orm.email).toBe('test@example.com');
      expect(orm.passwordHash).toBe(user.passwordHash);
      expect(orm.name).toBe('Test User');
      expect(orm.level).toBe('medio');
      expect(orm.role).toBe('player');
      expect(orm.photoUrl).toBeNull();
      expect(orm.phone).toBeNull();
      expect(orm.createdAt).toBe(user.createdAt);
    });

    it('mapea photoUrl correctamente', () => {
      const userWithPhoto = User.create({
        email: 'photo@example.com',
        passwordHash: 'hash',
        name: 'Photo',
        level: 'pro',
        photoUrl: 'https://example.com/p.jpg',
        phone: undefined,
      });

      const orm = UserMapper.toOrmEntity(userWithPhoto);

      expect(orm.photoUrl).toBe('https://example.com/p.jpg');
    });
  });

  describe('toDomain', () => {
    it('reconstruye User desde UserOrmEntity', () => {
      const createdAt = new Date('2024-06-15');
      const orm = new UserOrmEntity();
      orm.id = '550e8400-e29b-41d4-a716-446655440000';
      orm.email = 'domain@example.com';
      orm.passwordHash = '$2a$10$hashed';
      orm.name = 'Domain User';
      orm.level = 'avanzado';
      orm.role = 'admin';
      orm.photoUrl = 'https://example.com/photo.jpg';
      orm.phone = '+541111111111';
      orm.createdAt = createdAt;

      const domain = UserMapper.toDomain(orm);

      expect(domain.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(domain.email.toString()).toBe('domain@example.com');
      expect(domain.passwordHash).toBe('$2a$10$hashed');
      expect(domain.name).toBe('Domain User');
      expect(domain.level.toString()).toBe('avanzado');
      expect(domain.role.toString()).toBe('admin');
      expect(domain.photoUrl).toBe('https://example.com/photo.jpg');
      expect(domain.phone).toBe('+541111111111');
      expect(domain.createdAt).toEqual(createdAt);
    });

    it('reconstruye con photoUrl null como undefined', () => {
      const orm = new UserOrmEntity();
      orm.id = '550e8400-e29b-41d4-a716-446655440000';
      orm.email = 'test@example.com';
      orm.passwordHash = 'hash';
      orm.name = 'Test';
      orm.level = 'principiante';
      orm.role = 'player';
      orm.photoUrl = null;
      orm.phone = null;
      orm.createdAt = new Date();

      const domain = UserMapper.toDomain(orm);

      expect(domain.photoUrl).toBeUndefined();
      expect(domain.phone).toBeUndefined();
    });
  });
});
