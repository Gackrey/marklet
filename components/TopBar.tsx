'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TEMPLATES } from '@/lib/templates';
import {
  IconClock,
  IconPlug,
  IconGrid,
  IconDownload,
  IconPrinter,
  IconCode,
  IconSave,
  IconSpinner,
  IconCheck,
  IconInfo,
  IconLinkSlash,
  IconCopy,
  IconMarkletLogo,
} from '@/components/icons';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { Button } from '@/components/ui/atoms/Button';
import { SegmentedControl } from '@/components/ui/atoms/SegmentedControl';
import { Tooltip } from '@/components/ui/atoms/Tooltip';
import { Dropdown } from '@/components/ui/molecules/Dropdown';
import styles from './TopBar.module.css';

type SaveState = 'draft' | 'saving' | 'saved';
type Theme = 'light' | 'dark';

interface TopBarProps {
  saveState: SaveState;
  linkChars: number;
  onCopyLink: () => Promise<void>;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (m: 'split' | 'editor' | 'preview') => void;
  onHistoryOpen: () => void;
  onExportPdf: () => void;
  onExportHtml: () => void;
  onSave: () => void;
  onSelectTemplate: (markdown: string) => void;
  onCopyShortLink: () => Promise<void>;
  onMcpOpen: () => void;
}

export default function TopBar({
  saveState,
  linkChars,
  onCopyLink,
  theme,
  onThemeChange,
  viewMode,
  onViewModeChange,
  onHistoryOpen,
  onExportPdf,
  onExportHtml,
  onSave,
  onSelectTemplate,
  onCopyShortLink,
  onMcpOpen,
}: TopBarProps) {
  const t = useTranslations('topbar');

  const viewOptions = [
    { value: 'editor' as const, label: t('viewEdit') },
    { value: 'split' as const, label: t('viewSplit') },
    { value: 'preview' as const, label: t('viewPreview') },
  ];

  const exportItems = [
    { label: t('exportPdf'), icon: <IconPrinter /> },
    { label: t('exportHtml'), icon: <IconCode /> },
  ];

  const [copied, setCopied] = useState(false);
  const [shortState, setShortState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const [exportOpen, setExportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const handleCopy = async () => {
    await onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShortLink = async () => {
    if (shortState === 'loading') return;
    setShortState('loading');
    try {
      await onCopyShortLink();
      setShortState('copied');
      setTimeout(() => setShortState('idle'), 2500);
    } catch {
      setShortState('error');
      setTimeout(() => setShortState('idle'), 2500);
    }
  };

  const darkIcon = '🌙';
  const lightIcon = '☀️';

  const saveLabels = { draft: t('saveDraft'), saving: t('saveSaving'), saved: t('saveSaved') };
  const saveLabel = saveLabels[saveState];
  const inLinkLabel =
    linkChars > 0 ? t('inLink', { chars: linkChars }) : t('notInLink');

  const exportHandlers = [
    () => {
      onExportPdf();
      setExportOpen(false);
    },
    () => {
      onExportHtml();
      setExportOpen(false);
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <IconMarkletLogo size={24} />
        <span className={styles.brandName}>{t('brand')}</span>
        <span className={styles.saveState}>
          <span className={styles.saveDot} data-state={saveState} />
          {saveLabel} <span className={styles.saveMeta}>{inLinkLabel}</span>
        </span>
      </div>

      <div className={styles.actions}>
        <SegmentedControl options={viewOptions} value={viewMode} onChange={onViewModeChange} />

        <Tooltip content={t('historyTitle')}>
          <IconButton onClick={onHistoryOpen} aria-label={t('historyTitle')}>
            <IconClock />
          </IconButton>
        </Tooltip>

        <Tooltip content={t('mcpTitle')}>
          <IconButton onClick={onMcpOpen} aria-label={t('mcpTitle')}>
            <IconPlug />
          </IconButton>
        </Tooltip>

        {/* Templates dropdown */}
        <div className={styles.dropdownWrap}>
          <Tooltip content={t('templatesTitle')}>
            <IconButton onClick={() => setTemplatesOpen(o => !o)} aria-label={t('templatesTitle')}>
              <IconGrid />
            </IconButton>
          </Tooltip>
          <Dropdown open={templatesOpen} onClose={() => setTemplatesOpen(false)} minWidth={200}>
            <div className={styles.dropdownSectionLabel}>{t('templatesHeader')}</div>
            {TEMPLATES.map(tpl => (
              <Button
                key={tpl.name}
                className={styles.templateItem}
                onClick={() => {
                  onSelectTemplate(tpl.markdown);
                  setTemplatesOpen(false);
                }}
              >
                <span className={styles.templateName}>{tpl.name}</span>
                <span className={styles.templateDesc}>{tpl.description}</span>
              </Button>
            ))}
          </Dropdown>
        </div>

        {/* Export dropdown */}
        <div className={styles.dropdownWrap}>
          <Tooltip content={t('exportTitle')}>
            <IconButton onClick={() => setExportOpen(o => !o)} aria-label={t('exportTitle')}>
              <IconDownload />
            </IconButton>
          </Tooltip>
          <Dropdown open={exportOpen} onClose={() => setExportOpen(false)} minWidth={140}>
            {exportItems.map((item, i) => (
              <Button key={item.label} className={styles.dropdownItem} onClick={exportHandlers[i]}>
                {item.icon}
                {item.label}
              </Button>
            ))}
          </Dropdown>
        </div>

        <Tooltip content={theme === 'light' ? t('themeToDark') : t('themeToLight')}>
          <IconButton
            className={styles.themeBtn}
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? t('themeToDark') : t('themeToLight')}
          >
            {theme === 'dark' ? darkIcon : lightIcon}
          </IconButton>
        </Tooltip>

        <Button variant="outline" onClick={onSave}>
          <IconSave />
          {t('save')}
        </Button>

        <Button
          className={styles.shortBtn}
          onClick={handleShortLink}
          disabled={shortState === 'loading'}
          title={t('shortTitle')}
          data-state={shortState}
        >
          {shortState === 'loading' ? (
            <IconSpinner />
          ) : shortState === 'copied' ? (
            <IconCheck />
          ) : shortState === 'error' ? (
            <IconInfo />
          ) : (
            <IconLinkSlash />
          )}
          {shortState === 'copied'
            ? t('shortCopied')
            : shortState === 'error'
              ? t('shortFailed')
              : shortState === 'loading'
                ? t('shortLoading')
                : t('shortIdle')}
        </Button>

        <Button className={styles.copyBtn} onClick={handleCopy} data-copied={String(copied)}>
          <IconCopy />
          {copied ? t('copied') : t('copyLink')}
        </Button>
      </div>
    </header>
  );
}
