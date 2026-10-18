// e2e tests run against a real Postgres (see README / CI). Point them at a separate database.
process.env.DATABASE_URL ??= 'postgresql://board:board@localhost:5432/board_test?schema=public';
process.env.JWT_SECRET ??= 'test-secret-at-least-16-chars';
process.env.WEB_ORIGIN ??= 'http://localhost:3000';
process.env.NODE_ENV = 'test';
