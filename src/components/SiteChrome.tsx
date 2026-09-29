import Link from 'next/link';
import type { AltBilgi, SiteAyarlari, UstBilgi } from '@/payload-types';
import type { Contact } from '@/lib/contact';
import { buildWhatsAppLink, formatTrWhatsAppNumber } from '../../baslangic-modulleri/whatsapp.mjs';
import { CmsImage, mediaValue } from './CmsImage';
import { ContactLink } from './ContactLink';

function siteHref(value: string) {
  return value.startsWith('#') ? `/${value}` : value;
}

function SiteBrand({ site }: { site: SiteAyarlari }) {
  const logo = mediaValue(site.logo);
  return <Link href="/" className={`brand ${logo ? 'has-brand-mark' : ''}`}>
    {logo ? <span className="brand-mark"><CmsImage media={logo} sizes="64px" /></span> : <strong>{site.marka_kisa}</strong>}
    <span>{site.marka_alt}</span>
  </Link>;
}

export function SiteHeader({ site, header, contact }: {
  site: SiteAyarlari;
  header: UstBilgi;
  contact: Contact;
}) {
  const whatsapp = buildWhatsAppLink(contact.number, contact.message);
  return <header className="site-header">
    <SiteBrand site={site} />
    <nav aria-label="Ana menü">
      {(header.menu_ogeleri ?? []).map(item => <Link key={item.id ?? item.baglanti} href={siteHref(item.baglanti)}>{item.etiket}</Link>)}
    </nav>
    {header.cta_gorunsun && <a className="header-contact" href={whatsapp.href} target="_blank" rel="noopener noreferrer">
      <span>WHATSAPP</span><strong>{formatTrWhatsAppNumber(contact.number)}</strong>
    </a>}
  </header>;
}

export function SiteFooter({ site, footer, contact }: {
  site: SiteAyarlari;
  footer: AltBilgi;
  contact: Contact;
}) {
  const mapsHref = contact.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`
    : null;
  return <>
    <footer>
      <div className="footer-brand-block">
        <SiteBrand site={site} />
        {footer.metin && <p>{footer.metin}</p>}
      </div>
      {(contact.address || contact.hours) && <address className="footer-contact-details">
        {contact.address && mapsHref && <div><span className="footer-label">ADRES</span><a className="footer-address" href={mapsHref} target="_blank" rel="noopener noreferrer">{contact.address}<span aria-hidden="true">↗</span></a></div>}
        {contact.hours && <div><span className="footer-label">ÇALIŞMA SAATLERİ</span><p>{contact.hours}</p></div>}
      </address>}
      <nav className="footer-navigation" aria-label="Alt bilgi bağlantıları">
        <span className="footer-label">SİTE</span>
        <div className="footer-links">{(footer.linkler ?? []).map(item => <Link key={item.id ?? item.baglanti} href={siteHref(item.baglanti)}>{item.etiket}</Link>)}</div>
        <ContactLink contact={contact} />
      </nav>
    </footer>
    <div className="mobile-cta"><ContactLink contact={contact} /></div>
  </>;
}
