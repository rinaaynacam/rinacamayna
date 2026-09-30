'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function PendingReviewsBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const response = await fetch('/api/yorumlar?where[_status][equals]=draft&where[sitede_goster][equals]=false&limit=1&depth=0', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      }).catch(() => null);
      if (!response?.ok) return;
      const data = await response.json() as { totalDocs?: number };
      if (active) setCount(Math.max(0, Number(data.totalDocs) || 0));
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  if (!count) return null;
  return <Link href="/admin/collections/yorumlar" style={{
    alignItems: 'center', background: '#ff6254', color: '#172126', display: 'flex',
    fontWeight: 700, justifyContent: 'space-between', margin: '0 0 12px', padding: '10px 12px', textDecoration: 'none',
  }}>
    <span>Yeni yorumlar</span><span aria-label={`${count} bekleyen yorum`}>{count}</span>
  </Link>;
}
