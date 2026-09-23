import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Seo from '../components/Seo.jsx';
import './ScholarshipDetails.css';

function formatDeadline(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ScholarshipDetails() {
  const { id } = useParams();
  const scholarship = useQuery(api.scholarships.getById, { id });

  // Still loading
  if (scholarship === undefined) {
    return (
      <section className="section">
        <div className="container">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  // Not found (invalid id, or it was deleted)
  if (scholarship === null) {
    return <Navigate to="/404" replace />;
  }

  const {
    title,
    organization,
    country,
    level,
    funding,
    field,
    deadline,
    description,
    eligibility,
    requirements,
    benefits,
    applicationUrl,
    isSample,
  } = scholarship;

  return (
    <>
      <Seo title={`${title} | GamScholarship`} description={description} />

      <section className="page-header">
        <div className="container">
          <Link to="/scholarships" className="back-link">&larr; Back to Scholarships</Link>
          <h1>{title}</h1>
          <p>{organization} &middot; {country}</p>
        </div>
      </section>

      <section className="section">
        <div className="container details-layout">
          <div className="details-main">
            {isSample && (
              <div className="sample-notice">
                This is sample/demo data included to demonstrate the site layout.
                Verify details on the official source before applying.
              </div>
            )}

            <h2>Overview</h2>
            <p>{description}</p>

            <h2>Eligibility</h2>
            <ul>
              {eligibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>Requirements</h2>
            <ul>
              {requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>Benefits</h2>
            <ul>
              {benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className="details-sidebar card">
            <dl className="details-facts">
              <dt>Degree Level</dt>
              <dd>{level}</dd>
              <dt>Field of Study</dt>
              <dd>{field}</dd>
              <dt>Funding Type</dt>
              <dd>{funding}</dd>
              <dt>Application Deadline</dt>
              <dd>{formatDeadline(deadline)}</dd>
            </dl>
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent btn-block"
            >
              Apply Now
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
