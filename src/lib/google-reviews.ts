import { getPayload } from 'payload';
import config from '../payload.config';

const requiredKeys = [
  'GOOGLE_BUSINESS_ACCOUNT_ID', 'GOOGLE_BUSINESS_LOCATION_ID', 'GOOGLE_BUSINESS_CLIENT_ID',
  'GOOGLE_BUSINESS_CLIENT_SECRET', 'GOOGLE_BUSINESS_REFRESH_TOKEN',
] as const;

type GoogleConfig = Record<(typeof requiredKeys)[number], string>;
type GoogleReview = { reviewId?: string; comment?: string; starRating?: string; reviewer?: { displayName?: string } };

export function googleReviewConfig(source: NodeJS.ProcessEnv = process.env): GoogleConfig | null {
  if (!requiredKeys.every(key => source[key]?.trim())) return null;
  return Object.fromEntries(requiredKeys.map(key => [key, source[key]!.trim()])) as GoogleConfig;
}

export async function syncGoogleReviews(source: NodeJS.ProcessEnv = process.env) {
  const settings = googleReviewConfig(source);
  if (!settings) throw new Error('Google Business Profile ortam ayarları eksik.');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: settings.GOOGLE_BUSINESS_CLIENT_ID,
      client_secret: settings.GOOGLE_BUSINESS_CLIENT_SECRET,
      refresh_token: settings.GOOGLE_BUSINESS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenResponse.ok) throw new Error(`Google OAuth yenilemesi başarısız: HTTP ${tokenResponse.status}`);
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) throw new Error('Google OAuth yanıtında erişim anahtarı bulunamadı.');

  const account = settings.GOOGLE_BUSINESS_ACCOUNT_ID.replace(/^accounts\//, '');
  const location = settings.GOOGLE_BUSINESS_LOCATION_ID.replace(/^locations\//, '');
  const starMap: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  const reviews: GoogleReview[] = [];
  let pageToken = '';
  do {
    const endpoint = new URL(`https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews`);
    endpoint.searchParams.set('pageSize', '50');
    endpoint.searchParams.set('orderBy', 'updateTime desc');
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!response.ok) throw new Error(`Google yorumları alınamadı: HTTP ${response.status}`);
    const data = await response.json() as { reviews?: GoogleReview[]; nextPageToken?: string };
    reviews.push(...(data.reviews ?? []));
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);

  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;
  let skipped = 0;
  try {
    for (const review of reviews) {
      const externalId = review.reviewId?.trim();
      const comment = review.comment?.trim();
      const name = review.reviewer?.displayName?.trim();
      if (!externalId || !comment || !name || !starMap[review.starRating ?? '']) { skipped += 1; continue; }
      const found = await payload.find({
        collection: 'yorumlar', overrideAccess: true, limit: 1,
        where: { harici_kimlik: { equals: externalId } },
      });
      const existing = found.docs[0];
      const data = {
        gostergelik_ad: name.slice(0, 180), yorum: comment.slice(0, 1000), puan: starMap[review.starRating!],
        kaynak: 'Google', harici_kimlik: externalId,
        sitede_goster: existing?.sitede_goster ?? false,
        sira: existing?.sira ?? 100,
        _status: existing?._status ?? 'draft' as const,
      };
      if (existing) {
        await payload.update({ collection: 'yorumlar', id: existing.id, overrideAccess: true, draft: data._status === 'draft', data });
        updated += 1;
      } else {
        await payload.create({ collection: 'yorumlar', overrideAccess: true, draft: true, data });
        created += 1;
      }
    }
    return { received: reviews.length, created, updated, skipped };
  } finally {
    await payload.destroy();
  }
}
