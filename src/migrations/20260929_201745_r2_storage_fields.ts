import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medyalar" ADD COLUMN "prefix" varchar DEFAULT 'medyalar';
  ALTER TABLE "medyalar" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "dosyalar" ADD COLUMN "prefix" varchar DEFAULT 'dosyalar';
  ALTER TABLE "dosyalar" ADD COLUMN "_objectkey" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medyalar" DROP COLUMN "prefix";
  ALTER TABLE "medyalar" DROP COLUMN "_objectkey";
  ALTER TABLE "dosyalar" DROP COLUMN "prefix";
  ALTER TABLE "dosyalar" DROP COLUMN "_objectkey";`)
}
