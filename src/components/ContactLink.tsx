'use client';

import type { Contact } from '@/lib/contact';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { buildWhatsAppLink } from '../../baslangic-modulleri/whatsapp.mjs';
export function ContactLink({ contact, className = '', label }: { contact: Contact; className?: string; label?: string | null }) {
  const link = buildWhatsAppLink(contact.number, contact.message);
  return <a className={`button ${className}`} href={link.href} target="_blank" rel="noopener noreferrer"
    onClick={() => trackAnalyticsEvent('whatsapp_click')}>{label || contact.label}<span aria-hidden="true">↗</span></a>;
}
