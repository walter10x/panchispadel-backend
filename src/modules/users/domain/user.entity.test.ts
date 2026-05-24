import { User } from './user.entity';
import { ValidationError } from '../../../shared/domain/errors';

describe('User', () => {
  const validParams = {
    email: 'test@example.com',
    passwordHash: '$2a$10$hashedpasswordvalue',
    name: 'Test User',
    level: 'medio',
    photoUrl: undefined,
    phone: undefined,
  };

  describe('create', () => {
    it('crea un usuario con todos los parámetros', () => {
      const user = User.create(validParams);

      expect(user.id).toBeDefined();
      expect(user.email.toString()).toBe('test@example.com');
      expect(user.passwordHash).toBe(validParams.passwordHash);
      expect(user.name).toBe('Test User');
      expect(user.level.toString()).toBe('medio');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('usa principiante como nivel por defecto', () => {
      const user = User.create({
        email: 'test@example.com',
        passwordHash: '$2a$10$hash',
        name: 'Test User',
        level: undefined,
        photoUrl: undefined,
        phone: undefined,
      });

      expect(user.level.toString()).toBe('principiante');
    });

    it('lanza ValidationError para email inválido', () => {
      expect(() =>
        User.create({ ...validParams, email: 'invalido' }),
      ).toThrow(ValidationError);
    });

    it('lanza ValidationError para nivel inválido', () => {
      expect(() =>
        User.create({ ...validParams, level: 'experto' }),
      ).toThrow(ValidationError);
    });

    it('crea un usuario con phone', () => {
      const user = User.create({
        ...validParams,
        phone: '+541155512345',
      });

      expect(user.phone).toBe('+541155512345');
    });

    it('crea un usuario sin phone', () => {
      const user = User.create(validParams);

      expect(user.phone).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('reconstruye un usuario desde persistencia', () => {
      const createdAt = new Date('2024-01-01');
      const user = User.reconstitute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'existing@example.com',
        passwordHash: '$2a$10$hashedvalue',
        name: 'Existing User',
        level: 'avanzado',
        photoUrl: 'https://example.com/photo.jpg',
        phone: '+541112345678',
        createdAt,
      });

      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.email.toString()).toBe('existing@example.com');
      expect(user.passwordHash).toBe('$2a$10$hashedvalue');
      expect(user.name).toBe('Existing User');
      expect(user.level.toString()).toBe('avanzado');
      expect(user.photoUrl).toBe('https://example.com/photo.jpg');
      expect(user.phone).toBe('+541112345678');
      expect(user.createdAt).toEqual(createdAt);
    });

    it('reconstruye sin photoUrl', () => {
      const user = User.reconstitute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test',
        level: 'principiante',
        photoUrl: undefined,
        phone: undefined,
        createdAt: new Date(),
      });

      expect(user.photoUrl).toBeUndefined();
    });

    it('reconstruye sin phone', () => {
      const user = User.reconstitute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test',
        level: 'principiante',
        photoUrl: undefined,
        phone: undefined,
        createdAt: new Date(),
      });

      expect(user.phone).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('actualiza nombre, nivel y foto', () => {
      const user = User.create(validParams);

      user.updateProfile('New Name', 'pro', 'https://example.com/new.jpg');

      expect(user.name).toBe('New Name');
      expect(user.level.toString()).toBe('pro');
      expect(user.photoUrl).toBe('https://example.com/new.jpg');
    });

    it('actualiza sin photoUrl', () => {
      const user = User.create(validParams);
      user.updateProfile('New Name', 'medio');
      expect(user.name).toBe('New Name');
      expect(user.level.toString()).toBe('medio');
    });

    it('lanza ValidationError para nivel inválido', () => {
      const user = User.create(validParams);
      expect(() => user.updateProfile('Name', 'invalido')).toThrow(
        ValidationError,
      );
    });
  });

  describe('updatePassword', () => {
    it('actualiza el hash de la contraseña', () => {
      const user = User.create(validParams);
      const newHash = '$2a$10$newhashedvalue';

      user.updatePassword(newHash);

      expect(user.passwordHash).toBe(newHash);
    });
  });

  describe('equals', () => {
    it('devuelve true para el mismo usuario', () => {
      const user = User.create(validParams);
      expect(user.equals(user)).toBe(true);
    });

    it('devuelve false para usuarios distintos', () => {
      const a = User.create(validParams);
      const b = User.create(validParams);
      expect(a.equals(b)).toBe(false);
    });
  });
});
