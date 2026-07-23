'use client';

import { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { EditorView } from '@codemirror/view';
import TopBar from '@/components/TopBar';
import Toolbar from '@/components/Toolbar';
import StatsBar from '@/components/StatsBar';
import Preview from '@/components/Preview';
import RecentDocs from '@/components/RecentDocs';
import QrModal from '@/components/QrModal';
import McpModal from '@/components/McpModal';
import ReadView from '@/components/ReadView';
import { useDocument } from '@/hooks/useDocument';
import { useTheme } from '@/hooks/useTheme';
import { useDb } from '@/hooks/useDb';
import { saveDoc } from '@/lib/db';
import { exportAsPdf, exportAsHtml } from '@/lib/export';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

type PaneMode = 'editor' | 'split' | 'preview';

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function AppPage() {
  const {
    markdown,
    setMarkdown,
    saveState,
    linkChars,
    formatTag,
    viewMode,
    copyShareLink,
    copyShortLink,
    buildShareUrl,
    isEncrypted,
    toggleEncryption,
    clearDocument,
  } = useDocument();
  const { theme, setTheme, isDark } = useTheme();
  const [paneMode, setPaneMode] = useState<PaneMode>('split');
  const [cursorLine, setCursorLine] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [mcpOpen, setMcpOpen] = useState(false);
  const { entries, refresh, remove } = useDb();
  const editorViewRef = useRef<EditorView | null>(null);

  const handleHistoryOpen = () => {
    refresh();
    setHistoryOpen(true);
  };

  const handleSave = async () => {
    if (!markdown.trim()) return;
    await saveDoc(markdown);
    clearDocument();
  };

  const handleDocSelect = (text: string) => {
    setMarkdown(text);
  };

  const wordCount = useMemo(() => countWords(markdown), [markdown]);

  const showEditor = paneMode === 'editor' || paneMode === 'split';
  const showPreview = paneMode === 'preview' || paneMode === 'split';

  if (viewMode === 'p') {
    return <ReadView markdown={markdown} />;
  }

  return (
    <div
      className="app-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: 'var(--color-bg)',
      }}
    >
      <TopBar
        saveState={saveState}
        linkChars={linkChars}
        onCopyLink={copyShareLink}
        theme={theme}
        onThemeChange={setTheme}
        viewMode={paneMode}
        onViewModeChange={setPaneMode}
        onHistoryOpen={handleHistoryOpen}
        onExportPdf={exportAsPdf}
        onExportHtml={() => exportAsHtml(markdown)}
        onSave={handleSave}
        onSelectTemplate={setMarkdown}
        onCopyShortLink={copyShortLink}
        onMcpOpen={() => setMcpOpen(true)}
      />

      <RecentDocs
        open={historyOpen}
        entries={entries}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleDocSelect}
        onRemove={remove}
      />

      <QrModal open={qrOpen} getUrl={buildShareUrl} onClose={() => setQrOpen(false)} />
      <McpModal open={mcpOpen} onClose={() => setMcpOpen(false)} />

      {showEditor && (
        <Toolbar
          viewRef={editorViewRef}
          cursorLine={cursorLine}
          isEncrypted={isEncrypted}
          onToggleEncryption={toggleEncryption}
          onQrOpen={() => setQrOpen(true)}
        />
      )}

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {showEditor && (
          <Editor
            value={markdown}
            onChange={setMarkdown}
            onCursorLine={setCursorLine}
            isDark={isDark}
            viewRef={editorViewRef}
          />
        )}

        {showEditor && showPreview && <div className="pane-divider" />}

        {showPreview && <Preview markdown={markdown} onCheckboxToggle={setMarkdown} />}
      </main>

      <StatsBar
        formatTag={formatTag}
        linkChars={linkChars}
        wordCount={wordCount}
        charCount={markdown.length}
      />
    </div>
  );
}
