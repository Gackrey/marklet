// lib/document.ts
export interface MarkletDocument {
  d: string; // markdown content
  t: string; // theme (empty in edit mode, set in shareable link)
}

export function serializeDoc(doc: MarkletDocument): string {
  return JSON.stringify({ d: doc.d, t: doc.t });
}

export function parseDoc(json: string): MarkletDocument {
  try {
    const obj = JSON.parse(json);
    if (obj && typeof obj === 'object') {
      return {
        d: typeof obj.d === 'string' ? obj.d : '',
        t: typeof obj.t === 'string' ? obj.t : '',
      };
    }
  } catch {}
  return { d: '', t: '' };
}
