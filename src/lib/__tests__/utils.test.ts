import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'active', false && 'inactive');
    expect(result).toBe('base-class active');
  });

  it('should handle Tailwind merge conflicts', () => {
    const result = cn('px-4', 'px-6');
    // tailwind-merge should keep the last px value
    expect(result).toBe('px-6');
  });

  it('should handle multiple conflicting classes', () => {
    const result = cn('p-4', 'px-6');
    // tailwind-merge should resolve conflicts properly
    expect(result).toBe('p-4 px-6');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'active');
    expect(result).toBe('base active');
  });

  it('should handle empty strings', () => {
    const result = cn('base', '', 'active');
    expect(result).toBe('base active');
  });

  it('should handle array inputs', () => {
    const result = cn(['px-4', 'py-2']);
    expect(result).toBe('px-4 py-2');
  });

  it('should handle object inputs with clsx', () => {
    const result = cn({
      'px-4': true,
      'py-2': true,
      hidden: false,
    });
    expect(result).toBe('px-4 py-2');
  });

  it('should handle complex mixed inputs', () => {
    const result = cn(
      'base-class',
      ['px-4', 'py-2'],
      {
        active: true,
        disabled: false,
      },
      'extra-class'
    );
    expect(result).toBe('base-class px-4 py-2 active extra-class');
  });

  it('should merge Tailwind conflicting utilities correctly', () => {
    const result = cn('text-sm', 'text-lg');
    expect(result).toBe('text-lg');
  });

  it('should preserve non-conflicting Tailwind utilities', () => {
    const result = cn('text-sm font-bold', 'text-lg');
    expect(result).toBe('font-bold text-lg');
  });
});
