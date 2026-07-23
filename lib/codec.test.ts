import { describe, test, expect } from 'vitest';
import { encode, encodeFast, decode } from './codec';

describe('encode / decode round-trip', () => {
  const cases = [
    'Hello world',
    '# My Note\n\nSome content here.',
    '# Shopping\n\n- [ ] Milk\n- [x] Eggs\n- [ ] Bread',
    'a'.repeat(2000),
  ];

  test.each(cases)('encode → decode: %s', async text => {
    const hash = await encode(text);
    expect(hash.length).toBeGreaterThan(0);
    expect(['b', 'c', 'r']).toContain(hash[0]);
    const decoded = await decode(hash);
    expect(decoded).toBe(text);
  });

  test.each(cases)('encodeFast → decode: %s', async text => {
    const hash = await encodeFast(text);
    expect(hash.length).toBeGreaterThan(0);
    expect(['b', 'c', 'r']).toContain(hash[0]);
    const decoded = await decode(hash);
    expect(decoded).toBe(text);
  });
});

describe('encodeFast produces smaller output than encode for large docs', () => {
  test('quality-1 hash is not necessarily shorter for large docs (sanity check)', async () => {
    const large = '# Header\n\n' + 'Lorem ipsum dolor sit amet. '.repeat(200);
    const fast = await encodeFast(large);
    const full = await encode(large);
    // full-quality (11) should compress better on large content
    expect(full.length).toBeLessThanOrEqual(fast.length);
  });
});
