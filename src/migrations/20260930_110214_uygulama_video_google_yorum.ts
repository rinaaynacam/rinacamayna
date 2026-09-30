import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "uygulamalar" ADD COLUMN "video_baglantisi" varchar;
  ALTER TABLE "_uygulamalar_v" ADD COLUMN "version_video_baglantisi" varchar;
  ALTER TABLE "yorumlar" ADD COLUMN "harici_kimlik" varchar;
  ALTER TABLE "_yorumlar_v" ADD COLUMN "version_harici_kimlik" varchar;
  CREATE UNIQUE INDEX "yorumlar_harici_kimlik_idx" ON "yorumlar" USING btree ("harici_kimlik");
  CREATE INDEX "_yorumlar_v_version_version_harici_kimlik_idx" ON "_yorumlar_v" USING btree ("version_harici_kimlik");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "yorumlar_harici_kimlik_idx";
  DROP INDEX "_yorumlar_v_version_version_harici_kimlik_idx";
  ALTER TABLE "uygulamalar" DROP COLUMN "video_baglantisi";
  ALTER TABLE "_uygulamalar_v" DROP COLUMN "version_video_baglantisi";
  ALTER TABLE "yorumlar" DROP COLUMN "harici_kimlik";
  ALTER TABLE "_yorumlar_v" DROP COLUMN "version_harici_kimlik";`)
}
