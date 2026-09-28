import type { Contact } from '@/lib/contact';
import { buildWhatsAppLink } from '../../baslangic-modulleri/whatsapp.mjs';
export function ContactLink({ contact, className = '', label }: { contact: Contact; className?: string; label?: string | null }) {
  const link = buildWhatsAppLink(contact.number, contact.message);
  return <a className={`button ${className}`} href={link.href} target="_blank" rel="noopener noreferrer">{label || contact.label}<span aria-hidden="true">↗</span></a>;
}
