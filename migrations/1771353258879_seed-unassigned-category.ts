import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    INSERT INTO categories (id, name, description, status, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'Unassigned',
      'Default category for uncategorised content',
      'active',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DELETE FROM categories WHERE id = '00000000-0000-0000-0000-000000000000'`);
}
