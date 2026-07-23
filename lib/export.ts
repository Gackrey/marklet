import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    input: ['type', 'checked', 'disabled'],
  },
};

async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

// Minimal self-contained CSS for exported HTML (no CSS variables)
const EXPORT_CSS = `
*,*::before,*::after{box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#1a1a1a;background:#fff;margin:0;padding:48px 24px}
.prose{max-width:720px;margin:0 auto}
h1,h2,h3,h4,h5,h6{font-family:system-ui,-apple-system,sans-serif;font-weight:700;line-height:1.25;letter-spacing:-0.01em;margin-top:1.5em;margin-bottom:0.5em;color:#111}
h1{font-size:2em;margin-top:0}h2{font-size:1.5em}h3{font-size:1.25em}h4,h5,h6{font-size:1em}
p{margin-bottom:1em}
a{color:#4f46e5;text-decoration:none}a:hover{text-decoration:underline}
strong{font-weight:700}em{font-style:italic}
code{font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:0.875em;background:#f4f4f5;padding:2px 5px;border-radius:3px}
pre{background:#f4f4f5;padding:1em;border-radius:6px;overflow-x:auto;margin-bottom:1em}
pre code{background:none;padding:0;border-radius:0}
blockquote{border-left:3px solid #d4d4d8;padding-left:1em;color:#71717a;font-style:italic;margin:1em 0}
hr{border:none;height:1px;background:#e4e4e7;margin:2em 0}
ul,ol{padding-left:1.5em;margin-bottom:1em}li{margin-bottom:0.25em}
ul{list-style-type:disc}ol{list-style-type:decimal}
ul.contains-task-list{padding-left:1.5em}
li.task-list-item{list-style:none;margin-left:-1.5em;padding-left:1.5em;position:relative}
input[type="checkbox"]{appearance:none;-webkit-appearance:none;width:14px;height:14px;border:1.5px solid #a1a1aa;border-radius:3px;position:relative;vertical-align:middle;margin-right:6px;margin-top:-2px;flex-shrink:0}
input[type="checkbox"]:checked{background:#4f46e5;border-color:#4f46e5}
input[type="checkbox"]:checked::after{content:'';position:absolute;left:3px;top:0;width:5px;height:9px;border:2px solid #fff;border-top:none;border-left:none;transform:rotate(45deg)}
li:has(input[type="checkbox"]:checked){color:#a1a1aa;text-decoration:line-through}
table{width:100%;border-collapse:collapse;margin-bottom:1em;font-size:0.9em}
th,td{border:1px solid #e4e4e7;padding:0.5em 0.75em;text-align:left}
th{background:#f4f4f5;font-weight:600;font-family:system-ui,sans-serif}
tr:nth-child(even) td{background:#fafafa}
@media print{body{padding:0}}
`.trim();

export function exportAsPdf(): void {
  window.print();
}

export async function exportAsHtml(markdown: string): Promise<void> {
  const bodyHtml = await renderMarkdown(markdown);
  const title =
    markdown
      .split('\n')
      .find(l => l.trim())
      ?.replace(/^#+\s*/, '')
      .trim() ?? 'Marklet document';
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'document';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>${EXPORT_CSS}</style>
</head>
<body>
  <div class="prose">${bodyHtml}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
