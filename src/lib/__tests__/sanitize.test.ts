/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml, markdownToSafeHtml } from '../sanitize';

describe('sanitizeHtml', () => {
  it('should allow safe formatting tags', () => {
    const input = '<strong>Bold</strong> and <em>italic</em>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  it('should allow paragraph and line break tags', () => {
    const input = '<p>Paragraph 1</p><br><p>Paragraph 2</p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<br>');
  });

  it('should allow span tags', () => {
    const input = '<span class="highlight">Text</span>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<span');
    expect(result).toContain('class="highlight"');
  });

  it('should strip dangerous script tags', () => {
    const input = '<script>alert("xss")</script><p>Safe</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Safe</p>');
  });

  it('should strip onclick handlers', () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('<p>Click me</p>');
  });

  it('should strip iframe tags', () => {
    const input = '<iframe src="evil.com"></iframe><p>Safe</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('iframe');
    expect(result).toContain('<p>Safe</p>');
  });

  it('should strip img tags (not in allowed list)', () => {
    const input = '<img src="x" onerror="alert(1)"><p>Safe</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<img');
    expect(result).toContain('<p>Safe</p>');
  });

  it('should preserve data attributes for highlighting', () => {
    const input = '<span data-highlight-id="123" data-category="risk">Text</span>';
    const result = sanitizeHtml(input);
    expect(result).toContain('data-highlight-id="123"');
    expect(result).toContain('data-category="risk"');
  });

  it('should handle empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});

describe('escapeHtml', () => {
  it('should escape ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape less than', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('should escape double quotes', () => {
    expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("It's fine")).toBe("It&#39;s fine");
  });

  it('should escape all special characters together', () => {
    const input = '<script>alert("xss" & \'test\')</script>';
    const result = escapeHtml(input);
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot; &amp; &#39;test&#39;)&lt;/script&gt;');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle string with no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('markdownToSafeHtml', () => {
  it('should convert bold markdown', () => {
    const result = markdownToSafeHtml('This is **bold** text');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('should convert italic markdown', () => {
    const result = markdownToSafeHtml('This is *italic* text');
    expect(result).toContain('<em>italic</em>');
  });

  it('should convert double newlines to paragraphs', () => {
    const result = markdownToSafeHtml('Paragraph 1\n\nParagraph 2');
    expect(result).toContain('</p><p>');
  });

  it('should convert single newlines to line breaks', () => {
    const result = markdownToSafeHtml('Line 1\nLine 2');
    expect(result).toContain('<br>');
  });

  it('should handle empty input', () => {
    expect(markdownToSafeHtml('')).toBe('');
  });

  it('should handle null-ish input', () => {
    // @ts-expect-error testing runtime behavior
    expect(markdownToSafeHtml(null)).toBe('');
    // @ts-expect-error testing runtime behavior
    expect(markdownToSafeHtml(undefined)).toBe('');
  });

  it('should sanitize the output (no XSS)', () => {
    const result = markdownToSafeHtml('Normal text <script>alert(1)</script>');
    expect(result).not.toContain('<script>');
  });

  it('should handle complex markdown', () => {
    const input = '**Bold** and *italic*\n\nNew paragraph with **more bold**';
    const result = markdownToSafeHtml(input);
    expect(result).toContain('<strong>Bold</strong>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('</p><p>');
    expect(result).toContain('<strong>more bold</strong>');
  });
});
