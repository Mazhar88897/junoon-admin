// app/page.tsx or app/redirect.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth');
  }, [router]);

  return <p>Redirecting to auth...</p>;
}
