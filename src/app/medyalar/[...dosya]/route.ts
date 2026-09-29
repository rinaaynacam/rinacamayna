import { servePublicR2Object } from '@/lib/public-r2';

type Context = { params: Promise<{ dosya: string[] }> };

export async function GET(request: Request, { params }: Context) {
  return servePublicR2Object(request, 'medyalar', (await params).dosya);
}

export async function HEAD(request: Request, { params }: Context) {
  return servePublicR2Object(request, 'medyalar', (await params).dosya, true);
}
