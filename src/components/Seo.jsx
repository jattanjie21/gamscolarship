import { useEffect } from 'react';

/**
 * Lightweight SEO helper — sets the document title and meta description
 * for the current page without adding a routing/SSR dependency.
 */
export default function Seo({ title, description, noIndex }) {
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

    let robotsTag = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex, nofollow');
    } else if (robotsTag) {
      robotsTag.remove();
    }
  }, [title, description, noIndex]);

  return null;
}
