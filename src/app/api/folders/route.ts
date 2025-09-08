import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/server/r2';

// Create a zero-byte "folder" marker under parentPrefix
export async function POST(request: NextRequest) {
  try {
    const { parentPrefix = '', name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing folder name' }, { status: 400 });
    }

    // Basic normalization and validation
    const cleanedParent = String(parentPrefix || '').replace(/^\/+|\/+/g, (m) => (m === '/' ? '' : '/'));
    const trimmed = name.trim().replace(/^\/+|\/+$/g, '');
    if (!trimmed) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }
    if (trimmed.includes('..')) {
      return NextResponse.json({ error: 'Invalid characters in name' }, { status: 400 });
    }

    const fullPrefix = (cleanedParent ? `${cleanedParent.replace(/\/+$/,'')}/` : '') + `${trimmed}/`;

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
      Key: fullPrefix,
      Body: new Uint8Array(),
      ContentType: 'application/x-directory',
    });

    await s3Client.send(command);

    return NextResponse.json({ ok: true, prefix: fullPrefix });
  } catch (error: any) {
    console.error('Create folder failed:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create folder' }, { status: 500 });
  }
}

