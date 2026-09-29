import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Script from 'next/script';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { canonical } from '@/lib/env.mjs';
import { CampaignPopup } from '@/components/CampaignPopup';
import { absoluteMediaURL, mediaPath, mediaValue } from '@/components/CmsImage';
import { StructuredData } from '@/components/StructuredData';
import { getActiveCampaign } from '@/lib/cms';
import { getContact } from '@/lib/contact';
import { getPayload } from 'payload';
import config from '@payload-config';
import './styles.css';

const safeColor = (value: string | null | undefined, fallback: string) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') ? value as string : fallback;
const hexChannels = (value: string) => [1, 3, 5].map(index => Number.parseInt(value.slice(index, index + 2), 16));
const luminance = (value: string) => {
  const channels = hexChannels(value).map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (first: string, second: string) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
const mix = (first: string, second: string, amount: number) => {
  const a = hexChannels(first);
  const b = hexChannels(second);
  return `#${a.map((channel, index) => Math.round(channel * (1 - amount) + b[index] * amount).toString(16).padStart(2, '0')).join('')}`;
};
const accessibleAccent = (accent: string, paper: string, ink: string) => {
  if (contrast(accent, paper) >= 4.5) return accent;
  for (let amount = 0.05; amount <= 1; amount += 0.05) {
    const candidates = [mix(accent, ink, amount), mix(accent, '#000000', amount), mix(accent, '#ffffff', amount)];
    const candidate = candidates.find(value => contrast(value, paper) >= 4.5);
    if (candidate) return candidate;
  }
  return contrast('#000000', paper) >= contrast('#ffffff', paper) ? '#000000' : '#ffffff';
};

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config });
  const [site, integrations] = await Promise.all([
    payload.findGlobal({ slug: 'site_ayarlari', depth: 1, overrideAccess: false }),
    payload.findGlobal({ slug: 'entegrasyon_ayarlari', depth: 0, overrideAccess: false }),
  ]);
  const indexing = process.env.APP_ENV === 'production' && process.env.INDEXING_ENABLED === 'true';
  const share = site.seo?.paylasim_gorseli;
  const shareObject = share && typeof share === 'object' ? share : null;
  const shareURL = absoluteMediaURL(shareObject, canonical);
  const faviconMedia = mediaValue(site.favicon) ?? mediaValue(site.logo);
  const faviconPath = mediaPath(faviconMedia);
  const favicon = faviconPath
    ? `${faviconPath}${faviconPath.includes('?') ? '&' : '?'}v=${encodeURIComponent(faviconMedia?.updatedAt ?? '1')}`
    : '/icon.svg';
  return {
    metadataBase: new URL(canonical),
    title: site.seo?.baslik || site.firma_adi,
    description: site.seo?.aciklama || site.kisa_aciklama,
    alternates: { canonical: '/' },
    robots: { index: indexing, follow: indexing },
    icons: { icon: favicon, shortcut: favicon },
    openGraph: shareURL ? { images: [{ url: shareURL, alt: shareObject?.alt || site.firma_adi }] } : undefined,
    verification: integrations.search_console_dogrulama && /^[A-Za-z0-9_-]{10,200}$/.test(integrations.search_console_dogrulama)
      ? { google: integrations.search_console_dogrulama } : undefined,
  };
}
export default async function Layout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config });
  const [site, integrations, campaign, contact] = await Promise.all([
    payload.findGlobal({ slug: 'site_ayarlari', depth: 1, overrideAccess: false }),
    payload.findGlobal({ slug: 'entegrasyon_ayarlari', depth: 0, overrideAccess: false }),
    getActiveCampaign(),
    getContact(),
  ]);
  const analyticsID = integrations.analytics_aktif && /^G-[A-Z0-9]{6,20}$/.test(integrations.analytics_kimligi ?? '')
    ? integrations.analytics_kimligi : null;
  const paper = safeColor(site.renkler?.zemin, '#e9eef1');
  const ink = safeColor(site.renkler?.metin, '#172126');
  const accent = safeColor(site.renkler?.vurgu, '#ff6254');
  const theme = {
    '--paper': paper,
    '--ink': ink,
    '--accent': accent,
    '--accent-text': accessibleAccent(accent, paper, ink),
    '--line': safeColor(site.renkler?.cizgi, '#8d9da5'),
    '--form': safeColor(site.renkler?.form_zemini, '#d9e4e9'),
    '--white': safeColor(site.renkler?.acik_metin, '#f7fafb'),
  } as CSSProperties;
  const logo = absoluteMediaURL(site.logo, canonical) ?? undefined;
  const businessSchema = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': `${canonical}/#isletme`,
    name: site.firma_adi, url: canonical, description: site.kisa_aciklama,
    telephone: `+${contact.number}`, image: logo,
    areaServed: { '@type': 'AdministrativeArea', name: 'Ankara' },
    ...(contact.address ? { address: { '@type': 'PostalAddress', streetAddress: contact.address, addressLocality: 'Ankara', addressCountry: 'TR' } } : {}),
  };
  const websiteSchema = {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${canonical}/#website`,
    name: site.firma_adi, url: canonical, inLanguage: 'tr-TR',
    publisher: { '@id': `${canonical}/#isletme` },
  };
  return <html lang="tr"><body style={theme}><StructuredData data={[businessSchema, websiteSchema]} /><a className="skip" href="#icerik">İçeriğe geç</a>{children}{campaign && <CampaignPopup
    title={campaign.baslik}
    summary={campaign.ozet}
    startsAt={campaign.baslangic}
    endsAt={campaign.bitis}
    image={campaign.gorsel}
  >{campaign.kosullar && <RichText data={campaign.kosullar} />}</CampaignPopup>}{analyticsID && <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsID}`} strategy="afterInteractive" />
    <Script id="rina-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analyticsID}',{anonymize_ip:true});`}</Script>
  </>}</body></html>;
}


