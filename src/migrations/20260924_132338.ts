import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_hizmetler_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_hizmetler_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__hizmetler_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__hizmetler_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_kullanim_alanlari_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_kullanim_alanlari_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__kullanim_alanlari_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__kullanim_alanlari_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_islem_secenekleri_tur" AS ENUM('cam', 'ayna', 'kalinlik', 'renk', 'kenar', 'diger');
  CREATE TYPE "public"."enum_islem_secenekleri_sunum_durumu" AS ENUM('sunuluyor', 'disaridan', 'sunulmuyor');
  CREATE TYPE "public"."enum_islem_secenekleri_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_islem_secenekleri_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__islem_secenekleri_v_version_tur" AS ENUM('cam', 'ayna', 'kalinlik', 'renk', 'kenar', 'diger');
  CREATE TYPE "public"."enum__islem_secenekleri_v_version_sunum_durumu" AS ENUM('sunuluyor', 'disaridan', 'sunulmuyor');
  CREATE TYPE "public"."enum__islem_secenekleri_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__islem_secenekleri_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_uygulamalar_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_uygulamalar_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__uygulamalar_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__uygulamalar_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sss_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_sss_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sss_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__sss_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_rehber_yazilari_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_rehber_yazilari_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__rehber_yazilari_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__rehber_yazilari_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sayfalar_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_sayfalar_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sayfalar_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__sayfalar_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_kampanyalar_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_kampanyalar_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__kampanyalar_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__kampanyalar_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_yorumlar_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_yorumlar_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__yorumlar_v_version_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum__yorumlar_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_medyalar_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_dosyalar_dogrulama_durumu" AS ENUM('bekliyor', 'onayli', 'reddedildi');
  CREATE TYPE "public"."enum_teklif_takibi_durum" AS ENUM('yeni', 'gorusuldu', 'teklif_verildi', 'tamamlandi', 'iptal');
  CREATE TABLE "hizmetler" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ad" varchar,
  	"slug" varchar,
  	"ozet" varchar,
  	"aciklama" jsonb,
  	"kapak_gorseli_id" integer,
  	"whatsapp_mesaji" varchar,
  	"sira" numeric DEFAULT 100,
  	"dogrulama_durumu" "enum_hizmetler_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_hizmetler_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "hizmetler_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"kullanim_alanlari_id" integer,
  	"islem_secenekleri_id" integer,
  	"sss_id" integer
  );
  
  CREATE TABLE "_hizmetler_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_ad" varchar,
  	"version_slug" varchar,
  	"version_ozet" varchar,
  	"version_aciklama" jsonb,
  	"version_kapak_gorseli_id" integer,
  	"version_whatsapp_mesaji" varchar,
  	"version_sira" numeric DEFAULT 100,
  	"version_dogrulama_durumu" "enum__hizmetler_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_seo_baslik" varchar,
  	"version_seo_aciklama" varchar,
  	"version_seo_indekslenebilir" boolean DEFAULT true,
  	"version_seo_paylasim_gorseli_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__hizmetler_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_hizmetler_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"kullanim_alanlari_id" integer,
  	"islem_secenekleri_id" integer,
  	"sss_id" integer
  );
  
  CREATE TABLE "kullanim_alanlari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ad" varchar,
  	"slug" varchar,
  	"ozet" varchar,
  	"icerik" jsonb,
  	"kapak_gorseli_id" integer,
  	"sira" numeric DEFAULT 100,
  	"dogrulama_durumu" "enum_kullanim_alanlari_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_kullanim_alanlari_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "kullanim_alanlari_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hizmetler_id" integer
  );
  
  CREATE TABLE "_kullanim_alanlari_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_ad" varchar,
  	"version_slug" varchar,
  	"version_ozet" varchar,
  	"version_icerik" jsonb,
  	"version_kapak_gorseli_id" integer,
  	"version_sira" numeric DEFAULT 100,
  	"version_dogrulama_durumu" "enum__kullanim_alanlari_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_seo_baslik" varchar,
  	"version_seo_aciklama" varchar,
  	"version_seo_indekslenebilir" boolean DEFAULT true,
  	"version_seo_paylasim_gorseli_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__kullanim_alanlari_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_kullanim_alanlari_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hizmetler_id" integer
  );
  
  CREATE TABLE "islem_secenekleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ad" varchar,
  	"tur" "enum_islem_secenekleri_tur",
  	"sunum_durumu" "enum_islem_secenekleri_sunum_durumu",
  	"aciklama" varchar,
  	"sira" numeric DEFAULT 100,
  	"dogrulama_durumu" "enum_islem_secenekleri_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_islem_secenekleri_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_islem_secenekleri_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_ad" varchar,
  	"version_tur" "enum__islem_secenekleri_v_version_tur",
  	"version_sunum_durumu" "enum__islem_secenekleri_v_version_sunum_durumu",
  	"version_aciklama" varchar,
  	"version_sira" numeric DEFAULT 100,
  	"version_dogrulama_durumu" "enum__islem_secenekleri_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__islem_secenekleri_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "uygulamalar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ad" varchar,
  	"slug" varchar,
  	"ozet" varchar,
  	"kullanim" varchar,
  	"malzeme" varchar,
  	"islem" varchar,
  	"aciklama" jsonb,
  	"yayin_izni" boolean DEFAULT false,
  	"izin_notu" varchar,
  	"sira" numeric DEFAULT 100,
  	"dogrulama_durumu" "enum_uygulamalar_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_uygulamalar_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "uygulamalar_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medyalar_id" integer,
  	"hizmetler_id" integer
  );
  
  CREATE TABLE "_uygulamalar_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_ad" varchar,
  	"version_slug" varchar,
  	"version_ozet" varchar,
  	"version_kullanim" varchar,
  	"version_malzeme" varchar,
  	"version_islem" varchar,
  	"version_aciklama" jsonb,
  	"version_yayin_izni" boolean DEFAULT false,
  	"version_izin_notu" varchar,
  	"version_sira" numeric DEFAULT 100,
  	"version_dogrulama_durumu" "enum__uygulamalar_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_seo_baslik" varchar,
  	"version_seo_aciklama" varchar,
  	"version_seo_indekslenebilir" boolean DEFAULT true,
  	"version_seo_paylasim_gorseli_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__uygulamalar_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_uygulamalar_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medyalar_id" integer,
  	"hizmetler_id" integer
  );
  
  CREATE TABLE "sss" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"soru" varchar,
  	"yanit" varchar,
  	"sira" numeric DEFAULT 100,
  	"dogrulama_durumu" "enum_sss_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sss_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "sss_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hizmetler_id" integer
  );
  
  CREATE TABLE "_sss_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_soru" varchar,
  	"version_yanit" varchar,
  	"version_sira" numeric DEFAULT 100,
  	"version_dogrulama_durumu" "enum__sss_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sss_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_sss_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hizmetler_id" integer
  );
  
  CREATE TABLE "rehber_yazilari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"baslik" varchar,
  	"slug" varchar,
  	"ozet" varchar,
  	"icerik" jsonb,
  	"kapak_gorseli_id" integer,
  	"kontrol_eden" varchar,
  	"dogrulama_durumu" "enum_rehber_yazilari_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_rehber_yazilari_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_rehber_yazilari_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_baslik" varchar,
  	"version_slug" varchar,
  	"version_ozet" varchar,
  	"version_icerik" jsonb,
  	"version_kapak_gorseli_id" integer,
  	"version_kontrol_eden" varchar,
  	"version_dogrulama_durumu" "enum__rehber_yazilari_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_seo_baslik" varchar,
  	"version_seo_aciklama" varchar,
  	"version_seo_indekslenebilir" boolean DEFAULT true,
  	"version_seo_paylasim_gorseli_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__rehber_yazilari_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "sayfalar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"baslik" varchar,
  	"slug" varchar,
  	"ozet" varchar,
  	"icerik" jsonb,
  	"dogrulama_durumu" "enum_sayfalar_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sayfalar_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_sayfalar_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_baslik" varchar,
  	"version_slug" varchar,
  	"version_ozet" varchar,
  	"version_icerik" jsonb,
  	"version_dogrulama_durumu" "enum__sayfalar_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_seo_baslik" varchar,
  	"version_seo_aciklama" varchar,
  	"version_seo_indekslenebilir" boolean DEFAULT true,
  	"version_seo_paylasim_gorseli_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sayfalar_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "kampanyalar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"baslik" varchar,
  	"slug" varchar,
  	"ozet" varchar,
  	"kosullar" jsonb,
  	"baslangic" timestamp(3) with time zone,
  	"bitis" timestamp(3) with time zone,
  	"gorsel_id" integer,
  	"dogrulama_durumu" "enum_kampanyalar_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_kampanyalar_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_kampanyalar_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_baslik" varchar,
  	"version_slug" varchar,
  	"version_ozet" varchar,
  	"version_kosullar" jsonb,
  	"version_baslangic" timestamp(3) with time zone,
  	"version_bitis" timestamp(3) with time zone,
  	"version_gorsel_id" integer,
  	"version_dogrulama_durumu" "enum__kampanyalar_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_seo_baslik" varchar,
  	"version_seo_aciklama" varchar,
  	"version_seo_indekslenebilir" boolean DEFAULT true,
  	"version_seo_paylasim_gorseli_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__kampanyalar_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "yorumlar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"gostergelik_ad" varchar,
  	"yorum" varchar,
  	"kaynak" varchar,
  	"yayin_izni" boolean DEFAULT false,
  	"sira" numeric DEFAULT 100,
  	"dogrulama_durumu" "enum_yorumlar_dogrulama_durumu" DEFAULT 'bekliyor',
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_yorumlar_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_yorumlar_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_gostergelik_ad" varchar,
  	"version_yorum" varchar,
  	"version_kaynak" varchar,
  	"version_yayin_izni" boolean DEFAULT false,
  	"version_sira" numeric DEFAULT 100,
  	"version_dogrulama_durumu" "enum__yorumlar_v_version_dogrulama_durumu" DEFAULT 'bekliyor',
  	"version_onaylayan" varchar,
  	"version_dogrulama_tarihi" timestamp(3) with time zone,
  	"version_dahili_kaynak_notu" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__yorumlar_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "medyalar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"kaynak" varchar NOT NULL,
  	"yayin_izni" boolean DEFAULT false NOT NULL,
  	"dogrulama_durumu" "enum_medyalar_dogrulama_durumu" DEFAULT 'bekliyor' NOT NULL,
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_kucuk_url" varchar,
  	"sizes_kucuk_width" numeric,
  	"sizes_kucuk_height" numeric,
  	"sizes_kucuk_mime_type" varchar,
  	"sizes_kucuk_filesize" numeric,
  	"sizes_kucuk_filename" varchar,
  	"sizes_buyuk_url" varchar,
  	"sizes_buyuk_width" numeric,
  	"sizes_buyuk_height" numeric,
  	"sizes_buyuk_mime_type" varchar,
  	"sizes_buyuk_filesize" numeric,
  	"sizes_buyuk_filename" varchar,
  	"sizes_dikey_url" varchar,
  	"sizes_dikey_width" numeric,
  	"sizes_dikey_height" numeric,
  	"sizes_dikey_mime_type" varchar,
  	"sizes_dikey_filesize" numeric,
  	"sizes_dikey_filename" varchar
  );
  
  CREATE TABLE "dosyalar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"baslik" varchar NOT NULL,
  	"aciklama" varchar,
  	"dogrulama_durumu" "enum_dosyalar_dogrulama_durumu" DEFAULT 'bekliyor' NOT NULL,
  	"onaylayan" varchar,
  	"dogrulama_tarihi" timestamp(3) with time zone,
  	"dahili_kaynak_notu" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
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
  
  CREATE TABLE "yonlendirmeler" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kaynak" varchar NOT NULL,
  	"hedef" varchar NOT NULL,
  	"kalici" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "denetim_kaydi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"islem" varchar NOT NULL,
  	"koleksiyon" varchar NOT NULL,
  	"kayit_id" varchar,
  	"yonetici_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_ayarlari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"firma_adi" varchar NOT NULL,
  	"marka_kisa" varchar NOT NULL,
  	"marka_alt" varchar,
  	"kisa_aciklama" varchar NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"seo_baslik" varchar,
  	"seo_aciklama" varchar,
  	"seo_indekslenebilir" boolean DEFAULT true,
  	"seo_paylasim_gorseli_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ana_sayfa_icerigi_surec_adimlari" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"baslik" varchar NOT NULL,
  	"aciklama" varchar NOT NULL
  );
  
  CREATE TABLE "ana_sayfa_icerigi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_etiket" varchar,
  	"hero_baslik_1" varchar,
  	"hero_vurgu" varchar,
  	"hero_baslik_2" varchar,
  	"hero_aciklama" varchar,
  	"hero_gorseli_id" integer,
  	"hero_gorsel_etiketi" varchar,
  	"hero_cta_etiketi" varchar,
  	"yaklasim_gorunsun" boolean DEFAULT true,
  	"yaklasim_sira" varchar,
  	"yaklasim_baslik" varchar,
  	"yaklasim_vurgu" varchar,
  	"yaklasim_aciklama" varchar,
  	"hizmetler_gorunsun" boolean DEFAULT true,
  	"hizmetler_etiket" varchar,
  	"hizmetler_baslik" varchar,
  	"hizmetler_aciklama" varchar,
  	"uygulamalar_gorunsun" boolean DEFAULT true,
  	"uygulamalar_etiket" varchar,
  	"uygulamalar_baslik" varchar,
  	"uygulamalar_aciklama" varchar,
  	"surec_gorunsun" boolean DEFAULT true,
  	"surec_etiket" varchar,
  	"surec_baslik" varchar,
  	"surec_cta_etiketi" varchar,
  	"bolge_gorunsun" boolean DEFAULT true,
  	"bolge_etiket" varchar,
  	"bolge_baslik" varchar,
  	"bolge_aciklama" varchar,
  	"teklif_etiket" varchar,
  	"teklif_baslik" varchar,
  	"teklif_aciklama" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ana_sayfa_icerigi_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hizmetler_id" integer,
  	"uygulamalar_id" integer
  );
  
  CREATE TABLE "ust_bilgi_menu_ogeleri" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiket" varchar NOT NULL,
  	"baglanti" varchar NOT NULL
  );
  
  CREATE TABLE "ust_bilgi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_gorunsun" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "alt_bilgi_linkler" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiket" varchar NOT NULL,
  	"baglanti" varchar NOT NULL
  );
  
  CREATE TABLE "alt_bilgi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"metin" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "entegrasyon_ayarlari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"search_console_dogrulama" varchar,
  	"analytics_aktif" boolean DEFAULT false,
  	"analytics_kimligi" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "hizmet_bolgeleri" ALTER COLUMN "sira" SET DEFAULT 100;
  ALTER TABLE "hizmet_bolgeleri" ADD COLUMN "hedef_kapsam" boolean DEFAULT true NOT NULL;
  ALTER TABLE "hizmet_bolgeleri" ADD COLUMN "operasyon_teyidi" varchar;
  ALTER TABLE "hizmet_bolgeleri" ADD COLUMN "detay_sayfasi_yayinla" boolean DEFAULT false;
  ALTER TABLE "hizmet_bolgeleri" ADD COLUMN "ozgun_icerik" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hizmetler_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kullanim_alanlari_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "islem_secenekleri_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "uygulamalar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sss_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rehber_yazilari_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sayfalar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kampanyalar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "yorumlar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "medyalar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "dosyalar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "teklif_takibi_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "yonlendirmeler_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "denetim_kaydi_id" integer;
  ALTER TABLE "iletisim_bilgileri" ADD COLUMN "adres" varchar;
  ALTER TABLE "iletisim_bilgileri" ADD COLUMN "adres_onayli" boolean DEFAULT false;
  ALTER TABLE "iletisim_bilgileri" ADD COLUMN "calisma_saatleri" varchar;
  ALTER TABLE "iletisim_bilgileri" ADD COLUMN "saatler_onayli" boolean DEFAULT false;
  ALTER TABLE "iletisim_bilgileri" ADD COLUMN "dahili_not" varchar;
  ALTER TABLE "hizmetler" ADD CONSTRAINT "hizmetler_kapak_gorseli_id_medyalar_id_fk" FOREIGN KEY ("kapak_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hizmetler" ADD CONSTRAINT "hizmetler_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hizmetler_rels" ADD CONSTRAINT "hizmetler_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hizmetler_rels" ADD CONSTRAINT "hizmetler_rels_kullanim_alanlari_fk" FOREIGN KEY ("kullanim_alanlari_id") REFERENCES "public"."kullanim_alanlari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hizmetler_rels" ADD CONSTRAINT "hizmetler_rels_islem_secenekleri_fk" FOREIGN KEY ("islem_secenekleri_id") REFERENCES "public"."islem_secenekleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hizmetler_rels" ADD CONSTRAINT "hizmetler_rels_sss_fk" FOREIGN KEY ("sss_id") REFERENCES "public"."sss"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hizmetler_v" ADD CONSTRAINT "_hizmetler_v_parent_id_hizmetler_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hizmetler"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hizmetler_v" ADD CONSTRAINT "_hizmetler_v_version_kapak_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_kapak_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hizmetler_v" ADD CONSTRAINT "_hizmetler_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hizmetler_v_rels" ADD CONSTRAINT "_hizmetler_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hizmetler_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hizmetler_v_rels" ADD CONSTRAINT "_hizmetler_v_rels_kullanim_alanlari_fk" FOREIGN KEY ("kullanim_alanlari_id") REFERENCES "public"."kullanim_alanlari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hizmetler_v_rels" ADD CONSTRAINT "_hizmetler_v_rels_islem_secenekleri_fk" FOREIGN KEY ("islem_secenekleri_id") REFERENCES "public"."islem_secenekleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hizmetler_v_rels" ADD CONSTRAINT "_hizmetler_v_rels_sss_fk" FOREIGN KEY ("sss_id") REFERENCES "public"."sss"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kullanim_alanlari" ADD CONSTRAINT "kullanim_alanlari_kapak_gorseli_id_medyalar_id_fk" FOREIGN KEY ("kapak_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kullanim_alanlari" ADD CONSTRAINT "kullanim_alanlari_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kullanim_alanlari_rels" ADD CONSTRAINT "kullanim_alanlari_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kullanim_alanlari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kullanim_alanlari_rels" ADD CONSTRAINT "kullanim_alanlari_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kullanim_alanlari_v" ADD CONSTRAINT "_kullanim_alanlari_v_parent_id_kullanim_alanlari_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kullanim_alanlari"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kullanim_alanlari_v" ADD CONSTRAINT "_kullanim_alanlari_v_version_kapak_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_kapak_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kullanim_alanlari_v" ADD CONSTRAINT "_kullanim_alanlari_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kullanim_alanlari_v_rels" ADD CONSTRAINT "_kullanim_alanlari_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_kullanim_alanlari_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kullanim_alanlari_v_rels" ADD CONSTRAINT "_kullanim_alanlari_v_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_islem_secenekleri_v" ADD CONSTRAINT "_islem_secenekleri_v_parent_id_islem_secenekleri_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."islem_secenekleri"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "uygulamalar" ADD CONSTRAINT "uygulamalar_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "uygulamalar_rels" ADD CONSTRAINT "uygulamalar_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."uygulamalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "uygulamalar_rels" ADD CONSTRAINT "uygulamalar_rels_medyalar_fk" FOREIGN KEY ("medyalar_id") REFERENCES "public"."medyalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "uygulamalar_rels" ADD CONSTRAINT "uygulamalar_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_uygulamalar_v" ADD CONSTRAINT "_uygulamalar_v_parent_id_uygulamalar_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."uygulamalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_uygulamalar_v" ADD CONSTRAINT "_uygulamalar_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_uygulamalar_v_rels" ADD CONSTRAINT "_uygulamalar_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_uygulamalar_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_uygulamalar_v_rels" ADD CONSTRAINT "_uygulamalar_v_rels_medyalar_fk" FOREIGN KEY ("medyalar_id") REFERENCES "public"."medyalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_uygulamalar_v_rels" ADD CONSTRAINT "_uygulamalar_v_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sss_rels" ADD CONSTRAINT "sss_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sss"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sss_rels" ADD CONSTRAINT "sss_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sss_v" ADD CONSTRAINT "_sss_v_parent_id_sss_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sss"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sss_v_rels" ADD CONSTRAINT "_sss_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_sss_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sss_v_rels" ADD CONSTRAINT "_sss_v_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rehber_yazilari" ADD CONSTRAINT "rehber_yazilari_kapak_gorseli_id_medyalar_id_fk" FOREIGN KEY ("kapak_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rehber_yazilari" ADD CONSTRAINT "rehber_yazilari_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rehber_yazilari_v" ADD CONSTRAINT "_rehber_yazilari_v_parent_id_rehber_yazilari_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rehber_yazilari"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rehber_yazilari_v" ADD CONSTRAINT "_rehber_yazilari_v_version_kapak_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_kapak_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rehber_yazilari_v" ADD CONSTRAINT "_rehber_yazilari_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sayfalar" ADD CONSTRAINT "sayfalar_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sayfalar_v" ADD CONSTRAINT "_sayfalar_v_parent_id_sayfalar_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sayfalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sayfalar_v" ADD CONSTRAINT "_sayfalar_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kampanyalar" ADD CONSTRAINT "kampanyalar_gorsel_id_medyalar_id_fk" FOREIGN KEY ("gorsel_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kampanyalar" ADD CONSTRAINT "kampanyalar_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kampanyalar_v" ADD CONSTRAINT "_kampanyalar_v_parent_id_kampanyalar_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kampanyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kampanyalar_v" ADD CONSTRAINT "_kampanyalar_v_version_gorsel_id_medyalar_id_fk" FOREIGN KEY ("version_gorsel_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kampanyalar_v" ADD CONSTRAINT "_kampanyalar_v_version_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("version_seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yorumlar_v" ADD CONSTRAINT "_yorumlar_v_parent_id_yorumlar_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."yorumlar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "teklif_takibi" ADD CONSTRAINT "teklif_takibi_ilce_id_hizmet_bolgeleri_id_fk" FOREIGN KEY ("ilce_id") REFERENCES "public"."hizmet_bolgeleri"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "denetim_kaydi" ADD CONSTRAINT "denetim_kaydi_yonetici_id_yoneticiler_id_fk" FOREIGN KEY ("yonetici_id") REFERENCES "public"."yoneticiler"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_ayarlari" ADD CONSTRAINT "site_ayarlari_logo_id_medyalar_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_ayarlari" ADD CONSTRAINT "site_ayarlari_favicon_id_medyalar_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_ayarlari" ADD CONSTRAINT "site_ayarlari_seo_paylasim_gorseli_id_medyalar_id_fk" FOREIGN KEY ("seo_paylasim_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ana_sayfa_icerigi_surec_adimlari" ADD CONSTRAINT "ana_sayfa_icerigi_surec_adimlari_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ana_sayfa_icerigi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ana_sayfa_icerigi" ADD CONSTRAINT "ana_sayfa_icerigi_hero_gorseli_id_medyalar_id_fk" FOREIGN KEY ("hero_gorseli_id") REFERENCES "public"."medyalar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ana_sayfa_icerigi_rels" ADD CONSTRAINT "ana_sayfa_icerigi_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ana_sayfa_icerigi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ana_sayfa_icerigi_rels" ADD CONSTRAINT "ana_sayfa_icerigi_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ana_sayfa_icerigi_rels" ADD CONSTRAINT "ana_sayfa_icerigi_rels_uygulamalar_fk" FOREIGN KEY ("uygulamalar_id") REFERENCES "public"."uygulamalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ust_bilgi_menu_ogeleri" ADD CONSTRAINT "ust_bilgi_menu_ogeleri_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ust_bilgi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "alt_bilgi_linkler" ADD CONSTRAINT "alt_bilgi_linkler_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."alt_bilgi"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "hizmetler_slug_idx" ON "hizmetler" USING btree ("slug");
  CREATE INDEX "hizmetler_kapak_gorseli_idx" ON "hizmetler" USING btree ("kapak_gorseli_id");
  CREATE INDEX "hizmetler_seo_seo_paylasim_gorseli_idx" ON "hizmetler" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "hizmetler_updated_at_idx" ON "hizmetler" USING btree ("updated_at");
  CREATE INDEX "hizmetler_created_at_idx" ON "hizmetler" USING btree ("created_at");
  CREATE INDEX "hizmetler__status_idx" ON "hizmetler" USING btree ("_status");
  CREATE INDEX "hizmetler_rels_order_idx" ON "hizmetler_rels" USING btree ("order");
  CREATE INDEX "hizmetler_rels_parent_idx" ON "hizmetler_rels" USING btree ("parent_id");
  CREATE INDEX "hizmetler_rels_path_idx" ON "hizmetler_rels" USING btree ("path");
  CREATE INDEX "hizmetler_rels_kullanim_alanlari_id_idx" ON "hizmetler_rels" USING btree ("kullanim_alanlari_id");
  CREATE INDEX "hizmetler_rels_islem_secenekleri_id_idx" ON "hizmetler_rels" USING btree ("islem_secenekleri_id");
  CREATE INDEX "hizmetler_rels_sss_id_idx" ON "hizmetler_rels" USING btree ("sss_id");
  CREATE INDEX "_hizmetler_v_parent_idx" ON "_hizmetler_v" USING btree ("parent_id");
  CREATE INDEX "_hizmetler_v_version_version_slug_idx" ON "_hizmetler_v" USING btree ("version_slug");
  CREATE INDEX "_hizmetler_v_version_version_kapak_gorseli_idx" ON "_hizmetler_v" USING btree ("version_kapak_gorseli_id");
  CREATE INDEX "_hizmetler_v_version_seo_version_seo_paylasim_gorseli_idx" ON "_hizmetler_v" USING btree ("version_seo_paylasim_gorseli_id");
  CREATE INDEX "_hizmetler_v_version_version_updated_at_idx" ON "_hizmetler_v" USING btree ("version_updated_at");
  CREATE INDEX "_hizmetler_v_version_version_created_at_idx" ON "_hizmetler_v" USING btree ("version_created_at");
  CREATE INDEX "_hizmetler_v_version_version__status_idx" ON "_hizmetler_v" USING btree ("version__status");
  CREATE INDEX "_hizmetler_v_created_at_idx" ON "_hizmetler_v" USING btree ("created_at");
  CREATE INDEX "_hizmetler_v_updated_at_idx" ON "_hizmetler_v" USING btree ("updated_at");
  CREATE INDEX "_hizmetler_v_latest_idx" ON "_hizmetler_v" USING btree ("latest");
  CREATE INDEX "_hizmetler_v_autosave_idx" ON "_hizmetler_v" USING btree ("autosave");
  CREATE INDEX "_hizmetler_v_rels_order_idx" ON "_hizmetler_v_rels" USING btree ("order");
  CREATE INDEX "_hizmetler_v_rels_parent_idx" ON "_hizmetler_v_rels" USING btree ("parent_id");
  CREATE INDEX "_hizmetler_v_rels_path_idx" ON "_hizmetler_v_rels" USING btree ("path");
  CREATE INDEX "_hizmetler_v_rels_kullanim_alanlari_id_idx" ON "_hizmetler_v_rels" USING btree ("kullanim_alanlari_id");
  CREATE INDEX "_hizmetler_v_rels_islem_secenekleri_id_idx" ON "_hizmetler_v_rels" USING btree ("islem_secenekleri_id");
  CREATE INDEX "_hizmetler_v_rels_sss_id_idx" ON "_hizmetler_v_rels" USING btree ("sss_id");
  CREATE UNIQUE INDEX "kullanim_alanlari_slug_idx" ON "kullanim_alanlari" USING btree ("slug");
  CREATE INDEX "kullanim_alanlari_kapak_gorseli_idx" ON "kullanim_alanlari" USING btree ("kapak_gorseli_id");
  CREATE INDEX "kullanim_alanlari_seo_seo_paylasim_gorseli_idx" ON "kullanim_alanlari" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "kullanim_alanlari_updated_at_idx" ON "kullanim_alanlari" USING btree ("updated_at");
  CREATE INDEX "kullanim_alanlari_created_at_idx" ON "kullanim_alanlari" USING btree ("created_at");
  CREATE INDEX "kullanim_alanlari__status_idx" ON "kullanim_alanlari" USING btree ("_status");
  CREATE INDEX "kullanim_alanlari_rels_order_idx" ON "kullanim_alanlari_rels" USING btree ("order");
  CREATE INDEX "kullanim_alanlari_rels_parent_idx" ON "kullanim_alanlari_rels" USING btree ("parent_id");
  CREATE INDEX "kullanim_alanlari_rels_path_idx" ON "kullanim_alanlari_rels" USING btree ("path");
  CREATE INDEX "kullanim_alanlari_rels_hizmetler_id_idx" ON "kullanim_alanlari_rels" USING btree ("hizmetler_id");
  CREATE INDEX "_kullanim_alanlari_v_parent_idx" ON "_kullanim_alanlari_v" USING btree ("parent_id");
  CREATE INDEX "_kullanim_alanlari_v_version_version_slug_idx" ON "_kullanim_alanlari_v" USING btree ("version_slug");
  CREATE INDEX "_kullanim_alanlari_v_version_version_kapak_gorseli_idx" ON "_kullanim_alanlari_v" USING btree ("version_kapak_gorseli_id");
  CREATE INDEX "_kullanim_alanlari_v_version_seo_version_seo_paylasim_go_idx" ON "_kullanim_alanlari_v" USING btree ("version_seo_paylasim_gorseli_id");
  CREATE INDEX "_kullanim_alanlari_v_version_version_updated_at_idx" ON "_kullanim_alanlari_v" USING btree ("version_updated_at");
  CREATE INDEX "_kullanim_alanlari_v_version_version_created_at_idx" ON "_kullanim_alanlari_v" USING btree ("version_created_at");
  CREATE INDEX "_kullanim_alanlari_v_version_version__status_idx" ON "_kullanim_alanlari_v" USING btree ("version__status");
  CREATE INDEX "_kullanim_alanlari_v_created_at_idx" ON "_kullanim_alanlari_v" USING btree ("created_at");
  CREATE INDEX "_kullanim_alanlari_v_updated_at_idx" ON "_kullanim_alanlari_v" USING btree ("updated_at");
  CREATE INDEX "_kullanim_alanlari_v_latest_idx" ON "_kullanim_alanlari_v" USING btree ("latest");
  CREATE INDEX "_kullanim_alanlari_v_autosave_idx" ON "_kullanim_alanlari_v" USING btree ("autosave");
  CREATE INDEX "_kullanim_alanlari_v_rels_order_idx" ON "_kullanim_alanlari_v_rels" USING btree ("order");
  CREATE INDEX "_kullanim_alanlari_v_rels_parent_idx" ON "_kullanim_alanlari_v_rels" USING btree ("parent_id");
  CREATE INDEX "_kullanim_alanlari_v_rels_path_idx" ON "_kullanim_alanlari_v_rels" USING btree ("path");
  CREATE INDEX "_kullanim_alanlari_v_rels_hizmetler_id_idx" ON "_kullanim_alanlari_v_rels" USING btree ("hizmetler_id");
  CREATE INDEX "islem_secenekleri_updated_at_idx" ON "islem_secenekleri" USING btree ("updated_at");
  CREATE INDEX "islem_secenekleri_created_at_idx" ON "islem_secenekleri" USING btree ("created_at");
  CREATE INDEX "islem_secenekleri__status_idx" ON "islem_secenekleri" USING btree ("_status");
  CREATE INDEX "_islem_secenekleri_v_parent_idx" ON "_islem_secenekleri_v" USING btree ("parent_id");
  CREATE INDEX "_islem_secenekleri_v_version_version_updated_at_idx" ON "_islem_secenekleri_v" USING btree ("version_updated_at");
  CREATE INDEX "_islem_secenekleri_v_version_version_created_at_idx" ON "_islem_secenekleri_v" USING btree ("version_created_at");
  CREATE INDEX "_islem_secenekleri_v_version_version__status_idx" ON "_islem_secenekleri_v" USING btree ("version__status");
  CREATE INDEX "_islem_secenekleri_v_created_at_idx" ON "_islem_secenekleri_v" USING btree ("created_at");
  CREATE INDEX "_islem_secenekleri_v_updated_at_idx" ON "_islem_secenekleri_v" USING btree ("updated_at");
  CREATE INDEX "_islem_secenekleri_v_latest_idx" ON "_islem_secenekleri_v" USING btree ("latest");
  CREATE INDEX "_islem_secenekleri_v_autosave_idx" ON "_islem_secenekleri_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "uygulamalar_slug_idx" ON "uygulamalar" USING btree ("slug");
  CREATE INDEX "uygulamalar_seo_seo_paylasim_gorseli_idx" ON "uygulamalar" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "uygulamalar_updated_at_idx" ON "uygulamalar" USING btree ("updated_at");
  CREATE INDEX "uygulamalar_created_at_idx" ON "uygulamalar" USING btree ("created_at");
  CREATE INDEX "uygulamalar__status_idx" ON "uygulamalar" USING btree ("_status");
  CREATE INDEX "uygulamalar_rels_order_idx" ON "uygulamalar_rels" USING btree ("order");
  CREATE INDEX "uygulamalar_rels_parent_idx" ON "uygulamalar_rels" USING btree ("parent_id");
  CREATE INDEX "uygulamalar_rels_path_idx" ON "uygulamalar_rels" USING btree ("path");
  CREATE INDEX "uygulamalar_rels_medyalar_id_idx" ON "uygulamalar_rels" USING btree ("medyalar_id");
  CREATE INDEX "uygulamalar_rels_hizmetler_id_idx" ON "uygulamalar_rels" USING btree ("hizmetler_id");
  CREATE INDEX "_uygulamalar_v_parent_idx" ON "_uygulamalar_v" USING btree ("parent_id");
  CREATE INDEX "_uygulamalar_v_version_version_slug_idx" ON "_uygulamalar_v" USING btree ("version_slug");
  CREATE INDEX "_uygulamalar_v_version_seo_version_seo_paylasim_gorseli_idx" ON "_uygulamalar_v" USING btree ("version_seo_paylasim_gorseli_id");
  CREATE INDEX "_uygulamalar_v_version_version_updated_at_idx" ON "_uygulamalar_v" USING btree ("version_updated_at");
  CREATE INDEX "_uygulamalar_v_version_version_created_at_idx" ON "_uygulamalar_v" USING btree ("version_created_at");
  CREATE INDEX "_uygulamalar_v_version_version__status_idx" ON "_uygulamalar_v" USING btree ("version__status");
  CREATE INDEX "_uygulamalar_v_created_at_idx" ON "_uygulamalar_v" USING btree ("created_at");
  CREATE INDEX "_uygulamalar_v_updated_at_idx" ON "_uygulamalar_v" USING btree ("updated_at");
  CREATE INDEX "_uygulamalar_v_latest_idx" ON "_uygulamalar_v" USING btree ("latest");
  CREATE INDEX "_uygulamalar_v_autosave_idx" ON "_uygulamalar_v" USING btree ("autosave");
  CREATE INDEX "_uygulamalar_v_rels_order_idx" ON "_uygulamalar_v_rels" USING btree ("order");
  CREATE INDEX "_uygulamalar_v_rels_parent_idx" ON "_uygulamalar_v_rels" USING btree ("parent_id");
  CREATE INDEX "_uygulamalar_v_rels_path_idx" ON "_uygulamalar_v_rels" USING btree ("path");
  CREATE INDEX "_uygulamalar_v_rels_medyalar_id_idx" ON "_uygulamalar_v_rels" USING btree ("medyalar_id");
  CREATE INDEX "_uygulamalar_v_rels_hizmetler_id_idx" ON "_uygulamalar_v_rels" USING btree ("hizmetler_id");
  CREATE INDEX "sss_updated_at_idx" ON "sss" USING btree ("updated_at");
  CREATE INDEX "sss_created_at_idx" ON "sss" USING btree ("created_at");
  CREATE INDEX "sss__status_idx" ON "sss" USING btree ("_status");
  CREATE INDEX "sss_rels_order_idx" ON "sss_rels" USING btree ("order");
  CREATE INDEX "sss_rels_parent_idx" ON "sss_rels" USING btree ("parent_id");
  CREATE INDEX "sss_rels_path_idx" ON "sss_rels" USING btree ("path");
  CREATE INDEX "sss_rels_hizmetler_id_idx" ON "sss_rels" USING btree ("hizmetler_id");
  CREATE INDEX "_sss_v_parent_idx" ON "_sss_v" USING btree ("parent_id");
  CREATE INDEX "_sss_v_version_version_updated_at_idx" ON "_sss_v" USING btree ("version_updated_at");
  CREATE INDEX "_sss_v_version_version_created_at_idx" ON "_sss_v" USING btree ("version_created_at");
  CREATE INDEX "_sss_v_version_version__status_idx" ON "_sss_v" USING btree ("version__status");
  CREATE INDEX "_sss_v_created_at_idx" ON "_sss_v" USING btree ("created_at");
  CREATE INDEX "_sss_v_updated_at_idx" ON "_sss_v" USING btree ("updated_at");
  CREATE INDEX "_sss_v_latest_idx" ON "_sss_v" USING btree ("latest");
  CREATE INDEX "_sss_v_autosave_idx" ON "_sss_v" USING btree ("autosave");
  CREATE INDEX "_sss_v_rels_order_idx" ON "_sss_v_rels" USING btree ("order");
  CREATE INDEX "_sss_v_rels_parent_idx" ON "_sss_v_rels" USING btree ("parent_id");
  CREATE INDEX "_sss_v_rels_path_idx" ON "_sss_v_rels" USING btree ("path");
  CREATE INDEX "_sss_v_rels_hizmetler_id_idx" ON "_sss_v_rels" USING btree ("hizmetler_id");
  CREATE UNIQUE INDEX "rehber_yazilari_slug_idx" ON "rehber_yazilari" USING btree ("slug");
  CREATE INDEX "rehber_yazilari_kapak_gorseli_idx" ON "rehber_yazilari" USING btree ("kapak_gorseli_id");
  CREATE INDEX "rehber_yazilari_seo_seo_paylasim_gorseli_idx" ON "rehber_yazilari" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "rehber_yazilari_updated_at_idx" ON "rehber_yazilari" USING btree ("updated_at");
  CREATE INDEX "rehber_yazilari_created_at_idx" ON "rehber_yazilari" USING btree ("created_at");
  CREATE INDEX "rehber_yazilari__status_idx" ON "rehber_yazilari" USING btree ("_status");
  CREATE INDEX "_rehber_yazilari_v_parent_idx" ON "_rehber_yazilari_v" USING btree ("parent_id");
  CREATE INDEX "_rehber_yazilari_v_version_version_slug_idx" ON "_rehber_yazilari_v" USING btree ("version_slug");
  CREATE INDEX "_rehber_yazilari_v_version_version_kapak_gorseli_idx" ON "_rehber_yazilari_v" USING btree ("version_kapak_gorseli_id");
  CREATE INDEX "_rehber_yazilari_v_version_seo_version_seo_paylasim_gors_idx" ON "_rehber_yazilari_v" USING btree ("version_seo_paylasim_gorseli_id");
  CREATE INDEX "_rehber_yazilari_v_version_version_updated_at_idx" ON "_rehber_yazilari_v" USING btree ("version_updated_at");
  CREATE INDEX "_rehber_yazilari_v_version_version_created_at_idx" ON "_rehber_yazilari_v" USING btree ("version_created_at");
  CREATE INDEX "_rehber_yazilari_v_version_version__status_idx" ON "_rehber_yazilari_v" USING btree ("version__status");
  CREATE INDEX "_rehber_yazilari_v_created_at_idx" ON "_rehber_yazilari_v" USING btree ("created_at");
  CREATE INDEX "_rehber_yazilari_v_updated_at_idx" ON "_rehber_yazilari_v" USING btree ("updated_at");
  CREATE INDEX "_rehber_yazilari_v_latest_idx" ON "_rehber_yazilari_v" USING btree ("latest");
  CREATE INDEX "_rehber_yazilari_v_autosave_idx" ON "_rehber_yazilari_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "sayfalar_slug_idx" ON "sayfalar" USING btree ("slug");
  CREATE INDEX "sayfalar_seo_seo_paylasim_gorseli_idx" ON "sayfalar" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "sayfalar_updated_at_idx" ON "sayfalar" USING btree ("updated_at");
  CREATE INDEX "sayfalar_created_at_idx" ON "sayfalar" USING btree ("created_at");
  CREATE INDEX "sayfalar__status_idx" ON "sayfalar" USING btree ("_status");
  CREATE INDEX "_sayfalar_v_parent_idx" ON "_sayfalar_v" USING btree ("parent_id");
  CREATE INDEX "_sayfalar_v_version_version_slug_idx" ON "_sayfalar_v" USING btree ("version_slug");
  CREATE INDEX "_sayfalar_v_version_seo_version_seo_paylasim_gorseli_idx" ON "_sayfalar_v" USING btree ("version_seo_paylasim_gorseli_id");
  CREATE INDEX "_sayfalar_v_version_version_updated_at_idx" ON "_sayfalar_v" USING btree ("version_updated_at");
  CREATE INDEX "_sayfalar_v_version_version_created_at_idx" ON "_sayfalar_v" USING btree ("version_created_at");
  CREATE INDEX "_sayfalar_v_version_version__status_idx" ON "_sayfalar_v" USING btree ("version__status");
  CREATE INDEX "_sayfalar_v_created_at_idx" ON "_sayfalar_v" USING btree ("created_at");
  CREATE INDEX "_sayfalar_v_updated_at_idx" ON "_sayfalar_v" USING btree ("updated_at");
  CREATE INDEX "_sayfalar_v_latest_idx" ON "_sayfalar_v" USING btree ("latest");
  CREATE INDEX "_sayfalar_v_autosave_idx" ON "_sayfalar_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "kampanyalar_slug_idx" ON "kampanyalar" USING btree ("slug");
  CREATE INDEX "kampanyalar_gorsel_idx" ON "kampanyalar" USING btree ("gorsel_id");
  CREATE INDEX "kampanyalar_seo_seo_paylasim_gorseli_idx" ON "kampanyalar" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "kampanyalar_updated_at_idx" ON "kampanyalar" USING btree ("updated_at");
  CREATE INDEX "kampanyalar_created_at_idx" ON "kampanyalar" USING btree ("created_at");
  CREATE INDEX "kampanyalar__status_idx" ON "kampanyalar" USING btree ("_status");
  CREATE INDEX "_kampanyalar_v_parent_idx" ON "_kampanyalar_v" USING btree ("parent_id");
  CREATE INDEX "_kampanyalar_v_version_version_slug_idx" ON "_kampanyalar_v" USING btree ("version_slug");
  CREATE INDEX "_kampanyalar_v_version_version_gorsel_idx" ON "_kampanyalar_v" USING btree ("version_gorsel_id");
  CREATE INDEX "_kampanyalar_v_version_seo_version_seo_paylasim_gorseli_idx" ON "_kampanyalar_v" USING btree ("version_seo_paylasim_gorseli_id");
  CREATE INDEX "_kampanyalar_v_version_version_updated_at_idx" ON "_kampanyalar_v" USING btree ("version_updated_at");
  CREATE INDEX "_kampanyalar_v_version_version_created_at_idx" ON "_kampanyalar_v" USING btree ("version_created_at");
  CREATE INDEX "_kampanyalar_v_version_version__status_idx" ON "_kampanyalar_v" USING btree ("version__status");
  CREATE INDEX "_kampanyalar_v_created_at_idx" ON "_kampanyalar_v" USING btree ("created_at");
  CREATE INDEX "_kampanyalar_v_updated_at_idx" ON "_kampanyalar_v" USING btree ("updated_at");
  CREATE INDEX "_kampanyalar_v_latest_idx" ON "_kampanyalar_v" USING btree ("latest");
  CREATE INDEX "_kampanyalar_v_autosave_idx" ON "_kampanyalar_v" USING btree ("autosave");
  CREATE INDEX "yorumlar_updated_at_idx" ON "yorumlar" USING btree ("updated_at");
  CREATE INDEX "yorumlar_created_at_idx" ON "yorumlar" USING btree ("created_at");
  CREATE INDEX "yorumlar__status_idx" ON "yorumlar" USING btree ("_status");
  CREATE INDEX "_yorumlar_v_parent_idx" ON "_yorumlar_v" USING btree ("parent_id");
  CREATE INDEX "_yorumlar_v_version_version_updated_at_idx" ON "_yorumlar_v" USING btree ("version_updated_at");
  CREATE INDEX "_yorumlar_v_version_version_created_at_idx" ON "_yorumlar_v" USING btree ("version_created_at");
  CREATE INDEX "_yorumlar_v_version_version__status_idx" ON "_yorumlar_v" USING btree ("version__status");
  CREATE INDEX "_yorumlar_v_created_at_idx" ON "_yorumlar_v" USING btree ("created_at");
  CREATE INDEX "_yorumlar_v_updated_at_idx" ON "_yorumlar_v" USING btree ("updated_at");
  CREATE INDEX "_yorumlar_v_latest_idx" ON "_yorumlar_v" USING btree ("latest");
  CREATE INDEX "_yorumlar_v_autosave_idx" ON "_yorumlar_v" USING btree ("autosave");
  CREATE INDEX "medyalar_updated_at_idx" ON "medyalar" USING btree ("updated_at");
  CREATE INDEX "medyalar_created_at_idx" ON "medyalar" USING btree ("created_at");
  CREATE UNIQUE INDEX "medyalar_filename_idx" ON "medyalar" USING btree ("filename");
  CREATE INDEX "medyalar_sizes_kucuk_sizes_kucuk_filename_idx" ON "medyalar" USING btree ("sizes_kucuk_filename");
  CREATE INDEX "medyalar_sizes_buyuk_sizes_buyuk_filename_idx" ON "medyalar" USING btree ("sizes_buyuk_filename");
  CREATE INDEX "medyalar_sizes_dikey_sizes_dikey_filename_idx" ON "medyalar" USING btree ("sizes_dikey_filename");
  CREATE INDEX "dosyalar_updated_at_idx" ON "dosyalar" USING btree ("updated_at");
  CREATE INDEX "dosyalar_created_at_idx" ON "dosyalar" USING btree ("created_at");
  CREATE UNIQUE INDEX "dosyalar_filename_idx" ON "dosyalar" USING btree ("filename");
  CREATE INDEX "teklif_takibi_ilce_idx" ON "teklif_takibi" USING btree ("ilce_id");
  CREATE INDEX "teklif_takibi_updated_at_idx" ON "teklif_takibi" USING btree ("updated_at");
  CREATE INDEX "teklif_takibi_created_at_idx" ON "teklif_takibi" USING btree ("created_at");
  CREATE UNIQUE INDEX "yonlendirmeler_kaynak_idx" ON "yonlendirmeler" USING btree ("kaynak");
  CREATE INDEX "yonlendirmeler_updated_at_idx" ON "yonlendirmeler" USING btree ("updated_at");
  CREATE INDEX "yonlendirmeler_created_at_idx" ON "yonlendirmeler" USING btree ("created_at");
  CREATE INDEX "denetim_kaydi_yonetici_idx" ON "denetim_kaydi" USING btree ("yonetici_id");
  CREATE INDEX "denetim_kaydi_updated_at_idx" ON "denetim_kaydi" USING btree ("updated_at");
  CREATE INDEX "denetim_kaydi_created_at_idx" ON "denetim_kaydi" USING btree ("created_at");
  CREATE INDEX "site_ayarlari_logo_idx" ON "site_ayarlari" USING btree ("logo_id");
  CREATE INDEX "site_ayarlari_favicon_idx" ON "site_ayarlari" USING btree ("favicon_id");
  CREATE INDEX "site_ayarlari_seo_seo_paylasim_gorseli_idx" ON "site_ayarlari" USING btree ("seo_paylasim_gorseli_id");
  CREATE INDEX "ana_sayfa_icerigi_surec_adimlari_order_idx" ON "ana_sayfa_icerigi_surec_adimlari" USING btree ("_order");
  CREATE INDEX "ana_sayfa_icerigi_surec_adimlari_parent_id_idx" ON "ana_sayfa_icerigi_surec_adimlari" USING btree ("_parent_id");
  CREATE INDEX "ana_sayfa_icerigi_hero_gorseli_idx" ON "ana_sayfa_icerigi" USING btree ("hero_gorseli_id");
  CREATE INDEX "ana_sayfa_icerigi_rels_order_idx" ON "ana_sayfa_icerigi_rels" USING btree ("order");
  CREATE INDEX "ana_sayfa_icerigi_rels_parent_idx" ON "ana_sayfa_icerigi_rels" USING btree ("parent_id");
  CREATE INDEX "ana_sayfa_icerigi_rels_path_idx" ON "ana_sayfa_icerigi_rels" USING btree ("path");
  CREATE INDEX "ana_sayfa_icerigi_rels_hizmetler_id_idx" ON "ana_sayfa_icerigi_rels" USING btree ("hizmetler_id");
  CREATE INDEX "ana_sayfa_icerigi_rels_uygulamalar_id_idx" ON "ana_sayfa_icerigi_rels" USING btree ("uygulamalar_id");
  CREATE INDEX "ust_bilgi_menu_ogeleri_order_idx" ON "ust_bilgi_menu_ogeleri" USING btree ("_order");
  CREATE INDEX "ust_bilgi_menu_ogeleri_parent_id_idx" ON "ust_bilgi_menu_ogeleri" USING btree ("_parent_id");
  CREATE INDEX "alt_bilgi_linkler_order_idx" ON "alt_bilgi_linkler" USING btree ("_order");
  CREATE INDEX "alt_bilgi_linkler_parent_id_idx" ON "alt_bilgi_linkler" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hizmetler_fk" FOREIGN KEY ("hizmetler_id") REFERENCES "public"."hizmetler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kullanim_alanlari_fk" FOREIGN KEY ("kullanim_alanlari_id") REFERENCES "public"."kullanim_alanlari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_islem_secenekleri_fk" FOREIGN KEY ("islem_secenekleri_id") REFERENCES "public"."islem_secenekleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_uygulamalar_fk" FOREIGN KEY ("uygulamalar_id") REFERENCES "public"."uygulamalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sss_fk" FOREIGN KEY ("sss_id") REFERENCES "public"."sss"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rehber_yazilari_fk" FOREIGN KEY ("rehber_yazilari_id") REFERENCES "public"."rehber_yazilari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sayfalar_fk" FOREIGN KEY ("sayfalar_id") REFERENCES "public"."sayfalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kampanyalar_fk" FOREIGN KEY ("kampanyalar_id") REFERENCES "public"."kampanyalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yorumlar_fk" FOREIGN KEY ("yorumlar_id") REFERENCES "public"."yorumlar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_medyalar_fk" FOREIGN KEY ("medyalar_id") REFERENCES "public"."medyalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dosyalar_fk" FOREIGN KEY ("dosyalar_id") REFERENCES "public"."dosyalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teklif_takibi_fk" FOREIGN KEY ("teklif_takibi_id") REFERENCES "public"."teklif_takibi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yonlendirmeler_fk" FOREIGN KEY ("yonlendirmeler_id") REFERENCES "public"."yonlendirmeler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_denetim_kaydi_fk" FOREIGN KEY ("denetim_kaydi_id") REFERENCES "public"."denetim_kaydi"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hizmetler_id_idx" ON "payload_locked_documents_rels" USING btree ("hizmetler_id");
  CREATE INDEX "payload_locked_documents_rels_kullanim_alanlari_id_idx" ON "payload_locked_documents_rels" USING btree ("kullanim_alanlari_id");
  CREATE INDEX "payload_locked_documents_rels_islem_secenekleri_id_idx" ON "payload_locked_documents_rels" USING btree ("islem_secenekleri_id");
  CREATE INDEX "payload_locked_documents_rels_uygulamalar_id_idx" ON "payload_locked_documents_rels" USING btree ("uygulamalar_id");
  CREATE INDEX "payload_locked_documents_rels_sss_id_idx" ON "payload_locked_documents_rels" USING btree ("sss_id");
  CREATE INDEX "payload_locked_documents_rels_rehber_yazilari_id_idx" ON "payload_locked_documents_rels" USING btree ("rehber_yazilari_id");
  CREATE INDEX "payload_locked_documents_rels_sayfalar_id_idx" ON "payload_locked_documents_rels" USING btree ("sayfalar_id");
  CREATE INDEX "payload_locked_documents_rels_kampanyalar_id_idx" ON "payload_locked_documents_rels" USING btree ("kampanyalar_id");
  CREATE INDEX "payload_locked_documents_rels_yorumlar_id_idx" ON "payload_locked_documents_rels" USING btree ("yorumlar_id");
  CREATE INDEX "payload_locked_documents_rels_medyalar_id_idx" ON "payload_locked_documents_rels" USING btree ("medyalar_id");
  CREATE INDEX "payload_locked_documents_rels_dosyalar_id_idx" ON "payload_locked_documents_rels" USING btree ("dosyalar_id");
  CREATE INDEX "payload_locked_documents_rels_teklif_takibi_id_idx" ON "payload_locked_documents_rels" USING btree ("teklif_takibi_id");
  CREATE INDEX "payload_locked_documents_rels_yonlendirmeler_id_idx" ON "payload_locked_documents_rels" USING btree ("yonlendirmeler_id");
  CREATE INDEX "payload_locked_documents_rels_denetim_kaydi_id_idx" ON "payload_locked_documents_rels" USING btree ("denetim_kaydi_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hizmetler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hizmetler_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hizmetler_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hizmetler_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kullanim_alanlari" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kullanim_alanlari_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_kullanim_alanlari_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_kullanim_alanlari_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "islem_secenekleri" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_islem_secenekleri_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "uygulamalar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "uygulamalar_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_uygulamalar_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_uygulamalar_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sss" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sss_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sss_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sss_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rehber_yazilari" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_rehber_yazilari_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sayfalar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sayfalar_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kampanyalar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_kampanyalar_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yorumlar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yorumlar_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "medyalar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dosyalar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "teklif_takibi" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yonlendirmeler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "denetim_kaydi" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_ayarlari" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ana_sayfa_icerigi_surec_adimlari" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ana_sayfa_icerigi" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ana_sayfa_icerigi_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ust_bilgi_menu_ogeleri" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ust_bilgi" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "alt_bilgi_linkler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "alt_bilgi" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "entegrasyon_ayarlari" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hizmetler" CASCADE;
  DROP TABLE "hizmetler_rels" CASCADE;
  DROP TABLE "_hizmetler_v" CASCADE;
  DROP TABLE "_hizmetler_v_rels" CASCADE;
  DROP TABLE "kullanim_alanlari" CASCADE;
  DROP TABLE "kullanim_alanlari_rels" CASCADE;
  DROP TABLE "_kullanim_alanlari_v" CASCADE;
  DROP TABLE "_kullanim_alanlari_v_rels" CASCADE;
  DROP TABLE "islem_secenekleri" CASCADE;
  DROP TABLE "_islem_secenekleri_v" CASCADE;
  DROP TABLE "uygulamalar" CASCADE;
  DROP TABLE "uygulamalar_rels" CASCADE;
  DROP TABLE "_uygulamalar_v" CASCADE;
  DROP TABLE "_uygulamalar_v_rels" CASCADE;
  DROP TABLE "sss" CASCADE;
  DROP TABLE "sss_rels" CASCADE;
  DROP TABLE "_sss_v" CASCADE;
  DROP TABLE "_sss_v_rels" CASCADE;
  DROP TABLE "rehber_yazilari" CASCADE;
  DROP TABLE "_rehber_yazilari_v" CASCADE;
  DROP TABLE "sayfalar" CASCADE;
  DROP TABLE "_sayfalar_v" CASCADE;
  DROP TABLE "kampanyalar" CASCADE;
  DROP TABLE "_kampanyalar_v" CASCADE;
  DROP TABLE "yorumlar" CASCADE;
  DROP TABLE "_yorumlar_v" CASCADE;
  DROP TABLE "medyalar" CASCADE;
  DROP TABLE "dosyalar" CASCADE;
  DROP TABLE "teklif_takibi" CASCADE;
  DROP TABLE "yonlendirmeler" CASCADE;
  DROP TABLE "denetim_kaydi" CASCADE;
  DROP TABLE "site_ayarlari" CASCADE;
  DROP TABLE "ana_sayfa_icerigi_surec_adimlari" CASCADE;
  DROP TABLE "ana_sayfa_icerigi" CASCADE;
  DROP TABLE "ana_sayfa_icerigi_rels" CASCADE;
  DROP TABLE "ust_bilgi_menu_ogeleri" CASCADE;
  DROP TABLE "ust_bilgi" CASCADE;
  DROP TABLE "alt_bilgi_linkler" CASCADE;
  DROP TABLE "alt_bilgi" CASCADE;
  DROP TABLE "entegrasyon_ayarlari" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hizmetler_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kullanim_alanlari_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_islem_secenekleri_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_uygulamalar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sss_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rehber_yazilari_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sayfalar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kampanyalar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_yorumlar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_medyalar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_dosyalar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_teklif_takibi_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_yonlendirmeler_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_denetim_kaydi_fk";
  
  DROP INDEX "payload_locked_documents_rels_hizmetler_id_idx";
  DROP INDEX "payload_locked_documents_rels_kullanim_alanlari_id_idx";
  DROP INDEX "payload_locked_documents_rels_islem_secenekleri_id_idx";
  DROP INDEX "payload_locked_documents_rels_uygulamalar_id_idx";
  DROP INDEX "payload_locked_documents_rels_sss_id_idx";
  DROP INDEX "payload_locked_documents_rels_rehber_yazilari_id_idx";
  DROP INDEX "payload_locked_documents_rels_sayfalar_id_idx";
  DROP INDEX "payload_locked_documents_rels_kampanyalar_id_idx";
  DROP INDEX "payload_locked_documents_rels_yorumlar_id_idx";
  DROP INDEX "payload_locked_documents_rels_medyalar_id_idx";
  DROP INDEX "payload_locked_documents_rels_dosyalar_id_idx";
  DROP INDEX "payload_locked_documents_rels_teklif_takibi_id_idx";
  DROP INDEX "payload_locked_documents_rels_yonlendirmeler_id_idx";
  DROP INDEX "payload_locked_documents_rels_denetim_kaydi_id_idx";
  ALTER TABLE "hizmet_bolgeleri" ALTER COLUMN "sira" DROP DEFAULT;
  ALTER TABLE "hizmet_bolgeleri" DROP COLUMN "hedef_kapsam";
  ALTER TABLE "hizmet_bolgeleri" DROP COLUMN "operasyon_teyidi";
  ALTER TABLE "hizmet_bolgeleri" DROP COLUMN "detay_sayfasi_yayinla";
  ALTER TABLE "hizmet_bolgeleri" DROP COLUMN "ozgun_icerik";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hizmetler_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kullanim_alanlari_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "islem_secenekleri_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "uygulamalar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sss_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rehber_yazilari_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sayfalar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kampanyalar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "yorumlar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "medyalar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "dosyalar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "teklif_takibi_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "yonlendirmeler_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "denetim_kaydi_id";
  ALTER TABLE "iletisim_bilgileri" DROP COLUMN "adres";
  ALTER TABLE "iletisim_bilgileri" DROP COLUMN "adres_onayli";
  ALTER TABLE "iletisim_bilgileri" DROP COLUMN "calisma_saatleri";
  ALTER TABLE "iletisim_bilgileri" DROP COLUMN "saatler_onayli";
  ALTER TABLE "iletisim_bilgileri" DROP COLUMN "dahili_not";
  DROP TYPE "public"."enum_hizmetler_dogrulama_durumu";
  DROP TYPE "public"."enum_hizmetler_status";
  DROP TYPE "public"."enum__hizmetler_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__hizmetler_v_version_status";
  DROP TYPE "public"."enum_kullanim_alanlari_dogrulama_durumu";
  DROP TYPE "public"."enum_kullanim_alanlari_status";
  DROP TYPE "public"."enum__kullanim_alanlari_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__kullanim_alanlari_v_version_status";
  DROP TYPE "public"."enum_islem_secenekleri_tur";
  DROP TYPE "public"."enum_islem_secenekleri_sunum_durumu";
  DROP TYPE "public"."enum_islem_secenekleri_dogrulama_durumu";
  DROP TYPE "public"."enum_islem_secenekleri_status";
  DROP TYPE "public"."enum__islem_secenekleri_v_version_tur";
  DROP TYPE "public"."enum__islem_secenekleri_v_version_sunum_durumu";
  DROP TYPE "public"."enum__islem_secenekleri_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__islem_secenekleri_v_version_status";
  DROP TYPE "public"."enum_uygulamalar_dogrulama_durumu";
  DROP TYPE "public"."enum_uygulamalar_status";
  DROP TYPE "public"."enum__uygulamalar_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__uygulamalar_v_version_status";
  DROP TYPE "public"."enum_sss_dogrulama_durumu";
  DROP TYPE "public"."enum_sss_status";
  DROP TYPE "public"."enum__sss_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__sss_v_version_status";
  DROP TYPE "public"."enum_rehber_yazilari_dogrulama_durumu";
  DROP TYPE "public"."enum_rehber_yazilari_status";
  DROP TYPE "public"."enum__rehber_yazilari_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__rehber_yazilari_v_version_status";
  DROP TYPE "public"."enum_sayfalar_dogrulama_durumu";
  DROP TYPE "public"."enum_sayfalar_status";
  DROP TYPE "public"."enum__sayfalar_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__sayfalar_v_version_status";
  DROP TYPE "public"."enum_kampanyalar_dogrulama_durumu";
  DROP TYPE "public"."enum_kampanyalar_status";
  DROP TYPE "public"."enum__kampanyalar_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__kampanyalar_v_version_status";
  DROP TYPE "public"."enum_yorumlar_dogrulama_durumu";
  DROP TYPE "public"."enum_yorumlar_status";
  DROP TYPE "public"."enum__yorumlar_v_version_dogrulama_durumu";
  DROP TYPE "public"."enum__yorumlar_v_version_status";
  DROP TYPE "public"."enum_medyalar_dogrulama_durumu";
  DROP TYPE "public"."enum_dosyalar_dogrulama_durumu";
  DROP TYPE "public"."enum_teklif_takibi_durum";`)
}
