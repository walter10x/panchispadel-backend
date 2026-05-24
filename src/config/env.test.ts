import { envSchema } from './env';

describe('env config — DB_SYNCHRONIZE', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults to true when NODE_ENV is development', () => {
    process.env['NODE_ENV'] = 'development';
    delete process.env['DB_SYNCHRONIZE'];

    const result = envSchema.safeParse(process.env);

    expect(result.success).toBe(true);
    expect(result.data?.DB_SYNCHRONIZE).toBe(true);
  });

  it('defaults to true when NODE_ENV is production', () => {
    process.env['NODE_ENV'] = 'production';
    delete process.env['DB_SYNCHRONIZE'];

    const result = envSchema.safeParse(process.env);

    expect(result.success).toBe(true);
    expect(result.data?.DB_SYNCHRONIZE).toBe(true);
  });

  it('defaults to true when NODE_ENV is test', () => {
    process.env['NODE_ENV'] = 'test';
    delete process.env['DB_SYNCHRONIZE'];

    const result = envSchema.safeParse(process.env);

    expect(result.success).toBe(true);
    expect(result.data?.DB_SYNCHRONIZE).toBe(true);
  });

  it('parses explicit true string', () => {
    process.env['DB_SYNCHRONIZE'] = 'true';

    const result = envSchema.safeParse(process.env);

    expect(result.success).toBe(true);
    expect(result.data?.DB_SYNCHRONIZE).toBe(true);
  });

  it('parses explicit false string', () => {
    process.env['DB_SYNCHRONIZE'] = 'false';

    const result = envSchema.safeParse(process.env);

    expect(result.success).toBe(true);
    expect(result.data?.DB_SYNCHRONIZE).toBe(false);
  });
});
