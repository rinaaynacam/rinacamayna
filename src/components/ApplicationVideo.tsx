function embedURL(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (['youtube.com', 'www.youtube.com'].includes(url.hostname)) {
      const id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {}
  return null;
}

export function ApplicationVideo({ url, title }: { url: string; title: string }) {
  const embed = embedURL(url);
  if (embed) return <div className="application-video"><iframe src={embed} title={`${title} videosu`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
  return <div className="application-video"><video controls preload="metadata" aria-label={`${title} videosu`}><source src={url} /></video></div>;
}
