import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CopyButton } from './CopyButton';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe('CopyButton', () => {
  beforeEach(() => {
    stubClipboard();
  });

  it('renders the copy label initially', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('writes the text to clipboard on click', async () => {
    const user = userEvent.setup();
    const writeText = stubClipboard();
    render(<CopyButton text="hello world" />);
    await user.click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('shows the copied label after click', async () => {
    const user = userEvent.setup();
    render(<CopyButton text="hello" />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });
});
