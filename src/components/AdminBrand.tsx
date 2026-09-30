const imageStyle = { display: 'block', height: 'auto', objectFit: 'contain' as const };

export function AdminLogo() {
  return <div aria-label="Mebalci" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/admin/mebalci.webp" alt="Mebalci" width="480" height="304" style={{ ...imageStyle, width: 180 }} />
  </div>;
}

export function AdminIcon() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/admin/mebalci-icon.webp" alt="Mebalci" width="42" height="42" style={{ ...imageStyle, width: 42 }} />;
}
