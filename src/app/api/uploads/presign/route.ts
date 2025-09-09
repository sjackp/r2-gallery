import { presignPut } from '@/server/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { files } = (await request.json()) as { files: { key: string; contentType: string; size: number }[] };

  const urls = await Promise.all(
    files.map((file: { key: string; contentType: string; size: number }) => {
      return presignPut(file.key, file.contentType, file.size);
    })
  );

  return NextResponse.json({ urls });
}
