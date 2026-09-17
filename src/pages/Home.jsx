import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ScholarshipCard from '../components/ScholarshipCard.jsx';
import scholarships from '../data/scholarships.js';
import opportunities from '../data/opportunities.js';
import './Home.css';

const categories = [
  { label: 'Undergraduate', filterKey: 'level', filterValue: 'Undergraduate' },
  { label: "Master's", filterKey: 'level', filterValue: "Master's" },
  { label: 'PhD', filterKey: 'level', filterValue: 'PhD' },
  { label: 'Fully Funded', filterKey: 'funding', filterValue: 'Fully Funded' },
  { label: 'Partial Funding', filterKey: 'funding', filterValue: 'Partial Funding' },
  { label: 'Study Abroad', to: '/study-abroad' },
  { label: 'Fellowships', to: '/opportunities' },
  { label: 'Internships', to: '/opportunities' },
];

export default function Home() {
  const featured = scholarships.filter((s) => s.status === 'active').slice(0, 3);
  const latestOpportunities = opportunities.filter((o) => o.status === 'active').slice(0, 3);

  return (
    <>
      <Seo
        title="GamScholarship | Scholarships & Study Abroad Opportunities"
        description="Discover scholarships, study-abroad opportunities and other opportunities for Gambian students."
      />

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Find Your Next Opportunity</h1>
            <p>
              Discover scholarships, study-abroad opportunities and other
              opportunities for Gambian students.
            </p>
            <div className="hero-actions">
              <Link to="/scholarships" className="btn btn-accent">
                Explore Scholarships
              </Link>
              <Link to="/study-abroad" className="btn btn-outline">
                Study Abroad
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 400 320" role="img" aria-label="Illustration of a graduation cap and open book">
              <ellipse cx="200" cy="290" rx="150" ry="18" fill="#06331f" opacity="0.25" />
              <rect x="90" y="180" width="220" height="70" rx="10" fill="#ffffff" opacity="0.95" />
              <rect x="105" y="195" width="190" height="10" rx="5" fill="#e4e7e3" />
              <rect x="105" y="215" width="140" height="10" rx="5" fill="#e4e7e3" />
              <polygon points="200,70 340,120 200,170 60,120" fill="#F2C94C" />
              <polygon points="200,170 320,125 320,150 200,190 80,150 80,125" fill="#d9ac1f" />
              <line x1="340" y1="120" x2="340" y2="175" stroke="#ffffff" strokeWidth="4" />
              <circle cx="340" cy="182" r="6" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Featured Scholarships</h2>
            <p>A snapshot of opportunities currently open for applications.</p>
          </div>
          <div className="grid grid-3">
            {featured.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/scholarships" className="btn btn-primary">
              View All Scholarships
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <h2>Browse by Category</h2>
            <p>Jump straight to the type of opportunity you're looking for.</p>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={
                  cat.to ||
                  `/scholarships?${cat.filterKey}=${encodeURIComponent(cat.filterValue)}`
                }
                className="category-pill"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container why-grid">
          <div>
            <div className="section-heading" style={{ textAlign: 'left', margin: 0 }}>
              <h2>Why GamScholarship?</h2>
            </div>
            <ul className="why-list">
              <li>Discover scholarship and study-abroad opportunities in one place</li>
              <li>Understand eligibility requirements before you apply</li>
              <li>Track application deadlines so you never miss one</li>
              <li>Explore study-abroad destinations and what to expect</li>
              <li>Prepare professional applications with SmartCV</li>
            </ul>
          </div>
          <div className="why-art" aria-hidden="true">
            <svg viewBox="0 0 320 260" role="img" aria-label="Illustration of a checklist">
              <rect x="30" y="20" width="260" height="220" rx="16" fill="#e8f3ee" />
              <rect x="60" y="60" width="200" height="16" rx="8" fill="#0B5D3B" />
              <rect x="60" y="100" width="160" height="12" rx="6" fill="#9fc3af" />
              <rect x="60" y="126" width="180" height="12" rx="6" fill="#9fc3af" />
              <rect x="60" y="152" width="140" height="12" rx="6" fill="#9fc3af" />
              <circle cx="245" cy="180" r="26" fill="#F2C94C" />
              <path d="M234 180 l7 8 l16 -18" fill="none" stroke="#22270f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <section className="section smartcv-band">
        <div className="container smartcv-band-inner">
          <div>
            <h2>Build a Professional CV</h2>
            <p>
              SmartCV helps students create professional CVs and cover letters
              tailored to scholarship and job applications.
            </p>
          </div>
          <a
            href="https://smartcv.gamscolarship.online"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent"
          >
            Create Your CV
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Latest Opportunities</h2>
            <p>Internships, fellowships, and other opportunities beyond scholarships.</p>
          </div>
          <div className="grid grid-3">
            {latestOpportunities.map((o) => (
              <article key={o.id} className="card">
                <span className="badge">{o.category}</span>
                <h3 className="scholarship-card-title" style={{ marginTop: 10 }}>
                  {o.title}
                </h3>
                <p className="scholarship-card-org">
                  {o.organization} &middot; {o.country}
                </p>
                <p className="scholarship-card-desc">{o.description}</p>
              </article>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/opportunities" className="btn btn-primary">
              View All Opportunities
            </Link>
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-band-inner">
          <h2>Never Miss a Deadline</h2>
          <p>
            New scholarships and opportunities are added regularly &mdash;
            check back often, or start exploring now.
          </p>
          <Link to="/scholarships" className="btn btn-accent">
            Browse Scholarships
          </Link>
        </div>
      </section>
    </>
  );
}
