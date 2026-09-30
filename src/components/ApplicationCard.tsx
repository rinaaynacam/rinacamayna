import Link from 'next/link';
import type { Uygulamalar } from '@/payload-types';
import { CmsImage, mediaValue } from './CmsImage';

export function ApplicationCard({ application, index = 0, priority = false }: {
  application: Uygulamalar;
  index?: number;
  priority?: boolean;
}) {
  const image = (application.gorseller ?? []).map(mediaValue).find(Boolean);
  if (!image) return null;
  return <Link className="application-gallery-card" href={`/uygulamalar/${application.slug}`}>
    <article>
      <div className="application-gallery-image"><CmsImage media={image} priority={priority} sizes="(max-width: 780px) 100vw, (max-width: 1100px) 50vw, 33vw" /></div>
      <div className="application-gallery-copy">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')} / {application.kullanim || 'UYGULAMA'}</p>
        <h2>{application.ad}</h2>
        <p>{application.ozet}</p>
        {(application.malzeme || application.islem) && <dl>
          {application.malzeme && <><dt>Malzeme</dt><dd>{application.malzeme}</dd></>}
          {application.islem && <><dt>İşlem</dt><dd>{application.islem}</dd></>}
        </dl>}
        <b className="application-card-link">Detayları inceleyin <span aria-hidden="true">↗</span></b>
      </div>
    </article>
  </Link>;
}
