import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kampanyalar" DROP CONSTRAINT "kampanyalar_seo_paylasim_gorseli_id_medyalar_id_fk";
  
  ALTER TABLE "_kampanyalar_v" DROP CONSTRAINT "_kampanyalar_v_version_seo_paylasim_gorseli_id_medyalar_id_fk";
  
  DROP INDEX "kampanyalar_slug_idx";
  DROP INDEX "kampanyalar_seo_seo_paylasim_gorseli_idx";
  DROP INDEX "_kampanyalar_v_version_version_slug_idx";
  DROP INDEX "_kampanyalar_v_version_seo_version_seo_paylasim_gorseli_idx";
  ALTER TABLE "kampanyalar" DROP COLUMN "slug";
  ALTER TABLE "kampanyalar" DROP COLUMN "seo_baslik";
  ALTER TABLE "kampanyalar" DROP COLUMN "seo_aciklama";
  ALTER TABLE "kampanyalar" DROP COLUMN "seo_indekslenebilir";
  ALTER TABLE "kampanyalar" DROP COLUMN "seo_paylasim_gorseli_id";
  ALTER TABLE "_kampanyalar_v" DROP COLUMN "version_slug";
  ALTER TABLE "_kampanyalar_v" DROP COLUMN "version_seo_baslik";
  ALTER TABLE "_kampanyalar_v" DROP COLUMN "version_seo_aciklama";
  ALTER TABLE "_kampanyalar_v" DROP COLUMN "version_seo_indekslenebilir";
  ALTER TABLE "_kampanyalar_v" DROP COLUMN "version_seo_paylasim_gorseli_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kampanyalar" ADD COLUMN "slug" varchar;
  ALTER TABLE "kampanyalar" ADD COLUMN "seo_baslik" varchar;
  ALTER TABLE "kampanyalar" ADD COLUMN "seo_aciklama" varchar;
  ALTER TABLE "kampanyalar" ADD COLUMN "seo_indekslenebilir" boolean DEFAULT true;
  ALTER TABLE "kampanyalar" ADD COLUMN "seo_paylasim_gorseli_id" integer;
  ALTER TABLE "_kampanyalar_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "_kampanyalar_v" ADD COLUMN "version_seo_baslik" varchar;
  ALTER TABLE "_kampanyalar_v" ADD COLUMN "version_seo_aciklama" varchar;
  ALTER TABLE "_kampanyalar_v" ADD COLUMN "version_seo_indekslenebilir" boolean DEFAULT true;
  ALTER TABLE "_kampanyalar_v" ADD COLUMN "version_seo_paylasim_gorseli_id" integer;
  ALTER TABLE "kampanyalar" ADD CONSTRAINT "kampanyalar_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kampanyalar_v" ADD CONSTRAINT "_kampanyalar_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "kampanyalar_slug_idx" ON "kampanyalar" USING btree ("slug");
  CREATE INDEX "kampanyalar_seo_seo_paylasim_gorseli_idx" ON "kampanyalar" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "_kampanyalar_v_version_version_slug_idx" ON "_kampanyalar_v" USING btree ("version_slug");
  CREATE INDEX "_kampanyalar_v_version_seo_version_seo_paylasim_gorseli_idx" ON "_kampanyalar_v" USING btree ("version_seo_paylasim_gorseli_id");`)
}
