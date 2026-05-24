import { MatchLevel, VALID_MATCH_LEVELS } from './match-level';
import { ValidationError } from '../../../../shared/domain/errors';

describe('MatchLevel', () => {
  describe('from', () => {
    it('crea un MatchLevel válido para cada nivel permitido', () => {
      for (const level of VALID_MATCH_LEVELS) {
        const matchLevel = MatchLevel.from(level);
        expect(matchLevel.toString()).toBe(level);
      }
    });

    it('lanza ValidationError para un nivel inválido', () => {
      expect(() => MatchLevel.from('experto')).toThrow(ValidationError);
    });

    it('lanza ValidationError para string vacío', () => {
      expect(() => MatchLevel.from('')).toThrow(ValidationError);
    });
  });

  describe('default', () => {
    it('devuelve medio por defecto', () => {
      const matchLevel = MatchLevel.default();
      expect(matchLevel.toString()).toBe('medio');
    });
  });

  describe('value', () => {
    it('devuelve el valor correcto', () => {
      const matchLevel = MatchLevel.from('pro');
      expect(matchLevel.value).toBe('pro');
    });
  });

  describe('equals', () => {
    it('devuelve true para mismo nivel', () => {
      const a = MatchLevel.from('medio');
      const b = MatchLevel.from('medio');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para distintos niveles', () => {
      const a = MatchLevel.from('medio');
      const b = MatchLevel.from('avanzado');
      expect(a.equals(b)).toBe(false);
    });
  });
});
