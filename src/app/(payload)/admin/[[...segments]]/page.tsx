import config from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import { notFound } from 'next/navigation';
import { importMap } from '../importMap.js';
import { AdminLogin } from '@/components/AdminLogin';
type Props = { params: Promise<{ segments: string[] }>; searchParams: Promise<{ [key: string]: string | string[] }> };
export const generateMetadata = ({ params, searchParams }: Props) => generatePageMetadata({ config, params, searchParams });
export default async function Page({ params, searchParams }: Props) {
  const { segments = [] } = await params;
  if (segments.some(segment => ['create-first-user', 'forgot', 'reset'].includes(segment))) notFound();
  if (segments.length === 1 && segments[0] === 'login') return <AdminLogin />;
  return RootPage({ config, params, searchParams, importMap });
}
