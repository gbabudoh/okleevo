import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted HTML before rendering with dangerouslySetInnerHTML.
 * Strips scripts, event handlers, and dangerous attributes while preserving
 * safe formatting tags (p, b, i, a, br, ul, ol, li, blockquote, etc.).
 * Must only be called in browser context ("use client" components).
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'span', 'div',
      'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
    FORCE_BODY: true,
  });
}
