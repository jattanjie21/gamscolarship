import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Seo from '../components/Seo.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import './Scholarships.css';

const categories = ['Internships', 'Fellowships', 'Competitions', 'Exchanges', 'Research', 'Training'];

export default function Opportunities() {
  const opportunities = useQuery(api.opportunities.list);
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');

  const list = opportunities ?? [];
  const loading = opportunities === undefined;

  const results = useMemo(() => {
    let filtered = list;
    if (category) filtered = filtered.filter((o) => o.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      const validA = !Number.isNaN(dateA);
      const validB = !Number.isNaN(dateB);
      if (validA && validB) return dateA - dateB;
      if (validA) return -1;
      if (validB) return 1;
      return 0;
    });
  }, [list, category, query]);

  return (
    <>
      <Seo
        title="Opportunities | GamScholarship"
        description="Explore internships, fellowships, competitions, exchanges, research and training opportunities for students."
      />

      <section className="page-header">
        <div className="container">
          <h1>Opportunities</h1>
          <p>Internships, fellowships, competitions, exchanges, research and training &mdash; beyond scholarships.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <input
              type="search"
              className="filters-search"
              placeholder="Search opportunities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search opportunities"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="results-count">Loading opportunities...</p>
          ) : (
            <>
              <p className="results-count">
                {results.length} opportunit{results.length === 1 ? 'y' : 'ies'} found
              </p>

              {results.length > 0 ? (
                <div className="grid grid-3">
                  {results.map((o) => (
                    <OpportunityCard key={o._id} opportunity={o} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No opportunities match your search right now.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
