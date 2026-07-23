export async function POST(req: Request): Promise<Response> {
  let url: string;
  try {
    ({ url } = (await req.json()) as { url: string });
    if (!url || typeof url !== 'string') throw new Error('missing url');
    // Basic sanity — must be an absolute URL
    new URL(url);
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const resp = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
      { headers: { 'User-Agent': 'marklet/1.0' } },
    );
    if (!resp.ok) throw new Error(`is.gd ${resp.status}`);

    const data = (await resp.json()) as
      { shorturl: string } | { errorcode: number; errormessage: string };

    if ('errorcode' in data) {
      return Response.json({ error: data.errormessage }, { status: 422 });
    }
    return Response.json({ shortUrl: data.shorturl });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Shortening failed' },
      { status: 502 },
    );
  }
}
