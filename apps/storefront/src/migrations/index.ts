import * as migration_20260827_075152_initial from './20260827_075152_initial';

export const migrations = [
  {
    up: migration_20260827_075152_initial.up,
    down: migration_20260827_075152_initial.down,
    name: '20260827_075152_initial'
  },
];
