import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalShell } from './ModalShell';

describe('ModalShell', () => {
  it('renders nothing when closed', () => {
    render(
      <ModalShell open={false} onClose={vi.fn()}>
        <p>Content</p>
      </ModalShell>,
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children when open', () => {
    render(
      <ModalShell open onClose={vi.fn()}>
        <p>Modal content</p>
      </ModalShell>,
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ModalShell open onClose={onClose}>
        <p>Content</p>
      </ModalShell>,
    );
    // The backdrop is the first child of the fragment
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <ModalShell open onClose={onClose}>
        <p>Content</p>
      </ModalShell>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on non-Escape keys', () => {
    const onClose = vi.fn();
    render(
      <ModalShell open onClose={onClose}>
        <p>Content</p>
      </ModalShell>,
    );
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
