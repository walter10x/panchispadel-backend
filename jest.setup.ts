import 'reflect-metadata';

process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-12345';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-12345';
process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
