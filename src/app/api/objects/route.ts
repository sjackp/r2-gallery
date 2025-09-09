import { listObjects, deleteObjects } from '@/server/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix') || undefined;
  const continuationToken = searchParams.get('continuationToken') || undefined;
  const max = searchParams.get('limit');
  const maxKeys = max ? parseInt(max, 10) : undefined;

  const data = await listObjects(prefix, continuationToken, maxKeys);

  console.log('API route /api/objects GET handler - data:', data);

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const { keys } = (await request.json()) as { keys: string[] };

  const data = await deleteObjects(keys);

  return NextResponse.json(data);
}
