import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ana_sayfa_icerigi_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ana_sayfa_icerigi_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_ana_sayfa_icerigi_v_version_surec_adimlari" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"baslik" varchar,
  	"aciklama" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ana_sayfa_icerigi_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_etiket" varchar,
  	"version_hero_baslik_1" varchar,
  	"version_hero_vurgu" varchar,
  	"version_hero_baslik_2" varchar,
  	"version_hero_aciklama" varchar,
  	"version_hero_gorseli_id" integer,
  	"version_hero_gorsel_etiketi" varchar,
  	"version_hero_cta_etiketi" varchar,
  	"version_yaklasim_gorunsun" boolean DEFAULT true,
  	"version_yaklasim_sira" varchar,
  	"version_yaklasim_baslik" varchar,
  	"version_yaklasim_vurgu" varchar,
  	"version_yaklasim_aciklama" varchar,
  	"version_hizmetler_gorunsun" boolean DEFAULT true,
  	"version_hizmetler_etiket" varchar,
  	"version_hizmetler_baslik" varchar,
  	"version_hizmetler_aciklama" varchar,
  	"version_uygulamalar_gorunsun" boolean DEFAULT true,
  	"version_uygulamalar_etiket" varchar,
  	"version_uygulamalar_baslik" varchar,
  	"version_uygulamalar_aciklama" varchar,
  	"version_surec_gorunsun" boolean DEFAULT true,
  	"version_surec_etiket" varchar,
  	"version_surec_baslik" varchar,
  	"version_surec_cta_etiketi" varchar,
  	"version_bolge_gorunsun" boolean DEFAULT true,
  	"version_bolge_etiket" varchar,
  	"version_bolge_baslik" varchar,
  	"version_bolge_aciklama" varchar,
  	"version_teklif_etiket" varchar,
  	"version_teklif_baslik" varchar,
  	"version_teklif_aciklama" varchar,
  	"version__status" "enum__ana_sayfa_icerigi_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_ana_sayfa_icerigi_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hizmetler_id" integer,
  	"uygulamalar_id" integer
  );
  
  ALTER TABLE "ana_sayfa_icerigi_surec_adimlari" ALTER COLUMN "baslik" DROP NOT NULL;
  ALTER TABLE "ana_sayfa_icerigi_surec_adimlari" ALTER COLUMN "aciklama" DROP NOT NULL;
  ALTER TABLE "ana_sayfa_icerigi" ADD COLUMN "_status" "enum_ana_sayfa_icerigi_status" DEFAULT 'draft';
  ALTER TABLE "_ana_sayfa_icerigi_v_version_surec_adimlari" ADD CONSTRAINT "_ana_sayfa_icerigi_v_version_surec_adimlari_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ana_sayfa_icerigi_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ana_sayfa_icerigi_v" ADD CONSTRAINT "_ana_sayfa_icerigi_v_version_hero_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_hero_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ana_sayfa_icerigi_v_rels" ADD CONSTRAINT "_ana_sayfa_icerigi_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ana_sayfa_icerigi_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ana_sayfa_icerigi_v_rels" ADD CONSTRAINT "_ana_sayfa_icerigi_v_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ana_sayfa_icerigi_v_rels" ADD CONSTRAINT "_ana_sayfa_icerigi_v_rels_uygulamalar_fk" FOREIGN KEY ("uygulamalar_id") REFERENCES "public"."uygulamalar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_ana_sayfa_icerigi_v_version_surec_adimlari_order_idx" ON "_ana_sayfa_icerigi_v_version_surec_adimlari" USING btree ("_order");
  CREATE INDEX "_ana_sayfa_icerigi_v_version_surec_adimlari_parent_id_idx" ON "_ana_sayfa_icerigi_v_version_surec_adimlari" USING btree ("_parent_id");
  CREATE INDEX "_ana_sayfa_icerigi_v_version_version_hero_gorseli_idx" ON "_ana_sayfa_icerigi_v" USING btree ("version_hero_gorseli_id");
  CREATE INDEX "_ana_sayfa_icerigi_v_version_version__status_idx" ON "_ana_sayfa_icerigi_v" USING btree ("version__status");
  CREATE INDEX "_ana_sayfa_icerigi_v_created_at_idx" ON "_ana_sayfa_icerigi_v" USING btree ("created_at");
  CREATE INDEX "_ana_sayfa_icerigi_v_updated_at_idx" ON "_ana_sayfa_icerigi_v" USING btree ("updated_at");
  CREATE INDEX "_ana_sayfa_icerigi_v_latest_idx" ON "_ana_sayfa_icerigi_v" USING btree ("latest");
  CREATE INDEX "_ana_sayfa_icerigi_v_autosave_idx" ON "_ana_sayfa_icerigi_v" USING btree ("autosave");
  CREATE INDEX "_ana_sayfa_icerigi_v_rels_order_idx" ON "_ana_sayfa_icerigi_v_rels" USING btree ("order");
  CREATE INDEX "_ana_sayfa_icerigi_v_rels_parent_idx" ON "_ana_sayfa_icerigi_v_rels" USING btree ("parent_id");
  CREATE INDEX "_ana_sayfa_icerigi_v_rels_path_idx" ON "_ana_sayfa_icerigi_v_rels" USING btree ("path");
  CREATE INDEX "_ana_sayfa_icerigi_v_rels_hizmetler_id_idx" ON "_ana_sayfa_icerigi_v_rels" USING btree ("hizmetler_id");
  CREATE INDEX "_ana_sayfa_icerigi_v_rels_uygulamalar_id_idx" ON "_ana_sayfa_icerigi_v_rels" USING btree ("uygulamalar_id");
  CREATE INDEX "ana_sayfa_icerigi__status_idx" ON "ana_sayfa_icerigi" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_ana_sayfa_icerigi_v_version_surec_adimlari" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_ana_sayfa_icerigi_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_ana_sayfa_icerigi_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_ana_sayfa_icerigi_v_version_surec_adimlari" CASCADE;
  DROP TABLE "_ana_sayfa_icerigi_v" CASCADE;
  DROP TABLE "_ana_sayfa_icerigi_v_rels" CASCADE;
  DROP INDEX "ana_sayfa_icerigi__status_idx";
  ALTER TABLE "ana_sayfa_icerigi_surec_adimlari" ALTER COLUMN "baslik" SET NOT NULL;
  ALTER TABLE "ana_sayfa_icerigi_surec_adimlari" ALTER COLUMN "aciklama" SET NOT NULL;
  ALTER TABLE "ana_sayfa_icerigi" DROP COLUMN "_status";
  DROP TYPE "public"."enum_ana_sayfa_icerigi_status";
  DROP TYPE "public"."enum__ana_sayfa_icerigi_v_version_status";`)
}
