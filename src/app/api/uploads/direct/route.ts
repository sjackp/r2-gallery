import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/server/r2';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const files = form.getAll('file') as File[];
    const keys = (form.getAll('key') as string[]).map((k) => k.replace(/^\/+/, ''));

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (keys.length !== files.length) {
      return NextResponse.json({ error: 'Mismatched keys/files' }, { status: 400 });
    }

    const bucket = process.env.CLOUDFLARE_BUCKETNAME!;

    await Promise.all(
      files.map(async (file, idx) => {
        const key = keys[idx];
        const arrayBuffer = await file.arrayBuffer();
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type || 'application/octet-stream',
          ContentLength: file.size,
        });
        await s3Client.send(command);
      })
    );

    return NextResponse.json({ uploaded: keys });
  } catch (error: any) {
    console.error('Direct upload failed:', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}



