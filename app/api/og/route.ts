import { decodeServer, decodeEncryptedServer } from '@/lib/codec-server';
import { parseDoc } from '@/lib/document';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractContent(markdown: string): { title: string; description: string } {
  const lines = markdown.split('\n');
  const title =
    lines
      .find(l => l.trim())
      ?.replace(/^#+\s*/, '')
      .trim() ?? 'Marklet document';
  const body =
    lines
      .find(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('-'))
      ?.replace(/[*_`[\]]/g, '')
      .trim() ?? '';
  const description = body.length > 160 ? body.slice(0, 157) + '…' : body;
  return { title, description };
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams, origin } = new URL(req.url);
  const hash = searchParams.get('h') ?? '';

  let title = 'Marklet';
  let description = 'A document created with Marklet — content-in-URL markdown editor';

  // Reconstruct the target app URL from the hash
  const targetUrl = hash ? `${origin}/?m=p#${hash}` : origin;

  if (hash) {
    const bangIdx = hash.indexOf('!');
    try {
      if (bangIdx === -1) {
        // Unencrypted
        const text = await decodeServer(hash);
        const doc = parseDoc(text);
        const content = extractContent(doc.d);
        title = content.title;
        if (content.description) description = content.description;
      } else {
        // Encrypted — key is after the bang
        const hashPart = hash.slice(0, bangIdx);
        const keyPart = hash.slice(bangIdx + 1);
        const text = await decodeEncryptedServer(hashPart, keyPart);
        const doc = parseDoc(text);
        const content = extractContent(doc.d);
        title = content.title;
        if (content.description) description = content.description;
      }
    } catch {
      // Encrypted and key failed, or corrupt — generic preview
      if (bangIdx !== -1) {
        title = 'Encrypted Marklet document';
        description = 'This document is encrypted. Open the link to view it.';
      }
    }
  }

  // URL is placed in a data attribute to avoid any </script> injection risk
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(targetUrl)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Marklet">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(targetUrl)}">
</head>
<body data-href="${escapeHtml(targetUrl)}">
<script>window.location.replace(document.body.dataset.href)</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
