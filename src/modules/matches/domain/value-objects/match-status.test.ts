import { MatchStatus, MATCH_STATUS_VALUES } from './match-status';

describe('MatchStatus value object', () => {
  describe('create', () => {
    it('crea MatchStatus para valor válido', () => {
      const status = MatchStatus.create('abierto');
      expect(status.getValue()).toBe('abierto');
    });

    it('crea MatchStatus para "lleno"', () => {
      const status = MatchStatus.create('lleno');
      expect(status.getValue()).toBe('lleno');
    });

    it('crea MatchStatus para "completado"', () => {
      const status = MatchStatus.create('completado');
      expect(status.getValue()).toBe('completado');
    });

    it('crea MatchStatus para "cancelado"', () => {
      const status = MatchStatus.create('cancelado');
      expect(status.getValue()).toBe('cancelado');
    });

    it('lanza error para valor inválido', () => {
      expect(() => MatchStatus.create('invalido' as never)).toThrow();
    });
  });

  describe('from', () => {
    it('crea desde string sin validación', () => {
      const status = MatchStatus.from('abierto');
      expect(status.getValue()).toBe('abierto');
    });
  });

  describe('equals', () => {
    it('devuelve true para valores iguales', () => {
      const a = MatchStatus.create('abierto');
      const b = MatchStatus.create('abierto');
      expect(a.equals(b)).toBe(true);
    });

    it('devuelve false para valores diferentes', () => {
      const a = MatchStatus.create('abierto');
      const b = MatchStatus.create('lleno');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    it('devuelve el valor del status', () => {
      const status = MatchStatus.create('completado');
      expect(status.toString()).toBe('completado');
    });
  });

  describe('MATCH_STATUS_VALUES', () => {
    it('contiene los cuatro valores permitidos', () => {
      expect(MATCH_STATUS_VALUES).toEqual([
        'abierto',
        'lleno',
        'completado',
        'cancelado',
      ]);
    });
  });
});
