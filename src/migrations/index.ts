import * as migration_20260924_122933 from './20260924_122933';
import * as migration_20260924_132338 from './20260924_132338';
import * as migration_20260924_132818 from './20260924_132818';
import * as migration_20260924_192633_panel_sadelestirme from './20260924_192633_panel_sadelestirme';
import * as migration_20260924_192935_iletisim_onay_alanlarini_kaldir from './20260924_192935_iletisim_onay_alanlarini_kaldir';
import * as migration_20260925_095722_panel_ve_icerik_sadelestirme from './20260925_095722_panel_ve_icerik_sadelestirme';
import * as migration_20260925_101426_site_renkleri from './20260925_101426_site_renkleri';
import * as migration_20260925_104413_kampanya_popup from './20260925_104413_kampanya_popup';
import * as migration_20260929_201745_r2_storage_fields from './20260929_201745_r2_storage_fields';

export const migrations = [
  {
    up: migration_20260924_122933.up,
    down: migration_20260924_122933.down,
    name: '20260924_122933',
  },
  {
    up: migration_20260924_132338.up,
    down: migration_20260924_132338.down,
    name: '20260924_132338',
  },
  {
    up: migration_20260924_132818.up,
    down: migration_20260924_132818.down,
    name: '20260924_132818',
  },
  {
    up: migration_20260924_192633_panel_sadelestirme.up,
    down: migration_20260924_192633_panel_sadelestirme.down,
    name: '20260924_192633_panel_sadelestirme',
  },
  {
    up: migration_20260924_192935_iletisim_onay_alanlarini_kaldir.up,
    down: migration_20260924_192935_iletisim_onay_alanlarini_kaldir.down,
    name: '20260924_192935_iletisim_onay_alanlarini_kaldir',
  },
  {
    up: migration_20260925_095722_panel_ve_icerik_sadelestirme.up,
    down: migration_20260925_095722_panel_ve_icerik_sadelestirme.down,
    name: '20260925_095722_panel_ve_icerik_sadelestirme',
  },
  {
    up: migration_20260925_101426_site_renkleri.up,
    down: migration_20260925_101426_site_renkleri.down,
    name: '20260925_101426_site_renkleri',
  },
  {
    up: migration_20260925_104413_kampanya_popup.up,
    down: migration_20260925_104413_kampanya_popup.down,
    name: '20260925_104413_kampanya_popup',
  },
  {
    up: migration_20260929_201745_r2_storage_fields.up,
    down: migration_20260929_201745_r2_storage_fields.down,
    name: '20260929_201745_r2_storage_fields'
  },
];
