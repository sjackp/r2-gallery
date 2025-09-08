import { NextRequest } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/server/r2';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
      Key: key,
    });
    const result = await s3Client.send(command);

    const filename = key.split('/').pop() || 'file';
    const headers: Record<string, string> = {
      'Content-Type': result.ContentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    };
    if (typeof result.ContentLength === 'number') {
      headers['Content-Length'] = String(result.ContentLength);
    }

    let responseBody: any = result.Body as any;
    // Convert Node.js Readable to Web ReadableStream if necessary
    if (responseBody && typeof (responseBody as any).pipe === 'function' && typeof (Readable as any).toWeb === 'function') {
      try {
        responseBody = (Readable as any).toWeb(responseBody);
      } catch {}
    }

    return new Response(responseBody, { headers });
  } catch (error: any) {
    const message = error?.message || 'Download failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}


