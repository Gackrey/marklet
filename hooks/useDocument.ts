'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { encode, encodeFast, decode, encodeEncrypted, decodeEncrypted, generateKey } from '@/lib/codec';
import { serializeDoc, parseDoc, type MarkletDocument } from '@/lib/document';

type SaveState = 'draft' | 'saving' | 'saved';
type ViewMode = 'e' | 'p';

interface UseDocumentReturn {
  markdown: string;
  setMarkdown: (text: string) => void;
  saveState: SaveState;
  linkChars: number;
  formatTag: string;
  viewMode: ViewMode;
  isEncrypted: boolean;
  toggleEncryption: () => void;
  buildShareUrl: () => Promise<string>;
  copyShareLink: () => Promise<void>;
  copyShortLink: () => Promise<void>;
  clearDocument: () => void;
}

const DEBOUNCE_MS = 280;

export function useDocument(): UseDocumentReturn {
  const [markdown, setMarkdownState] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('draft');
  const [linkChars, setLinkChars] = useState(0);
  const [formatTag, setFormatTag] = useState('');
  const [viewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('m') === 'p'
      ? 'p'
      : 'e',
  );
  const [isEncrypted, setIsEncrypted] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressHashChange = useRef(false);
  // Current encryption key — persists across saves so re-edits keep the same key
  const encKeyRef = useRef<string>('');

  // Parse the raw hash (everything after #) handling the optional !key suffix
  async function decodeHash(
    rawHash: string,
  ): Promise<{ markdown: string; encrypted: boolean; key: string }> {
    const bangIdx = rawHash.indexOf('!');
    if (bangIdx !== -1) {
      const hashPart = rawHash.slice(0, bangIdx);
      const keyPart = rawHash.slice(bangIdx + 1);
      const text = await decodeEncrypted(hashPart, keyPart);
      const doc = parseDoc(text);
      return { markdown: doc.d, encrypted: true, key: keyPart };
    }
    const text = await decode(rawHash);
    const doc = parseDoc(text);
    return { markdown: doc.d, encrypted: false, key: '' };
  }

  useEffect(() => {
    const rawHash = window.location.hash.replace(/^#/, '');
    if (rawHash) {
      decodeHash(rawHash)
        .then(({ markdown, encrypted, key }) => {
          setMarkdownState(markdown);
          setIsEncrypted(encrypted);
          if (encrypted) encKeyRef.current = key;
        })
        .catch(() => {});
    }

    const onHashChange = async () => {
      if (suppressHashChange.current) return;
      const h = window.location.hash.replace(/^#/, '');
      if (h) {
        try {
          const { markdown, encrypted, key } = await decodeHash(h);
          setMarkdownState(markdown);
          setIsEncrypted(encrypted);
          if (encrypted) encKeyRef.current = key;
        } catch {}
      } else {
        setMarkdownState('');
        setIsEncrypted(false);
        encKeyRef.current = '';
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const saveToUrl = useCallback(async (text: string, encrypted: boolean) => {
    setSaveState('saving');
    try {
      const serialized = serializeDoc({ d: text, t: '' } as MarkletDocument);
      const url = new URL(window.location.href);
      url.searchParams.set('m', 'e');

      let hashFragment: string;
      if (encrypted) {
        if (!encKeyRef.current) encKeyRef.current = await generateKey();
        const encHash = await encodeEncrypted(serialized, encKeyRef.current);
        hashFragment = encHash + '!' + encKeyRef.current;
      } else {
        hashFragment = await encodeFast(serialized);
      }

      url.hash = '#' + hashFragment;
      suppressHashChange.current = true;
      history.replaceState(null, '', url.toString());
      setTimeout(() => {
        suppressHashChange.current = false;
      }, 0);

      setLinkChars(hashFragment.length + 1);
      setFormatTag(hashFragment[0] ?? '');
      setSaveState('saved');
    } catch {
      setSaveState('draft');
    }
  }, []);

  const setMarkdown = useCallback(
    (text: string) => {
      setMarkdownState(text);
      setSaveState('draft');
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => saveToUrl(text, isEncrypted), DEBOUNCE_MS);
    },
    [saveToUrl, isEncrypted],
  );

  const toggleEncryption = useCallback(() => {
    const next = !isEncrypted;
    setIsEncrypted(next);
    if (!next) encKeyRef.current = ''; // discard key when turning off encryption
    // Save immediately with new mode
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => saveToUrl(markdown, next), 0);
  }, [isEncrypted, markdown, saveToUrl]);

  const clearDocument = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setMarkdownState('');
    setSaveState('draft');
    setLinkChars(0);
    setFormatTag('');
    encKeyRef.current = '';
    setIsEncrypted(false);
    suppressHashChange.current = true;
    history.replaceState(null, '', window.location.pathname + '?m=e');
    setTimeout(() => {
      suppressHashChange.current = false;
    }, 0);
  }, []);

  // Returns the direct ?m=p#hash URL (used for QR) and the OG proxy URL (used for sharing)
  const buildShareUrl = useCallback(async (): Promise<string> => {
    const serialized = serializeDoc({ d: markdown, t: '' } as MarkletDocument);
    const url = new URL(window.location.href);
    url.searchParams.set('m', 'p');

    let hashFragment: string;
    if (isEncrypted) {
      if (!encKeyRef.current) encKeyRef.current = await generateKey();
      const encHash = await encodeEncrypted(serialized, encKeyRef.current);
      hashFragment = encHash + '!' + encKeyRef.current;
    } else {
      hashFragment = await encode(serialized);
    }

    url.hash = '#' + hashFragment;
    return url.toString();
  }, [markdown, isEncrypted]);

  const copyShareLink = useCallback(async () => {
    const rawUrl = await buildShareUrl();
    const hashFragment = new URL(rawUrl).hash.replace(/^#/, '');
    const ogUrl = new URL('/api/og', window.location.origin);
    ogUrl.searchParams.set('h', hashFragment);
    await navigator.clipboard.writeText(ogUrl.toString());
  }, [buildShareUrl]);

  const copyShortLink = useCallback(async () => {
    const rawUrl = await buildShareUrl();
    const hashFragment = new URL(rawUrl).hash.replace(/^#/, '');
    const ogUrl = new URL('/api/og', window.location.origin);
    ogUrl.searchParams.set('h', hashFragment);

    const resp = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: ogUrl.toString() }),
    });
    const data = (await resp.json()) as { shortUrl?: string; error?: string };
    if (!data.shortUrl) throw new Error(data.error ?? 'Shortening failed');
    await navigator.clipboard.writeText(data.shortUrl);
  }, [buildShareUrl]);

  return {
    markdown,
    setMarkdown,
    saveState,
    linkChars,
    formatTag,
    viewMode,
    isEncrypted,
    toggleEncryption,
    buildShareUrl,
    copyShareLink,
    copyShortLink,
    clearDocument,
  };
}
