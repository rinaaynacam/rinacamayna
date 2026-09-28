import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_teklif_takibi_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_teklif_takibi_id_idx";
  ALTER TABLE "teklif_takibi" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "teklif_takibi" CASCADE;
  ALTER TABLE "yorumlar" ADD COLUMN "kaynak_baglantisi" varchar;
  ALTER TABLE "yorumlar" ADD COLUMN "puan" numeric;
  ALTER TABLE "yorumlar" ADD COLUMN "sitede_goster" boolean DEFAULT true;
  ALTER TABLE "_yorumlar_v" ADD COLUMN "version_kaynak_baglantisi" varchar;
  ALTER TABLE "_yorumlar_v" ADD COLUMN "version_puan" numeric;
  ALTER TABLE "_yorumlar_v" ADD COLUMN "version_sitede_goster" boolean DEFAULT true;
  ALTER TABLE "hizmet_bolgeleri" DROP COLUMN "detay_sayfasi_yayinla";
  ALTER TABLE "hizmet_bolgeleri" DROP COLUMN "ozgun_icerik";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "teklif_takibi_id";
  DROP TYPE "public"."enum_teklif_takibi_durum";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_teklif_takibi_durum" AS ENUM('yeni', 'gorusuldu', 'teklif_verildi', 'tamamlandi', 'iptal');
  CREATE TABLE "teklif_takibi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"referans" varchar NOT NULL,
  	"talep_tarihi" timestamp(3) with time zone NOT NULL,
  	"durum" "enum_teklif_takibi_durum" DEFAULT 'yeni' NOT NULL,
  	"ilce_id" integer,
  	"asgari_iletisim" varchar NOT NULL,
  	"ozet" varchar NOT NULL,
  	"dahili_not" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "hizmet_bolgeleri" ADD COLUMN "detay_sayfasi_yayinla" boolean DEFAULT false;
  ALTER TABLE "hizmet_bolgeleri" ADD COLUMN "ozgun_icerik" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "teklif_takibi_id" integer;
  ALTER TABLE "teklif_takibi" ADD CONSTRAINT "teklif_takibi_ilce_id_hizmet_bolgeleri_id_fk" FOREIGN KEY ("ilce_id") REFERENCES "public"."hizmet_bolgeleri"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "teklif_takibi_ilce_idx" ON "teklif_takibi" USING btree ("ilce_id");
  CREATE INDEX "teklif_takibi_updated_at_idx" ON "teklif_takibi" USING btree ("updated_at");
  CREATE INDEX "teklif_takibi_created_at_idx" ON "teklif_takibi" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teklif_takibi_fk" FOREIGN KEY ("teklif_takibi_id") REFERENCES "public"."teklif_takibi"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_teklif_takibi_id_idx" ON "payload_locked_documents_rels" USING btree ("teklif_takibi_id");
  ALTER TABLE "yorumlar" DROP COLUMN "kaynak_baglantisi";
  ALTER TABLE "yorumlar" DROP COLUMN "puan";
  ALTER TABLE "yorumlar" DROP COLUMN "sitede_goster";
  ALTER TABLE "_yorumlar_v" DROP COLUMN "version_kaynak_baglantisi";
  ALTER TABLE "_yorumlar_v" DROP COLUMN "version_puan";
  ALTER TABLE "_yorumlar_v" DROP COLUMN "version_sitede_goster";`)
}
