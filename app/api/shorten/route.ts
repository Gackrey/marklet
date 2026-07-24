import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return Array.from(bytes, b => b.toString(36).padStart(2, '0')).join('').slice(0, 8);
}

export async function POST(req: Request): Promise<Response> {
  let url: string;
  try {
    ({ url } = (await req.json()) as { url: string });
    if (!url || typeof url !== 'string') throw new Error('missing url');
    new URL(url);
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const code = generateCode();
    await redis.set(`s:${code}`, url, { ex: 60 * 60 * 24 * 90 }); // 90 days TTL

    const origin = new URL(req.url).origin;
    return Response.json({ shortUrl: `${origin}/s/${code}` });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Shortening failed' },
      { status: 502 },
    );
  }
}
