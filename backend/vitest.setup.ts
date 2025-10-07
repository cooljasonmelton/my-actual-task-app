process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
if (!process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = ':memory:';
}
