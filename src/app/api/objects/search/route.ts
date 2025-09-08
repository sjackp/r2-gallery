import { listObjects } from '@/server/r2';
import { NextRequest, NextResponse } from 'next/server';

// Global search by key substring. Paginates across R2 up to a cap.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const limitParam = searchParams.get('limit');
  const hardLimit = limitParam ? Math.max(1, Math.min(10000, parseInt(limitParam, 10))) : 1000;

  if (!q) return NextResponse.json({ Contents: [] });

  let continuationToken: string | undefined = undefined;
  const results: any[] = [];

  // Fetch pages until we reach the hardLimit or exhaust the bucket
  while (results.length < hardLimit) {
    const page = await listObjects(undefined, continuationToken, 1000, false);
    const contents = page.Contents || [];
    for (const obj of contents) {
      const key = (obj.Key || '').toLowerCase();
      if (key.includes(q)) results.push(obj);
      if (results.length >= hardLimit) break;
    }
    if (!page.IsTruncated || !page.NextContinuationToken) break;
    continuationToken = page.NextContinuationToken;
  }

  return NextResponse.json({ Contents: results });
}








