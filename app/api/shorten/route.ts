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
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
      { headers: { 'User-Agent': 'marklet/1.0' } },
    );

    const text = await resp.text();

    if (!resp.ok) {
      throw new Error(`is.gd ${resp.status}: ${text.slice(0, 120)}`);
    }

    // is.gd occasionally returns a plain-text "Error, …" body with a 200 status
    // even when format=json is requested, so we parse manually.
    let data: { shorturl?: string; errorcode?: number; errormessage?: string };
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text.slice(0, 120));
    }

    if (data.errorcode !== undefined || !data.shorturl) {
      throw new Error(data.errormessage ?? 'Shortening failed');
    }

    return Response.json({ shortUrl: data.shorturl });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Shortening failed' },
      { status: 502 },
    );
  }
}
