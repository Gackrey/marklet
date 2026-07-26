import { Redis } from '@upstash/redis';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const { code } = await params;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const url = await redis.get<string>(`s:${code}`);
  if (!url) {
    return new Response('Link not found or expired.', { status: 404 });
  }

  return Response.redirect(url, 302);
}
