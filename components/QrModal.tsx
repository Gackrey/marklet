'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconSpinner, IconInfo, IconDownload, IconClose } from '@/components/icons';
import { Button } from '@/components/ui/atoms/Button';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { Tooltip } from '@/components/ui/atoms/Tooltip';
import { ModalShell } from '@/components/ui/molecules/ModalShell';
import styles from './QrModal.module.css';

interface QrModalProps {
  open: boolean;
  getUrl: () => Promise<string>;
  onClose: () => void;
}

const MAX_QR_CHARS = 800;

const QR_OPTS = {
  errorCorrectionLevel: 'M' as const,
  width: 280,
  margin: 2,
  color: { dark: '#000000', light: '#ffffff' },
};

export default function QrModal({ open, getUrl, onClose }: QrModalProps) {
  const t = useTranslations('qr');
  const [dataUrl, setDataUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shortened, setShortened] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setDataUrl('');
    setShareUrl('');
    setShortened(false);
    setError('');
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      const url = await getUrl();
      if (cancelled) return;

      const QRCode = (await import('qrcode')).default;
      let qrUrl = url;

      if (url.length > MAX_QR_CHARS) {
        try {
          const resp = await fetch('/api/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          const data = (await resp.json()) as { shortUrl?: string; error?: string };
          if (data.shortUrl) {
            qrUrl = data.shortUrl;
            if (!cancelled) setShortened(true);
          } else {
            throw new Error(data.error ?? 'Shortening failed');
          }
        } catch {
          if (!cancelled) {
            setError(t('errorTooLong'));
            setLoading(false);
          }
          return;
        }
      }

      if (cancelled) return;

      try {
        const du = await QRCode.toDataURL(qrUrl, QR_OPTS);
        if (cancelled) return;
        setShareUrl(qrUrl);
        setDataUrl(du);
      } catch {
        if (!cancelled) setError(t('errorGeneral'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, getUrl, t]);

  const urlPreview = shareUrl.length > 60 ? shareUrl.slice(0, 57) + '…' : shareUrl;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'marklet-qr.png';
    a.click();
  };

  return (
    <ModalShell open={open} onClose={onClose} width={320}>
      <div className={styles.modalHeader}>
        <span className={styles.modalTitle}>{t('title')}</span>
        <Tooltip content={t('closeTitle')}>
          <IconButton size="sm" onClick={onClose} aria-label={t('closeTitle')}>
            <IconClose />
          </IconButton>
        </Tooltip>
      </div>

      <div className={styles.qrArea}>
        {loading ? (
          <div className={styles.loadingIcon}>
            <IconSpinner size={24} />
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <IconInfo size={24} />
            </div>
            <p className={styles.errorMsg}>{error}</p>
          </div>
        ) : dataUrl ? (
          <Image
            src={dataUrl}
            alt="QR code"
            width={280}
            height={280}
            style={{ borderRadius: 'var(--radius-md)', display: 'block' }}
          />
        ) : null}
      </div>

      {(shortened || shareUrl) && (
        <div className={styles.urlInfo}>
          {shortened && (
            <span className={styles.shortenedBadge}>{t('autoShortened')}</span>
          )}
          {shareUrl && (
            <p className={styles.urlPreview}>{urlPreview}</p>
          )}
        </div>
      )}

      <Button className={styles.downloadBtn} onClick={handleDownload} disabled={!dataUrl}>
        <IconDownload size={13} />
        {t('downloadPng')}
      </Button>

    </ModalShell>
  );
}
