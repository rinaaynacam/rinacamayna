import { googleReviewConfig, syncGoogleReviews } from '../../src/lib/google-reviews';

async function syncGoogleReviewsScheduled() {
  if (!googleReviewConfig()) {
    console.log('Google yorum senkronizasyonu ortam ayarları girilmediği için pasif.');
    return new Response(null, { status: 204 });
  }
  try {
    console.log(JSON.stringify(await syncGoogleReviews()));
    return new Response(null, { status: 204 });
  } catch {
    console.error('Google yorum senkronizasyonu başarısız.');
    return new Response(null, { status: 500 });
  }
}

export default syncGoogleReviewsScheduled;

export const config = { schedule: '0 2 * * *' };
