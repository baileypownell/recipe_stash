import type { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.addColumn('files', {
    thumbnail_key: {
      type: 'text',
      unique: true,
    },
  });
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropColumn('files', 'thumbnail_key');
};
