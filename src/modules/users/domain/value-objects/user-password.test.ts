import { UserPassword } from './user-password';
import { ValidationError } from '../../../../shared/domain/errors';

describe('UserPassword', () => {
  describe('from', () => {
    it('crea un UserPassword para contraseña de 8 caracteres', () => {
      const password = UserPassword.from('12345678');
      expect(password.toString()).toBe('12345678');
    });

    it('crea un UserPassword para contraseña larga', () => {
      const password = UserPassword.from('supersecretpassword123');
      expect(password.toString()).toBe('supersecretpassword123');
    });

    it('lanza ValidationError para contraseña de 7 caracteres', () => {
      expect(() => UserPassword.from('1234567')).toThrow(ValidationError);
    });

    it('lanza ValidationError para contraseña vacía', () => {
      expect(() => UserPassword.from('')).toThrow(ValidationError);
    });
  });

  describe('value', () => {
    it('devuelve la contraseña sin modificar', () => {
      const password = UserPassword.from('miPasswordSegura');
      expect(password.value).toBe('miPasswordSegura');
    });
  });

  describe('equals', () => {
    it('devuelve true para contraseñas iguales', () => {
      const a = UserPassword.from('password123');
      const b = UserPassword.from('password123');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para contraseñas distintas', () => {
      const a = UserPassword.from('password123');
      const b = UserPassword.from('different456');
      expect(a.equals(b)).toBe(false);
    });
  });
});
