import { Club } from './club.entity';

describe('Club entity', () => {
  describe('create (factory)', () => {
    it('crea un club con datos válidos', () => {
      const club = Club.create({
        name: 'Logroño Pádel Indoor',
        address: 'Calle de la Cultura, 15, Logroño',
        courtsCount: 4,
      });

      expect(club.name).toBe('Logroño Pádel Indoor');
      expect(club.address).toBe('Calle de la Cultura, 15, Logroño');
      expect(club.courtsCount).toBe(4);
      expect(club.id).toBeDefined();
      expect(club.createdAt).toBeInstanceOf(Date);
    });

    it('crea un club con campos opcionales', () => {
      const club = Club.create({
        name: 'Rioja Pádel Center',
        address: 'Av. de la Paz, 42, Logroño',
        phone: '941 234 567',
        courtsCount: 6,
        latitude: 42.4627,
        longitude: -2.4453,
      });

      expect(club.phone).toBe('941 234 567');
      expect(club.latitude).toBe(42.4627);
      expect(club.longitude).toBe(-2.4453);
    });

    it('lanza error si el nombre está vacío', () => {
      expect(() =>
        Club.create({
          name: '',
          address: 'Calle Test, 1, Logroño',
          courtsCount: 2,
        }),
      ).toThrow('El nombre del club es obligatorio');
    });

    it('lanza error si courtsCount es 0', () => {
      expect(() =>
        Club.create({
          name: 'Club Test',
          address: 'Calle Test, 1, Logroño',
          courtsCount: 0,
        }),
      ).toThrow('La cantidad de pistas debe ser al menos 1');
    });

    it('lanza error si courtsCount es negativo', () => {
      expect(() =>
        Club.create({
          name: 'Club Test',
          address: 'Calle Test, 1, Logroño',
          courtsCount: -1,
        }),
      ).toThrow('La cantidad de pistas debe ser al menos 1');
    });
  });

  describe('reconstitute', () => {
    it('reconstruye desde datos persistidos', () => {
      const createdAt = new Date('2024-01-01');
      const club = Club.reconstitute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Logroño Pádel Indoor',
        address: 'Calle de la Cultura, 15, Logroño',
        phone: '941 123 456',
        courtsCount: 4,
        latitude: 42.4627,
        longitude: -2.4453,
        createdAt,
      });

      expect(club.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(club.name).toBe('Logroño Pádel Indoor');
      expect(club.phone).toBe('941 123 456');
      expect(club.createdAt).toBe(createdAt);
    });
  });

  describe('equals', () => {
    it('devuelve true para clubs con el mismo id', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const club1 = Club.reconstitute({
        id,
        name: 'Club A',
        address: 'Addr',
        courtsCount: 2,
        createdAt: new Date(),
      });
      const club2 = Club.reconstitute({
        id,
        name: 'Club B',
        address: 'Addr 2',
        courtsCount: 3,
        createdAt: new Date(),
      });

      expect(club1.equals(club2)).toBe(true);
    });

    it('devuelve false para clubs con ids diferentes', () => {
      const club1 = Club.reconstitute({
        id: 'id-1',
        name: 'Club A',
        address: 'Addr',
        courtsCount: 2,
        createdAt: new Date(),
      });
      const club2 = Club.reconstitute({
        id: 'id-2',
        name: 'Club B',
        address: 'Addr',
        courtsCount: 2,
        createdAt: new Date(),
      });

      expect(club1.equals(club2)).toBe(false);
    });
  });
});
