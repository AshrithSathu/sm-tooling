import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { resolve, sep } from 'path';
// @ts-ignore
import mime from 'mime';
async function* nodeStreamToIterator(stream: any) {
  for await (const chunk of stream) {
    yield chunk;
  }
}
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(new Uint8Array(value));
      }
    },
  });
}
export const GET = async (
  request: NextRequest,
  context: {
    params: Promise<{
      path?: string[];
    }>;
  }
) => {
  const { path } = await context.params;
  if (process.env.STORAGE_PROVIDER === 's3') {
    // Only media object keys; never allow paths to escape the upload namespace.
    if (!path?.length || path.some(part => !/^[a-zA-Z0-9_.-]+$/.test(part) || part === '.' || part === '..')) {
      return new NextResponse('Not found', { status: 404 });
    }
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT!,
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    const url = await getSignedUrl(client, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: path.join('/'),
      ResponseContentDisposition: 'inline',
    }), { expiresIn: 3600 });
    return new NextResponse(null, { status: 307, headers: {
      Location: url,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    }});
  }
  const base = resolve(process.env.UPLOAD_DIRECTORY!);
  const filePath = resolve(base, (path ?? []).join('/'));
  // Confine reads to UPLOAD_DIRECTORY. resolve() collapses any `..` segments
  // (including URL-decoded ones), so this blocks every path-traversal variant.
  if (filePath !== base && !filePath.startsWith(base + sep)) {
    return new NextResponse('Not found', { status: 404 });
  }
  const response = createReadStream(filePath);
  const fileStats = statSync(filePath);
  const contentType = mime.getType(filePath) || 'application/octet-stream';
  const iterator = nodeStreamToIterator(response);
  const webStream = iteratorToStream(iterator);
  return new Response(webStream, {
    headers: {
      'Content-Type': contentType,
      // Set the appropriate content-type header
      'Content-Length': fileStats.size.toString(),
      // Set the content-length header
      'Last-Modified': fileStats.mtime.toUTCString(),
      // Set the last-modified header
      'Cache-Control': 'public, max-age=31536000, immutable', // Example cache-control header
    },
  });
};
