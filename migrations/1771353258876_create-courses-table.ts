import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType('course_status', ['active', 'archived']);

  pgm.createTable('courses', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
      default: '',
    },
    status: {
      type: 'course_status',
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

  pgm.createIndex('courses', 'status');
  pgm.createIndex('courses', 'created_at');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('courses');
  pgm.dropType('course_status');
}
