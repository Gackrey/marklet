'use client';

import { useTranslations } from 'next-intl';
import { IconPlug, IconClose, IconWarning, IconExternalLink } from '@/components/icons';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { CopyButton } from '@/components/ui/atoms/CopyButton';
import { Tooltip } from '@/components/ui/atoms/Tooltip';
import { ModalShell } from '@/components/ui/molecules/ModalShell';
import styles from './McpModal.module.css';

interface McpModalProps {
  open: boolean;
  onClose: () => void;
}

const MCP_TOOLS = ['read_document', 'write_document', 'update_document'] as const;
type McpTool = (typeof MCP_TOOLS)[number];

export default function McpModal({ open, onClose }: McpModalProps) {
  const t = useTranslations('mcp');
  const mcpUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp';
  const configJson = JSON.stringify({ mcpServers: { marklet: { url: mcpUrl } } }, null, 2);
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const toolDescKey: Record<McpTool, Parameters<typeof t>[0]> = {
    read_document: 'toolReadDesc',
    write_document: 'toolWriteDesc',
    update_document: 'toolUpdateDesc',
  };

  return (
    <ModalShell open={open} onClose={onClose} width={440}>
      {/* Header */}
      <div className={styles.modalHeader}>
        <div className={styles.headerText}>
          <div className={styles.headerTitleRow}>
            <IconPlug size={16} stroke="var(--color-accent)" />
            <span className={styles.headerTitle}>{t('title')}</span>
          </div>
          <p className={styles.headerDesc}>{t('subtitle')}</p>
        </div>
        <Tooltip content={t('closeTitle')}>
          <IconButton size="sm" onClick={onClose} aria-label={t('closeTitle')}>
            <IconClose />
          </IconButton>
        </Tooltip>
      </div>

      {/* Localhost warning */}
      {isLocalhost && (
        <div className={styles.warning}>
          <span className={styles.warningIcon}>
            <IconWarning size={14} stroke="var(--color-warning, currentColor)" />
          </span>
          <p className={styles.warningText}>{t('localhostWarning')}</p>
        </div>
      )}

      {/* Server URL */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>{t('serverUrlLabel')}</p>
        <div className={styles.urlRow}>
          <code className={`${styles.codeBlock} ${styles.urlCode}`}>{mcpUrl}</code>
          <CopyButton text={mcpUrl} />
        </div>
      </div>

      {/* Claude Desktop config */}
      <div className={styles.section}>
        <div className={styles.configHeaderRow}>
          <p className={styles.sectionLabel} style={{ marginBottom: 0 }}>
            {t('configLabel')}
          </p>
          <CopyButton text={configJson} />
        </div>
        <pre className={styles.codeBlock}>{configJson}</pre>
        <p className={styles.configNote}>
          {t.rich('configHint', {
            file: chunks => <code className={styles.inlineCode}>{chunks}</code>,
            key: chunks => <code className={styles.inlineCode}>{chunks}</code>,
          })}
        </p>
      </div>

      {/* Tool list */}
      <div className={styles.toolList}>
        {MCP_TOOLS.map(tool => (
          <div key={tool} className={styles.toolItem}>
            <code className={styles.toolName}>{tool}</code>
            <span className={styles.toolDesc}>{t(toolDescKey[tool])}</span>
          </div>
        ))}
      </div>

      {/* Docs link */}
      <a
        href="https://modelcontextprotocol.io/quickstart/user"
        target="_blank"
        rel="noreferrer"
        className={styles.docsLink}
      >
        {t('docsLink')}
        <IconExternalLink size={11} />
      </a>
    </ModalShell>
  );
}
