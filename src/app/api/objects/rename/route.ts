import { copyObject, deleteObjects } from '@/server/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { sourceKey, targetKey } = await request.json();

  await copyObject(sourceKey, targetKey);
  await deleteObjects([sourceKey]);

  return NextResponse.json({ ok: true });
}
