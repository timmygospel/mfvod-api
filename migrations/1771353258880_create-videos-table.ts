import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType('video_status', ['active', 'archived', 'disabled']);

  pgm.createTable('videos', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    title: {
      type: 'varchar(100)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
      default: '',
    },
    status: {
      type: 'video_status',
      notNull: true,
      default: 'active',
    },
    course_id: {
      type: 'uuid',
      notNull: true,
      references: 'courses(id)',
      onDelete: 'CASCADE',
    },
    sort_order: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    thumbnail_url: {
      type: 'text',
    },
    mux_asset_id: {
      type: 'varchar(255)',
    },
    mux_playback_id: {
      type: 'varchar(255)',
    },
    duration: {
      type: 'integer',
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

  pgm.createIndex('videos', 'course_id');
  pgm.createIndex('videos', 'status');
  pgm.createIndex('videos', 'created_at');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('videos');
  pgm.dropType('video_status');
}
