import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260827074958 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "style_group" drop constraint if exists "style_group_code_unique";`);
    this.addSql(`create table if not exists "style_group" ("id" text not null, "code" text not null, "title" text not null, "size_system" text check ("size_system" in ('ALPHA', 'NUMERIC', 'ONE_SIZE')) not null default 'ALPHA', "season" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "style_group_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_style_group_deleted_at" ON "style_group" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_style_group_code_unique" ON "style_group" ("code") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "style_group" cascade;`);
  }

}
