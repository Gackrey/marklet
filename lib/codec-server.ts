// Server-only codec — uses Node.js zlib instead of brotli-wasm
// Do not import this in client components.
import { promisify } from 'util';
import { brotliDecompress, inflateRaw } from 'zlib';

const brotliDecompressAsync = promisify(brotliDecompress);
const inflateRawAsync = promisify(inflateRaw);

function fromBase64url(str: string): Buffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return Buffer.from(padded, 'base64');
}

export async function decodeServer(hash: string): Promise<string> {
  if (!hash) return '';
  const format = hash[0];
  const data = fromBase64url(hash.slice(1));

  if (format === 'b') {
    const decompressed = await brotliDecompressAsync(data);
    return decompressed.toString('utf8');
  }
  if (format === 'c') {
    const decompressed = await inflateRawAsync(data);
    return decompressed.toString('utf8');
  }
  // 'r' = raw
  return data.toString('utf8');
}

// AES-256-GCM decrypt using Node.js Web Crypto (available since Node 18)
async function aesDecryptServer(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
  const iv = data.slice(0, 12);
  const ct = data.slice(12);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct.buffer as ArrayBuffer);
  return new Uint8Array(pt);
}

async function importKeyServer(keyStr: string): Promise<CryptoKey> {
  const raw = fromBase64url(keyStr);
  return crypto.subtle.importKey(
    'raw',
    raw.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
}

export async function decodeEncryptedServer(hash: string, keyStr: string): Promise<string> {
  if (!hash) return '';
  const format = hash[0];
  const key = await importKeyServer(keyStr);
  const cipherBytes = fromBase64url(hash.slice(1));
  const compressed = await aesDecryptServer(new Uint8Array(cipherBytes), key);

  if (format === 'b') {
    const decompressed = await brotliDecompressAsync(Buffer.from(compressed));
    return decompressed.toString('utf8');
  }
  if (format === 'c') {
    const decompressed = await inflateRawAsync(Buffer.from(compressed));
    return decompressed.toString('utf8');
  }
  return Buffer.from(compressed).toString('utf8');
}
