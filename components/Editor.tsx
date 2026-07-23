'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { formatKeymap } from '@/lib/formatting';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorLine?: (lineText: string) => void;
  isDark: boolean;
  viewRef?: RefObject<EditorView | null>;
}

const PLACEHOLDER_TEXT = `# Start writing…

Your document lives entirely in this URL — no account, no server.
Hit Copy link and the whole document travels with the address.

---

**Bold**, _italic_, \`inline code\`, [links](https://example.com)

- [ ] Checkboxes you can tick in Preview
- [ ] Try the Split view in the top bar

> Blockquotes for highlights and callouts

\`\`\`js
// Fenced code blocks
const greet = name => \`Hello, \${name}!\`;
\`\`\`

| Column A | Column B |
|----------|----------|
| Tables   | work too |`;

function makeEditorTheme(isDark: boolean) {
  return EditorView.theme(
    {
      '&': {
        height: '100%',
        fontFamily: 'var(--font-editor)',
        fontSize: 'var(--editor-font-size)',
        background: 'var(--color-editor-bg)',
        color: 'var(--color-editor-text)',
      },
      '.cm-content': {
        padding: 'var(--space-10) var(--space-6)',
        maxWidth: 'var(--editor-max-width)',
        margin: '0 auto',
        lineHeight: 'var(--editor-line-height)',
        caretColor: 'var(--color-editor-cursor)',
      },
      '&.cm-focused': { outline: 'none' },
      '.cm-line': { padding: '0' },
      '.cm-activeLine': { background: 'var(--color-editor-line-hl)' },
      '.cm-selectionBackground, ::selection': {
        background: 'var(--color-editor-selection) !important',
      },
      '.cm-gutters': {
        background: 'var(--color-editor-bg)',
        borderRight: 'none',
        color: 'var(--color-editor-gutter)',
        minWidth: '2.5rem',
      },
      '.cm-scroller': { overflow: 'auto' },
      '.cm-cursor': { borderLeftColor: 'var(--color-editor-cursor)' },
    },
    { dark: isDark },
  );
}

export default function Editor({
  value,
  onChange,
  onCursorLine,
  isDark,
  viewRef: externalViewRef,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const lastEditorText = useRef(value);
  // Sync onCursorLine into a ref so the CodeMirror closure never goes stale.
  // useLayoutEffect keeps it in sync before any effect reads it.
  const onCursorLineRef = useRef(onCursorLine);
  useLayoutEffect(() => {
    onCursorLineRef.current = onCursorLine;
  });

  // Writing to externalViewRef (a caller-supplied ref) is the React forwarded-ref pattern.
  // The immutability rule doesn't model this intent, so it's suppressed for this block.
  /* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...formatKeymap, ...defaultKeymap, ...historyKeymap]),
          markdown(),
          makeEditorTheme(isDark),
          EditorView.lineWrapping,
          placeholder(PLACEHOLDER_TEXT),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              const text = update.state.doc.toString();
              lastEditorText.current = text;
              onChange(text);
            }
            if (update.docChanged || update.selectionSet) {
              const line = update.state.doc.lineAt(update.state.selection.main.head);
              onCursorLineRef.current?.(line.text);
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    if (externalViewRef) (externalViewRef as { current: EditorView | null }).current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
      if (externalViewRef) (externalViewRef as { current: EditorView | null }).current = null;
    };
  }, []);
  /* eslint-enable react-hooks/immutability, react-hooks/exhaustive-deps */

  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === lastEditorText.current) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
      lastEditorText.current = value;
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: [] });
  }, [isDark]);

  return (
    <div style={{ flex: 1, overflow: 'hidden', background: 'var(--color-editor-bg)' }}>
      <div ref={containerRef} style={{ height: '100%', overflow: 'auto' }} />
    </div>
  );
}
