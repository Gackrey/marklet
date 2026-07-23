import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import type { KeyBinding } from '@codemirror/view';

export type FormatAction =
  'bold' | 'italic' | 'code' | 'link' | 'h1' | 'h2' | 'h3' | 'codeblock' | 'checkbox';

function wrapInline(view: EditorView, before: string, after: string) {
  view.dispatch(
    view.state.changeByRange(range => {
      const text = view.state.sliceDoc(range.from, range.to);
      return {
        changes: { from: range.from, to: range.to, insert: before + text + after },
        range: EditorSelection.range(
          range.from + before.length,
          range.from + before.length + text.length,
        ),
      };
    }),
  );
  view.focus();
}

function prefixHeading(view: EditorView, prefix: string) {
  const line = view.state.doc.lineAt(view.state.selection.main.head);
  const stripped = line.text.replace(/^#{1,6}\s*/, '');
  view.dispatch({
    changes: { from: line.from, to: line.to, insert: prefix + stripped },
    selection: EditorSelection.cursor(line.from + prefix.length + stripped.length),
  });
  view.focus();
}

export function applyFormat(view: EditorView, action: FormatAction) {
  switch (action) {
    case 'bold':
      return wrapInline(view, '**', '**');
    case 'italic':
      return wrapInline(view, '_', '_');
    case 'code':
      return wrapInline(view, '`', '`');
    case 'h1':
      return prefixHeading(view, '# ');
    case 'h2':
      return prefixHeading(view, '## ');
    case 'h3':
      return prefixHeading(view, '### ');
    case 'link': {
      const range = view.state.selection.main;
      const text = view.state.sliceDoc(range.from, range.to) || 'link text';
      const inserted = `[${text}](url)`;
      view.dispatch({
        changes: { from: range.from, to: range.to, insert: inserted },
        // select "url" so user can type the URL immediately
        selection: EditorSelection.range(
          range.from + text.length + 3,
          range.from + inserted.length - 1,
        ),
      });
      view.focus();
      break;
    }
    case 'checkbox': {
      const line = view.state.doc.lineAt(view.state.selection.main.head);
      let newText: string;
      let cursorOffset: number;

      if (/^(\s*[-*+]\s+)\[x\]/i.test(line.text)) {
        // Checked → unchecked
        newText = line.text.replace(/^(\s*[-*+]\s+)\[x\]/i, '$1[ ]');
        cursorOffset = view.state.selection.main.head - line.from;
      } else if (/^(\s*[-*+]\s+)\[ \]/.test(line.text)) {
        // Unchecked → checked
        newText = line.text.replace(/^(\s*[-*+]\s+)\[ \]/, '$1[x]');
        cursorOffset = view.state.selection.main.head - line.from;
      } else {
        // Not a task item — convert the line (strip any existing list marker first)
        const stripped = line.text.replace(/^\s*[-*+]\s+/, '');
        newText = '- [ ] ' + stripped;
        cursorOffset = newText.length;
      }

      view.dispatch({
        changes: { from: line.from, to: line.to, insert: newText },
        selection: EditorSelection.cursor(line.from + cursorOffset),
      });
      view.focus();
      break;
    }
    case 'codeblock': {
      const range = view.state.selection.main;
      const text = view.state.sliceDoc(range.from, range.to);
      if (text) {
        view.dispatch({
          changes: { from: range.from, to: range.to, insert: '```\n' + text + '\n```' },
          selection: EditorSelection.range(range.from + 4, range.from + 4 + text.length),
        });
      } else {
        view.dispatch({
          changes: { from: range.from, to: range.to, insert: '```\n\n```' },
          selection: EditorSelection.cursor(range.from + 4),
        });
      }
      view.focus();
      break;
    }
  }
}

export const formatKeymap: KeyBinding[] = [
  {
    key: 'Mod-b',
    run: v => {
      applyFormat(v, 'bold');
      return true;
    },
  },
  {
    key: 'Mod-i',
    run: v => {
      applyFormat(v, 'italic');
      return true;
    },
  },
  {
    key: 'Mod-`',
    run: v => {
      applyFormat(v, 'code');
      return true;
    },
  },
  {
    key: 'Mod-k',
    run: v => {
      applyFormat(v, 'link');
      return true;
    },
  },
  {
    key: 'Mod-1',
    run: v => {
      applyFormat(v, 'h1');
      return true;
    },
  },
  {
    key: 'Mod-2',
    run: v => {
      applyFormat(v, 'h2');
      return true;
    },
  },
  {
    key: 'Mod-3',
    run: v => {
      applyFormat(v, 'h3');
      return true;
    },
  },
  {
    key: 'Mod-Shift-k',
    run: v => {
      applyFormat(v, 'codeblock');
      return true;
    },
  },
  {
    key: 'Mod-Enter',
    run: v => {
      applyFormat(v, 'checkbox');
      return true;
    },
  },
];
