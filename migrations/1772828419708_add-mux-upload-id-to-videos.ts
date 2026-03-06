import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('videos', {
    mux_upload_id: { type: 'varchar(255)', notNull: false, default: null },
  });
  pgm.addIndex('videos', ['mux_upload_id']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex('videos', ['mux_upload_id']);
  pgm.dropColumn('videos', 'mux_upload_id');
}
