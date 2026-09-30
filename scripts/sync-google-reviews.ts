import { syncGoogleReviews } from '../src/lib/google-reviews';

if (process.env.APP_ENV !== 'production') throw new Error('Google yorum senkronizasyonu yalnız production ortamında çalıştırılabilir.');
console.log(JSON.stringify(await syncGoogleReviews()));
process.exit(0);
