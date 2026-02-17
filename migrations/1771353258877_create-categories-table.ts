import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType('category_status', ['active', 'archived']);

  pgm.createTable('categories', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
      notNull: true,
      default: '',
    },
    status: {
      type: 'category_status',
      notNull: true,
      default: 'active',
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

  pgm.createIndex('categories', 'status');
  pgm.createIndex('categories', 'created_at');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('categories');
  pgm.dropType('category_status');
}
