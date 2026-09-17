import { useMemo, useState } from 'react';
import Seo from '../components/Seo.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import opportunities from '../data/opportunities.js';
import './Scholarships.css';

const categories = ['Internships', 'Fellowships', 'Competitions', 'Exchanges', 'Research', 'Training'];

export default function Opportunities() {
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    let list = opportunities.filter((o) => o.status === 'active');
    if (category) list = list.filter((o) => o.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [category, query]);

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

          <p className="results-count">
            {results.length} opportunit{results.length === 1 ? 'y' : 'ies'} found
          </p>

          {results.length > 0 ? (
            <div className="grid grid-3">
              {results.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No opportunities match your search right now.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
