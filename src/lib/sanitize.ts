import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Only allows safe formatting tags.
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'p', 'br', 'span', 'b', 'i', 'u'],
    ALLOWED_ATTR: ['class', 'style', 'data-highlight-id', 'data-category'],
  });
};

/**
 * Escape HTML entities to prevent XSS when inserting text into HTML.
 */
export const escapeHtml = (text: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};

/**
 * Convert markdown-like syntax to HTML and sanitize.
 * Used for AI-generated content.
 */
export const markdownToSafeHtml = (text: string): string => {
  if (!text) return '';
  
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/g, '<p>$1</p>');
  
  return sanitizeHtml(html);
};
