import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Action</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies className prop', () => {
    render(<Button className="custom">Label</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('forwards extra props to the button element', () => {
    render(<Button aria-label="save document">Save</Button>);
    expect(screen.getByRole('button', { name: 'save document' })).toBeInTheDocument();
  });
});
