import { useEffect } from 'react';

/**
 * Lightweight SEO helper — sets the document title and meta description
 * for the current page without adding a routing/SSR dependency.
 */
export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
