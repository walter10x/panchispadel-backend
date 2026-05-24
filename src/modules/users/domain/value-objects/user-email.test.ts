import { UserEmail } from './user-email';
import { ValidationError } from '../../../../shared/domain/errors';

describe('UserEmail', () => {
  describe('from', () => {
    it('crea un UserEmail para un email válido', () => {
      const email = UserEmail.from('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });

    it('convierte a minúsculas', () => {
      const email = UserEmail.from('Test@Example.COM');
      expect(email.toString()).toBe('test@example.com');
    });

    it('elimina espacios alrededor', () => {
      const email = UserEmail.from('  user@test.com  ');
      expect(email.toString()).toBe('user@test.com');
    });

    it('lanza ValidationError para email sin @', () => {
      expect(() => UserEmail.from('invalid')).toThrow(ValidationError);
    });

    it('lanza ValidationError para email sin dominio', () => {
      expect(() => UserEmail.from('user@')).toThrow(ValidationError);
    });

    it('lanza ValidationError para email vacío', () => {
      expect(() => UserEmail.from('')).toThrow(ValidationError);
    });

    it('lanza ValidationError para email con espacios', () => {
      expect(() => UserEmail.from('user @test.com')).toThrow(ValidationError);
    });
  });

  describe('equals', () => {
    it('devuelve true para emails iguales', () => {
      const a = UserEmail.from('test@example.com');
      const b = UserEmail.from('test@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para emails distintos', () => {
      const a = UserEmail.from('test@example.com');
      const b = UserEmail.from('other@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('value', () => {
    it('devuelve el email en minúsculas', () => {
      const email = UserEmail.from('USER@EXAMPLE.COM');
      expect(email.value).toBe('user@example.com');
    });
  });
});
