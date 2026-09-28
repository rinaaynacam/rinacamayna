'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Medyalar } from '@/payload-types';
import { CmsImage, mediaValue } from './CmsImage';

const formatDate = (value: string) => new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit', month: 'long', year: 'numeric',
}).format(new Date(value));

export function CampaignPopup({ title, summary, startsAt, endsAt, image, children }: {
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  image?: number | Medyalar | null;
  children?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const campaignImage = mediaValue(image);
  return <dialog open={isOpen} suppressHydrationWarning className={`campaign-popup ${campaignImage ? 'has-image' : 'no-image'}`} aria-labelledby="campaign-popup-title">
    <div className={`campaign-popup-shell ${campaignImage ? 'has-image' : 'no-image'}`}>
      <div className="campaign-popup-close-wrap"><button type="button" className="campaign-popup-close" onClick={() => setIsOpen(false)}><span aria-hidden="true">×</span><span className="sr-only">Kampanyayı kapat</span></button></div>
      <div className="campaign-popup-copy">
        <p className="eyebrow">KAMPANYA / {formatDate(startsAt)}–{formatDate(endsAt)}</p>
        <h2 id="campaign-popup-title">{title}</h2>
        <p>{summary}</p>
        {children && <div className="campaign-popup-conditions"><strong>Koşullar</strong>{children}</div>}
      </div>
      {campaignImage && <div className="campaign-popup-image"><CmsImage media={campaignImage} sizes="620px" /></div>}
    </div>
  </dialog>;
}
