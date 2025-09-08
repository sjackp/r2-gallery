import { presignGet } from '@/server/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { keys } = await request.json();

  const publicBase = process.env.CLOUDFLARE_BUCKET_URL;
  if (publicBase) {
    const normalizedBase = publicBase.replace(/\/$/, '');
    const links = (keys as string[]).map((key) => {
      const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
      return `${normalizedBase}/${encodedKey}`;
    });
    return NextResponse.json({ mode: 'public', links });
  }

  const links = await Promise.all(
    keys.map((key: string) => {
      return presignGet(key);
    })
  );

  return NextResponse.json({ mode: 'signed', links });
}
