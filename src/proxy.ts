import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.toLowerCase().replace(/\/+$/, '');
  if (/\/api\/yoneticiler\/(first-register|forgot-password|reset-password)$/.test(pathname)) {
    return NextResponse.json({ error: 'Bu işlem kapalı.' }, { status: 404 });
  }
  // MFA acceptance is outstanding: never expose a password-only panel outside local development.
  if (process.env.APP_ENV !== 'development' && (pathname.startsWith('/admin') || pathname.startsWith('/api/yoneticiler'))) {
    return NextResponse.json({ error: 'Yönetim erişimi henüz yayına açılmadı.' }, { status: 503 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/api/yoneticiler/:path*'] };
