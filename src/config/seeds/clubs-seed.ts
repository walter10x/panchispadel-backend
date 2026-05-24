import { AppDataSource } from '../database';
import { ClubOrmEntity } from '../../modules/clubs/infrastructure/club-orm.entity';

export const CLUBS_SEED = [
  {
    id: 'a0000001-0000-4000-8000-000000000001',
    name: 'Complejo Deportivo Municipal Las Norias',
    address: 'Camino de las Norias, s/n, Logroño (26009) - La Rioja',
    phone: '941 263 092',
    courtsCount: 6,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000002',
    name: 'Fundación Cultural Recreativa Cantabria',
    address: 'Calle Piscinas s/n, Logroño (26006) - La Rioja',
    phone: '941 23 77 99',
    courtsCount: 6,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000003',
    name: 'Alos Pádel Indoor',
    address: 'Polígono Industrial Cantabria, Calle Majuelo, 4, Logroño',
    phone: '941 26 50 60',
    courtsCount: 7,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000004',
    name: 'CDSM Hípica de Logroño',
    address: 'Av. de la Playa, 4, Logroño (26009) - La Rioja',
    phone: '941 24 74 89',
    courtsCount: 8,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000005',
    name: 'Spadel',
    address: 'Carr. del Cortijo, Logroño (26005) - La Rioja',
    phone: '629 454 720',
    courtsCount: 6,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000006',
    name: 'Padel La Ribera',
    address: 'Paseo del Prior, 6, Logroño (26004) - La Rioja',
    phone: '646 59 34 07',
    courtsCount: 5,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000007',
    name: 'El Campo de Logroño',
    address: 'Carretera Burgos Km 2 Parque de La Grajera, Logroño (26007) - La Rioja',
    phone: '941 51 13 60',
    courtsCount: 4,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000008',
    name: 'Camping La Playa',
    address: 'Av. de la Playa, 6, Logroño (26009) - La Rioja',
    phone: '941 25 22 53',
    courtsCount: 2,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000009',
    name: 'Complejo Aqualar',
    address: 'Complejo Lúdico Deportivo Aqualar, Av. de Entrena, S/N, Lardero (26140) - La Rioja',
    phone: '685 25 26 77',
    courtsCount: 4,
  },
  {
    id: 'a0000001-0000-4000-8000-00000000000a',
    name: 'Centro Deportivo Fuentelavero',
    address: 'Av. Deportiva, 34, Arnedo (26580) - La Rioja',
    phone: '941 02 44 44',
    courtsCount: 4,
  },
  {
    id: 'a0000001-0000-4000-8000-00000000000b',
    name: 'Pistas Municipales de Villamediana de Iregua',
    address: 'Calle Portillo, s/n, Villamediana de Iregua (26142) - La Rioja',
    phone: '941 434 824',
    courtsCount: 2,
  },
  {
    id: 'a0000001-0000-4000-8000-00000000000c',
    name: 'Universidad de La Rioja',
    address: 'Paseo del Prior, 107, Logroño (26004) - La Rioja',
    phone: '941 299 700',
    courtsCount: 1,
  },
];

export async function seedClubs(): Promise<void> {
  const repository = AppDataSource.getRepository(ClubOrmEntity);

  for (const data of CLUBS_SEED) {
    const exists = await repository.findOne({ where: { name: data.name } });

    if (!exists) {
      const club = repository.create(data);
      await repository.save(club);
    }
  }
}
