import { Link } from 'react-router-dom';

function formatDeadline(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ScholarshipCard({ scholarship }) {
  const {
    _id,
    title,
    organization,
    country,
    level,
    funding,
    deadline,
    description,
    isSample,
  } = scholarship;

  return (
    <article className="card scholarship-card">
      <div className="scholarship-card-top">
        <span className="badge">{level}</span>
        <span className="badge badge-accent">{funding}</span>
        {isSample && <span className="badge badge-sample">Sample data</span>}
      </div>

      <h3 className="scholarship-card-title">{title}</h3>
      <p className="scholarship-card-org">{organization} &middot; {country}</p>
      <p className="scholarship-card-desc">{description}</p>

      <div className="scholarship-card-footer">
        <span className="scholarship-card-deadline">
          Deadline: <strong>{formatDeadline(deadline)}</strong>
        </span>
        <Link to={`/scholarships/${_id}`} className="btn btn-outline-dark">
          View Details
        </Link>
      </div>
    </article>
  );
}
