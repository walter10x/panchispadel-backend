import { UserLevel, VALID_LEVELS } from './user-level';
import { ValidationError } from '../../../../shared/domain/errors';

describe('UserLevel', () => {
  describe('from', () => {
    it('crea un UserLevel válido para cada nivel permitido', () => {
      for (const level of VALID_LEVELS) {
        const userLevel = UserLevel.from(level);
        expect(userLevel.toString()).toBe(level);
      }
    });

    it('lanza ValidationError para un nivel inválido', () => {
      expect(() => UserLevel.from('experto')).toThrow(ValidationError);
    });

    it('lanza ValidationError para string vacío', () => {
      expect(() => UserLevel.from('')).toThrow(ValidationError);
    });
  });

  describe('default', () => {
    it('devuelve principiante por defecto', () => {
      const userLevel = UserLevel.default();
      expect(userLevel.toString()).toBe('principiante');
    });
  });

  describe('value', () => {
    it('devuelve el valor correcto', () => {
      const userLevel = UserLevel.from('pro');
      expect(userLevel.value).toBe('pro');
    });
  });

  describe('equals', () => {
    it('devuelve true para mismo nivel', () => {
      const a = UserLevel.from('medio');
      const b = UserLevel.from('medio');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para distintos niveles', () => {
      const a = UserLevel.from('medio');
      const b = UserLevel.from('avanzado');
      expect(a.equals(b)).toBe(false);
    });
  });
});
