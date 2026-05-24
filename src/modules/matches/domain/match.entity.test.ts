import { Match } from './match.entity';
import { MatchStatus } from './value-objects/match-status';
import { PlayerSlot } from './value-objects/player-slot';

const FUTURE_DATE = new Date(Date.now() + 86400000);
const PAST_DATE = new Date(Date.now() - 86400000);
const MATCH_TITLE = 'Partido de prueba';

describe('Match entity', () => {
  describe('create (factory)', () => {
    it('crea match con valores por defecto', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(match.creatorId).toBe('user-1');
      expect(match.clubId).toBe('club-1');
      expect(match.dateTime).toBe(FUTURE_DATE);
      expect(match.durationMinutes).toBe(90);
      expect(match.status.getValue()).toBe('abierto');
      expect(match.maxPlayers).toBe(4);
      expect(match.players).toHaveLength(1);
      expect(match.players[0]?.playerId).toBe('user-1');
      expect(match.players[0]?.status).toBe('confirmado');
      expect(match.id).toBeDefined();
      expect(match.createdAt).toBeInstanceOf(Date);
    });

    it('crea match con valores personalizados', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        durationMinutes: 60,
        maxPlayers: 2,
      });

      expect(match.durationMinutes).toBe(60);
      expect(match.maxPlayers).toBe(2);
    });

    it('lanza error si maxPlayers es menor a 2', () => {
      expect(() =>
        Match.create({
          creatorId: 'user-1',
          creatorEmail: 'creator@test.com',
          clubId: 'club-1',
          dateTime: FUTURE_DATE,
          title: MATCH_TITLE,
          maxPlayers: 1,
        }),
      ).toThrow('maxPlayers debe estar entre 2 y 4');
    });

    it('lanza error si maxPlayers es mayor a 4', () => {
      expect(() =>
        Match.create({
          creatorId: 'user-1',
          creatorEmail: 'creator@test.com',
          clubId: 'club-1',
          dateTime: FUTURE_DATE,
          title: MATCH_TITLE,
          maxPlayers: 5,
        }),
      ).toThrow('maxPlayers debe estar entre 2 y 4');
    });

    it('lanza error si dateTime está en el pasado', () => {
      expect(() =>
        Match.create({
          creatorId: 'user-1',
          creatorEmail: 'creator@test.com',
          clubId: 'club-1',
          dateTime: PAST_DATE,
          title: MATCH_TITLE,
        }),
      ).toThrow('dateTime debe ser una fecha futura');
    });

    it('asigna level por defecto medio si no se provee', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(match.level).toBe('medio');
    });

    it('asigna level personalizado cuando se provee', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        level: 'avanzado',
      });

      expect(match.level).toBe('avanzado');
    });

    it('lanza error si level es inválido', () => {
      expect(() =>
        Match.create({
          creatorId: 'user-1',
          creatorEmail: 'creator@test.com',
          clubId: 'club-1',
          dateTime: FUTURE_DATE,
          title: MATCH_TITLE,
          level: 'experto',
        }),
      ).toThrow('Invalid level');
    });
  });

  describe('title', () => {
    it('asigna title correctamente', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: 'Torneo de verano',
      });

      expect(match.title).toBe('Torneo de verano');
    });

    it('lanza error si title está vacío', () => {
      expect(() =>
        Match.create({
          creatorId: 'user-1',
          creatorEmail: 'creator@test.com',
          clubId: 'club-1',
          dateTime: FUTURE_DATE,
          title: '',
        }),
      ).toThrow('Title is required');
    });

    it('lanza error si title es solo espacios', () => {
      expect(() =>
        Match.create({
          creatorId: 'user-1',
          creatorEmail: 'creator@test.com',
          clubId: 'club-1',
          dateTime: FUTURE_DATE,
          title: '   ',
        }),
      ).toThrow('Title is required');
    });
  });

  describe('reconstitute', () => {
    it('reconstruye desde datos persistidos', () => {
      const players = [PlayerSlot.create('user-1', 'creator@test.com')];
      const match = Match.reconstitute({
        id: 'match-1',
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        durationMinutes: 90,
        status: MatchStatus.from('abierto'),
        maxPlayers: 4,
        level: 'medio',
        players,
        createdAt: new Date('2024-01-01'),
      });

      expect(match.id).toBe('match-1');
      expect(match.creatorId).toBe('user-1');
      expect(match.players).toHaveLength(1);
      expect(match.level).toBe('medio');
    });
  });

  describe('join', () => {
    it('agrega jugador como pendiente', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(match.players).toHaveLength(2);
      expect(match.players[1]?.playerId).toBe('user-2');
      expect(match.players[1]?.status).toBe('pendiente');
    });

    it('lanza error si el match está lleno', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(() => match.join('user-3', 'user-3@test.com')).toThrow('Match está lleno');
    });

    it('lanza error si el jugador ya está en el match', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.join('user-1', 'user-1@test.com')).toThrow(
        'El jugador ya está en el match',
      );
    });

    it('lanza error si el match no está abierto', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      match.cancel('user-1');
      expect(() => match.join('user-2', 'user-2@test.com')).toThrow(
        'Match no está abierto para nuevos jugadores',
      );
    });

    it('marca como lleno cuando se alcanza maxPlayers', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(match.status.getValue()).toBe('lleno');
    });
  });

  describe('confirmPlayer', () => {
    it('confirma un jugador pendiente', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 3,
      });

      match.join('user-2', 'user-2@test.com');
      match.confirmPlayer('user-2');
      expect(match.players[1]?.status).toBe('confirmado');
    });

    it('lanza error si el jugador no existe', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.confirmPlayer('user-99')).toThrow(
        'El jugador no está en el match',
      );
    });

    it('lanza error si el jugador ya está confirmado', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.confirmPlayer('user-1')).toThrow(
        'El jugador ya está confirmado',
      );
    });

    it('lanza error si el match no está activo', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      match.join('user-2', 'user-2@test.com');
      match.cancel('user-1');
      expect(() => match.confirmPlayer('user-2')).toThrow(
        'El match no está activo',
      );
    });

    it('marca como lleno cuando se confirma el último slot', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      match.confirmPlayer('user-2');
      expect(match.status.getValue()).toBe('lleno');
    });
  });

  describe('rejectPlayer', () => {
    it('rechaza un jugador pendiente y lo remueve', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(match.players).toHaveLength(2);

      match.rejectPlayer('user-2');
      expect(match.players).toHaveLength(1);
      expect(match.players[0]?.playerId).toBe('user-1');
    });

    it('lanza error si el jugador no existe', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.rejectPlayer('user-99')).toThrow(
        'El jugador no está en el match',
      );
    });

    it('lanza error si el jugador ya está confirmado', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.rejectPlayer('user-1')).toThrow(
        'Solo se pueden rechazar jugadores pendientes',
      );
    });
  });

  describe('leave', () => {
    it('remueve jugador del match', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 3,
      });

      match.join('user-2', 'user-2@test.com');
      match.leave('user-2');
      expect(match.players).toHaveLength(1);
      expect(match.players[0]?.playerId).toBe('user-1');
    });

    it('lanza error si el jugador no está en el match', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.leave('user-99')).toThrow(
        'El jugador no está en el match',
      );
    });

    it('lanza error si el creator intenta salir (debe cancelar)', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.leave('user-1')).toThrow(
        'El creador no puede salir del match, debe cancelarlo',
      );
    });

    it('vuelve a abierto si estaba lleno y alguien sale', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(match.status.getValue()).toBe('lleno');

      match.leave('user-2');
      expect(match.status.getValue()).toBe('abierto');
    });
  });

  describe('cancel', () => {
    it('cancela el match si es el creator', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      match.cancel('user-1');
      expect(match.status.getValue()).toBe('cancelado');
    });

    it('lanza error si no es el creator', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      expect(() => match.cancel('user-2')).toThrow(
        'Solo el creador puede cancelar el match',
      );
    });
  });

  describe('markAsCompleted', () => {
    it('marca el match como completado', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
      });

      match.markAsCompleted();
      expect(match.status.getValue()).toBe('completado');
    });
  });

  describe('isFull', () => {
    it('devuelve false si hay espacio', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 4,
      });

      expect(match.isFull).toBe(false);
    });

    it('devuelve true si los confirmados alcanzan maxPlayers', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(match.isFull).toBe(false);

      match.confirmPlayer('user-2');
      expect(match.isFull).toBe(true);
    });

    it('devuelve false si hay pendientes pero no confirmados', () => {
      const match = Match.create({
        creatorId: 'user-1',
        creatorEmail: 'creator@test.com',
        clubId: 'club-1',
        dateTime: FUTURE_DATE,
        title: MATCH_TITLE,
        maxPlayers: 2,
      });

      match.join('user-2', 'user-2@test.com');
      expect(match.isFull).toBe(false);
    });
  });
});
