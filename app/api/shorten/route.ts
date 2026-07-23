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
    const resp = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      { headers: { 'User-Agent': 'marklet/1.0' } },
    );

    const text = (await resp.text()).trim();

    if (!resp.ok || !text.startsWith('https://')) {
      throw new Error(`Shortening failed: ${text.slice(0, 120)}`);
    }

    return Response.json({ shortUrl: text });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Shortening failed' },
      { status: 502 },
    );
  }
}
