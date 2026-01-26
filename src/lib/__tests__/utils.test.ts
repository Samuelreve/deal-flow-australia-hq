/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn - className utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra');
  });

  it('should handle empty strings', () => {
    expect(cn('base', '', 'extra')).toBe('base extra');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle object notation', () => {
    expect(cn({ active: true, disabled: false, visible: true })).toBe('active visible');
  });

  it('should merge conflicting tailwind utility classes', () => {
    // Later classes should override earlier ones
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should handle complex mixed inputs', () => {
    const result = cn(
      'base-class',
      ['array-class1', 'array-class2'],
      { 'conditional-true': true, 'conditional-false': false },
      undefined,
      'final-class'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('array-class1');
    expect(result).toContain('array-class2');
    expect(result).toContain('conditional-true');
    expect(result).not.toContain('conditional-false');
    expect(result).toContain('final-class');
  });
});
