import { presignGet } from '@/server/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { key } = (await request.json()) as { key: string };

  const url = await presignGet(key);

  return NextResponse.json({ url });
}
