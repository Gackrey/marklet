import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { encode, decode } from '@/lib/codec';
import { serializeDoc, parseDoc } from '@/lib/document';

function buildServer(baseUrl: string): McpServer {
  const server = new McpServer({ name: 'marklet', version: '1.0.0' });

  // ── read_document ──────────────────────────────────────────────────────────
  server.registerTool(
    'read_document',
    {
      description: 'Read the markdown content of a Marklet document from its URL',
      inputSchema: {
        url: z
          .string()
          .describe(
            'Full Marklet document URL including the # hash fragment, e.g. https://marklet.app/?m=e#bXXXX',
          ),
      },
    },
    async ({ url }) => {
      try {
        const hash = new URL(url).hash.replace(/^#/, '');
        if (!hash) throw new Error('URL has no hash — not a valid Marklet document URL');
        const raw = await decode(hash);
        const doc = parseDoc(raw);
        const title =
          doc.d
            .split('\n')
            .find(l => l.trim())
            ?.replace(/^#+\s*/, '')
            .trim() ?? 'Untitled';
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ markdown: doc.d, title, charCount: doc.d.length }),
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );

  // ── write_document ─────────────────────────────────────────────────────────
  server.registerTool(
    'write_document',
    {
      description:
        'Encode markdown into a Marklet URL. Returns a shareable link — no server storage used.',
      inputSchema: {
        markdown: z.string().describe('Markdown content to encode into the URL'),
      },
    },
    async ({ markdown }) => {
      try {
        const encoded = await encode(serializeDoc({ d: markdown, t: '' }));
        const url = `${baseUrl}/?m=e#${encoded}`;
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ url, linkLength: encoded.length + 1 }),
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );

  // ── update_document ────────────────────────────────────────────────────────
  server.registerTool(
    'update_document',
    {
      description:
        'Replace the content of an existing Marklet document with new markdown. Returns the updated URL.',
      inputSchema: {
        url: z.string().describe('Existing Marklet document URL to update'),
        markdown: z.string().describe('New markdown content that replaces the existing content'),
      },
    },
    async ({ url, markdown }) => {
      try {
        const encoded = await encode(serializeDoc({ d: markdown, t: '' }));
        const parsed = new URL(url);
        parsed.searchParams.set('m', 'e');
        parsed.hash = '#' + encoded;
        const newUrl = parsed.toString();
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ url: newUrl, markdown, linkLength: encoded.length + 1 }),
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );

  return server;
}

async function handleMcp(req: Request): Promise<Response> {
  const baseUrl = new URL(req.url).origin;
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = buildServer(baseUrl);
  await server.connect(transport);
  return transport.handleRequest(req);
}

export { handleMcp as GET, handleMcp as POST, handleMcp as DELETE };
