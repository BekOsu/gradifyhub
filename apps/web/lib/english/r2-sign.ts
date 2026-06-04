import { createHmac, createHash } from 'node:crypto';

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

export function presignR2Put(
  key: string,
  contentType: string,
  expiresInSeconds: number = 300
): string {
  const region = 'auto';
  const service = 's3';
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY!;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY!;
  const endpoint = process.env.R2_URL!;
  const bucket = process.env.R2_BUCKET_NAME!;

  const now = new Date();
  const datetime = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const date = datetime.slice(0, 8);

  const host = new URL(endpoint).host;
  const path = `/${bucket}/${key}`;

  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const credential = `${accessKey}/${credentialScope}`;

  const queryParams = new URLSearchParams();
  queryParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  queryParams.set('X-Amz-Credential', credential);
  queryParams.set('X-Amz-Date', datetime);
  queryParams.set('X-Amz-Expires', String(expiresInSeconds));
  queryParams.set('X-Amz-SignedHeaders', 'host');
  queryParams.sort();
  const canonicalQS = queryParams.toString();

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';
  const canonicalRequest = [
    'PUT',
    path,
    canonicalQS,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const requestHash = createHash('sha256')
    .update(canonicalRequest)
    .digest('hex');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    requestHash,
  ].join('\n');

  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${secretKey}`, date), region), service),
    'aws4_request'
  );
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  return `${endpoint}/${bucket}/${key}?${canonicalQS}&X-Amz-Signature=${signature}`;
}

export function presignR2Get(
  key: string,
  expiresInSeconds: number = 300
): string {
  const region = 'auto';
  const service = 's3';
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY!;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY!;
  const endpoint = process.env.R2_URL!;
  const bucket = process.env.R2_BUCKET_NAME!;

  const now = new Date();
  const datetime = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const date = datetime.slice(0, 8);

  const host = new URL(endpoint).host;
  const path = `/${bucket}/${key}`;

  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const credential = `${accessKey}/${credentialScope}`;

  const queryParams = new URLSearchParams();
  queryParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  queryParams.set('X-Amz-Credential', credential);
  queryParams.set('X-Amz-Date', datetime);
  queryParams.set('X-Amz-Expires', String(expiresInSeconds));
  queryParams.set('X-Amz-SignedHeaders', 'host');
  queryParams.sort();
  const canonicalQS = queryParams.toString();

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';
  const canonicalRequest = [
    'GET',
    path,
    canonicalQS,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const requestHash = createHash('sha256')
    .update(canonicalRequest)
    .digest('hex');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    requestHash,
  ].join('\n');

  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${secretKey}`, date), region), service),
    'aws4_request'
  );
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  return `${endpoint}/${bucket}/${key}?${canonicalQS}&X-Amz-Signature=${signature}`;
}
