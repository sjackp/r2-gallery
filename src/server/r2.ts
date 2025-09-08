import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ENDPOINT = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const s3Client = new S3Client({
  region: process.env.CLOUDFLARE_REGION || 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

console.log('S3 Client Configured:', { 
  region: process.env.CLOUDFLARE_REGION || 'auto',
  endpoint: R2_ENDPOINT,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY ? 'Loaded' : 'Not Loaded',
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ? 'Loaded' : 'Not Loaded',
});

export async function listObjects(prefix?: string, continuationToken?: string, maxKeys?: number, useDelimiter: boolean = true) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
    Prefix: prefix,
    ContinuationToken: continuationToken,
    Delimiter: useDelimiter ? '/' : undefined,
    MaxKeys: maxKeys,
  });

  console.log('Listing objects with prefix:', prefix, 'and continuation token:', continuationToken);

  try {
    const result = await s3Client.send(command);
    console.log('Successfully listed objects:', result.Contents?.length || 0, 'objects found. Folders:', result.CommonPrefixes?.length || 0);
    return result;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

export async function presignPut(key: string, contentType: string, contentLength: number) {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  const expiresIn = process.env.URL_TTL_SECONDS ? parseInt(process.env.URL_TTL_SECONDS) : 900;

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function presignGet(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
    Key: key,
  });

  const expiresIn = process.env.URL_TTL_SECONDS ? parseInt(process.env.URL_TTL_SECONDS) : 900;

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteObjects(keys: string[]) {
  const command = new DeleteObjectsCommand({
    Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
    Delete: {
      Objects: keys.map(key => ({ Key: key }))
    }
  });

  return s3Client.send(command);
}

export async function copyObject(sourceKey: string, destinationKey: string) {
  const command = new CopyObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
    CopySource: `${process.env.CLOUDFLARE_BUCKETNAME}/${sourceKey}`,
    Key: destinationKey,
  });

  return s3Client.send(command);
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    const cmd = new HeadObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKETNAME!,
      Key: key,
    });
    await s3Client.send(cmd);
    return true;
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 404) return false;
    // Some providers return generic errors for missing objects; treat 404/NotFound specially
    if (err?.name === 'NotFound' || err?.Code === 'NotFound') return false;
    return false; // Default to not existing to be conservative for Phase 1
  }
}
