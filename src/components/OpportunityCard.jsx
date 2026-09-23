function formatDeadline(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OpportunityCard({ opportunity }) {
  const { title, organization, category, country, deadline, description, applicationUrl, isSample } =
    opportunity;

  return (
    <article className="card opportunity-card">
      <div className="scholarship-card-top">
        <span className="badge">{category}</span>
        {isSample && <span className="badge badge-sample">Sample data</span>}
      </div>
      <h3 className="scholarship-card-title">{title}</h3>
      <p className="scholarship-card-org">{organization} &middot; {country}</p>
      <p className="scholarship-card-desc">{description}</p>
      <div className="scholarship-card-footer">
        <span className="scholarship-card-deadline">
          Deadline: <strong>{formatDeadline(deadline)}</strong>
        </span>
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-dark"
        >
          Learn More
        </a>
      </div>
    </article>
  );
}
