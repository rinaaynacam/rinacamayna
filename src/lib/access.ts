import type { Access, CollectionBeforeChangeHook, FieldAccess, Where } from 'payload';

export const signedIn: Access = ({ req }) => Boolean(req.user);
export const adminOnly: Access = ({ req }) => req.user?.role === 'admin';
export const adminField: FieldAccess = ({ req }) => req.user?.role === 'admin';
export const staffField: FieldAccess = ({ req }) => Boolean(req.user);

export const publishedAndApproved: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: 'published' } } as Where;
};

function isDraftWrite(data: Record<string, unknown> | undefined, url?: string) {
  if (data?._status === 'draft') return true;
  if (!url) return false;
  return new URL(url).searchParams.get('draft') === 'true';
}

export const editorCannotPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!req.user || req.user.role === 'admin') return data;
  if (!isDraftWrite(data, req.url)) {
    throw new Error('Yalnız yöneticiler içerik yayınlayabilir veya yayınlanmış içeriği değiştirebilir.');
  }
  return { ...data, _status: 'draft' };
};
