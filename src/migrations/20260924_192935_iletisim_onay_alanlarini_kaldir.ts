import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "iletisim_bilgileri" DROP COLUMN "adres_onayli";
  ALTER TABLE "iletisim_bilgileri" DROP COLUMN "saatler_onayli";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "iletisim_bilgileri" ADD COLUMN "adres_onayli" boolean DEFAULT false;
  ALTER TABLE "iletisim_bilgileri" ADD COLUMN "saatler_onayli" boolean DEFAULT false;`)
}
