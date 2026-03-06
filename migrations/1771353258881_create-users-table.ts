import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType('user_role', ['admin', 'subscriber']);

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    email: {
      type: 'varchar(254)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'text',
      notNull: true,
    },
    role: {
      type: 'user_role',
      notNull: true,
      default: 'subscriber',
    },
    two_factor_enabled: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    two_factor_secret: {
      type: 'text',
      notNull: false,
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'role');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
  pgm.dropType('user_role');
}
