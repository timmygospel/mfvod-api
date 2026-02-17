import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('course_categories', {
    course_id: {
      type: 'uuid',
      notNull: true,
      references: 'courses(id)',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'uuid',
      notNull: true,
      references: 'categories(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('course_categories', 'course_categories_pkey', {
    primaryKey: ['course_id', 'category_id'],
  });

  pgm.createIndex('course_categories', 'category_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('course_categories');
}
