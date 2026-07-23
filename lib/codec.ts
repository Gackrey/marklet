// lib/codec.ts
// Encode/decode pipeline: JSON string → brotli compress → base64url → prepend format char
// Format chars: "b" = brotli, "c" = deflate, "r" = raw

import type { BrotliWasmType } from 'brotli-wasm';

let brotliModule: BrotliWasmType | null = null;
let brotliLoaded = false;
let brotliLoadAttempted = false;

async function loadBrotli() {
  if (brotliLoadAttempted) return;
  brotliLoadAttempted = true;
  try {
    const mod = await import('brotli-wasm');
    brotliModule = await mod.default;
    // Probe: compress a small test to verify it works
    brotliModule.compress(new TextEncoder().encode('test'), { quality: 1 });
    brotliLoaded = true;
  } catch (e) {
    console.warn('Brotli codec unavailable, falling back to deflate:', e);
  }
}

// Base64url encode (no padding, URL-safe)
function toBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Base64url decode
function fromBase64url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Deflate compress (browser native)
async function deflateCompress(bytes: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  const reader = cs.readable.getReader();
  writer.write(bytes as Uint8Array<ArrayBuffer>);
  writer.close();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const out = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

// Deflate decompress (browser native)
async function deflateDecompress(bytes: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  writer.write(bytes as Uint8Array<ArrayBuffer>);
  writer.close();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const out = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

// Shared compress helper — brotli at `quality`, deflate fallback, raw last resort
async function compressBytes(
  bytes: Uint8Array,
  quality: number,
): Promise<{ data: Uint8Array; fmt: string }> {
  if (brotliLoaded && brotliModule) {
    try {
      return { data: brotliModule.compress(bytes, { quality }), fmt: 'b' };
    } catch {}
  }
  try {
    return { data: await deflateCompress(bytes), fmt: 'c' };
  } catch {}
  return { data: bytes, fmt: 'r' };
}

// Full-quality encode (quality 11) — for share URLs, minimises length
export async function encode(text: string): Promise<string> {
  await loadBrotli();
  const bytes = new TextEncoder().encode(text);
  const { data, fmt } = await compressBytes(bytes, 11);
  return fmt + toBase64url(data);
}

// Fast encode (quality 1) — for edit-URL saves while typing, much lower CPU cost
export async function encodeFast(text: string): Promise<string> {
  await loadBrotli();
  const bytes = new TextEncoder().encode(text);
  const { data, fmt } = await compressBytes(bytes, 1);
  return fmt + toBase64url(data);
}

export async function decode(hash: string): Promise<string> {
  if (!hash) return '';
  await loadBrotli();
  const format = hash[0];
  const data = fromBase64url(hash.slice(1));
  if (format === 'b') {
    if (!brotliLoaded || !brotliModule) throw new Error('Brotli codec failed to load');
    return new TextDecoder().decode(brotliModule.decompress(data));
  }
  if (format === 'c') {
    return new TextDecoder().decode(await deflateDecompress(data));
  }
  // 'r' = raw
  return new TextDecoder().decode(data);
}

// ── AES-256-GCM helpers ────────────────────────────────────────────────────
// URL format for encrypted docs: #<hash>!<base64url_key>
// The IV (12 bytes) is prepended to the ciphertext inside the hash.

async function aesEncrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data.buffer as ArrayBuffer);
  const out = new Uint8Array(12 + ct.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ct), 12);
  return out;
}

async function aesDecrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
  const iv = data.slice(0, 12);
  const ct = data.slice(12);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct.buffer as ArrayBuffer);
  return new Uint8Array(pt);
}

export async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const raw = await crypto.subtle.exportKey('raw', key);
  return toBase64url(new Uint8Array(raw));
}

async function importKey(keyStr: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    fromBase64url(keyStr).buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// Compress (quality 11) → encrypt → base64url. Returns `{ hash, key }` separately so
// the caller can join them as `#<hash>!<key>` in the URL.
export async function encodeEncrypted(text: string, keyStr: string): Promise<string> {
  await loadBrotli();
  const bytes = new TextEncoder().encode(text);
  const { data, fmt } = await compressBytes(bytes, 11);
  const key = await importKey(keyStr);
  const ciphertext = await aesEncrypt(data, key);
  return fmt + toBase64url(ciphertext);
}

// Base64url decode → decrypt → decompress. `hash` is everything before `!`.
export async function decodeEncrypted(hash: string, keyStr: string): Promise<string> {
  if (!hash) return '';
  await loadBrotli();
  const key = await importKey(keyStr);
  const fmt = hash[0];
  const compressed = await aesDecrypt(fromBase64url(hash.slice(1)), key);
  if (fmt === 'b') {
    if (!brotliLoaded || !brotliModule) throw new Error('Brotli unavailable');
    return new TextDecoder().decode(brotliModule.decompress(compressed));
  }
  if (fmt === 'c') return new TextDecoder().decode(await deflateDecompress(compressed));
  return new TextDecoder().decode(compressed);
}
