import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_ayarlari" ADD COLUMN "renkler_zemin" varchar DEFAULT '#e9eef1' NOT NULL;
  ALTER TABLE "site_ayarlari" ADD COLUMN "renkler_metin" varchar DEFAULT '#172126' NOT NULL;
  ALTER TABLE "site_ayarlari" ADD COLUMN "renkler_vurgu" varchar DEFAULT '#ff6254' NOT NULL;
  ALTER TABLE "site_ayarlari" ADD COLUMN "renkler_cizgi" varchar DEFAULT '#8d9da5' NOT NULL;
  ALTER TABLE "site_ayarlari" ADD COLUMN "renkler_form_zemini" varchar DEFAULT '#d9e4e9' NOT NULL;
  ALTER TABLE "site_ayarlari" ADD COLUMN "renkler_acik_metin" varchar DEFAULT '#f7fafb' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_ayarlari" DROP COLUMN "renkler_zemin";
  ALTER TABLE "site_ayarlari" DROP COLUMN "renkler_metin";
  ALTER TABLE "site_ayarlari" DROP COLUMN "renkler_vurgu";
  ALTER TABLE "site_ayarlari" DROP COLUMN "renkler_cizgi";
  ALTER TABLE "site_ayarlari" DROP COLUMN "renkler_form_zemini";
  ALTER TABLE "site_ayarlari" DROP COLUMN "renkler_acik_metin";`)
}
