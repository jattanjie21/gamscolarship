import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ScholarshipCard from '../components/ScholarshipCard.jsx';
import scholarships from '../data/scholarships.js';
import './Scholarships.css';

function unique(arr) {
  return Array.from(new Set(arr)).sort();
}

export default function Scholarships() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [funding, setFunding] = useState(searchParams.get('funding') || '');
  const [field, setField] = useState(searchParams.get('field') || '');

  const levels = useMemo(() => unique(scholarships.map((s) => s.level)), []);
  const countries = useMemo(() => unique(scholarships.map((s) => s.country)), []);
  const fundings = useMemo(() => unique(scholarships.map((s) => s.funding)), []);
  const fields = useMemo(() => unique(scholarships.map((s) => s.field)), []);

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (level) params.level = level;
    if (country) params.country = country;
    if (funding) params.funding = funding;
    if (field) params.field = field;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, level, country, funding, field]);

  const results = useMemo(() => {
    let list = scholarships.filter((s) => s.status === 'active');

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.organization.toLowerCase().includes(q)
      );
    }
    if (level) list = list.filter((s) => s.level === level);
    if (country) list = list.filter((s) => s.country === country);
    if (funding) list = list.filter((s) => s.funding === funding);
    if (field) list = list.filter((s) => s.field === field);

    list = [...list].sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      const validA = !Number.isNaN(dateA);
      const validB = !Number.isNaN(dateB);
      if (validA && validB) return dateA - dateB;
      if (validA) return -1;
      if (validB) return 1;
      return 0;
    });
    return list;
  }, [query, level, country, funding, field]);

  const clearFilters = () => {
    setQuery('');
    setLevel('');
    setCountry('');
    setFunding('');
    setField('');
  };

  return (
    <>
      <Seo
        title="Scholarships | GamScholarship"
        description="Search and filter scholarship opportunities by degree level, country, funding type and field of study."
      />

      <section className="page-header">
        <div className="container">
          <h1>Scholarships</h1>
          <p>Browse current scholarship opportunities. Use the filters to narrow your search.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <input
              type="search"
              className="filters-search"
              placeholder="Search scholarships..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search scholarships"
            />

            <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter by degree level">
              <option value="">All degree levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select value={funding} onChange={(e) => setFunding(e.target.value)} aria-label="Filter by funding type">
              <option value="">All funding types</option>
              {fundings.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select value={field} onChange={(e) => setField(e.target.value)} aria-label="Filter by field of study">
              <option value="">All fields of study</option>
              {fields.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {(query || level || country || funding || field) && (
              <button type="button" className="btn btn-outline-dark" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          <p className="results-count">
            {results.length} scholarship{results.length === 1 ? '' : 's'} found
          </p>

          {results.length > 0 ? (
            <div className="grid grid-3">
              {results.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No scholarships match your filters right now. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
