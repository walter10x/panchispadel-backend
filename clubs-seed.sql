-- Clubs PanchisPádel - Producción
-- Generado: 17 de mayo de 2026
-- Ejecutar con: psql -U panchispadel -d panchispadel -f clubs-seed.sql

INSERT INTO clubs (id, name, address, phone, "courtsCount", latitude, longitude, "createdAt") VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Complejo Deportivo Municipal Las Norias', 'Camino de las Norias, s/n, Logroño (26009) - La Rioja', '941 263 092', 6, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000002', 'Fundación Cultural Recreativa Cantabria', 'Calle Piscinas s/n, Logroño (26006) - La Rioja', '941 23 77 99', 6, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000003', 'Alos Pádel Indoor', 'Polígono Industrial Cantabria, Calle Majuelo, 4, Logroño', '941 26 50 60', 7, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000004', 'CDSM Hípica de Logroño', 'Av. de la Playa, 4, Logroño (26009) - La Rioja', '941 24 74 89', 8, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000005', 'Spadel', 'Carr. del Cortijo, Logroño (26005) - La Rioja', '629 454 720', 6, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000006', 'Padel La Ribera', 'Paseo del Prior, 6, Logroño (26004) - La Rioja', '646 59 34 07', 5, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000007', 'El Campo de Logroño', 'Carretera Burgos Km 2 Parque de La Grajera, Logroño (26007) - La Rioja', '941 51 13 60', 4, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000008', 'Camping La Playa', 'Av. de la Playa, 6, Logroño (26009) - La Rioja', '941 25 22 53', 2, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-000000000009', 'Complejo Aqualar', 'Complejo Lúdico Deportivo Aqualar, Av. de Entrena, S/N, Lardero (26140) - La Rioja', '685 25 26 77', 4, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-00000000000a', 'Centro Deportivo Fuentelavero', 'Av. Deportiva, 34, Arnedo (26580) - La Rioja', '941 02 44 44', 4, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-00000000000b', 'Pistas Municipales de Villamediana de Iregua', 'Calle Portillo, s/n, Villamediana de Iregua (26142) - La Rioja', '941 434 824', 2, NULL, NULL, NOW()),
  ('a0000001-0000-4000-8000-00000000000c', 'Universidad de La Rioja', 'Paseo del Prior, 107, Logroño (26004) - La Rioja', '941 299 700', 1, NULL, NULL, NOW());
