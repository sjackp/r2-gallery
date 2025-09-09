import { NextRequest, NextResponse } from 'next/server';
import { objectExists } from '@/server/r2';

export async function POST(request: NextRequest) {
  try {
    const { keys } = (await request.json()) as { keys: string[] };
    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'keys must be an array' }, { status: 400 });
    }
    const map: Record<string, boolean> = {};
    await Promise.all(
      keys.map(async (k: string) => {
        const exists = await objectExists(k);
        map[k] = exists;
      })
    );
    return NextResponse.json({ exists: map });
  } catch (error: any) {
    console.error('exists check failed:', error);
    return NextResponse.json({ error: error?.message || 'exists check failed' }, { status: 500 });
  }
}

