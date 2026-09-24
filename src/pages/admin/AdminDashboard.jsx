import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAdminAuth } from './AdminAuth.jsx';

function StatCard({ label, value, hint }) {
  return (
    <div className="admin-stat">
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value ?? '—'}</p>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { adminKey } = useAdminAuth();
  const stats = useQuery(api.admin.dashboardStats, { adminKey });

  if (stats === undefined) {
    return <p className="admin-loading">Loading dashboard…</p>;
  }

  if (!stats.authorized) {
    return <p className="admin-error">Session expired. Sign out and sign in again.</p>;
  }

  const queueTotal = stats.scholarships.pending + stats.opportunities.pending;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Overview</h1>
          <p>Catalogue health and items waiting for review.</p>
        </div>
        <Link to="/admin/queue" className="btn btn-primary">
          Open review queue{queueTotal > 0 ? ` (${queueTotal})` : ''}
        </Link>
      </header>

      <section className="admin-stat-grid" aria-label="Scholarship stats">
        <h2 className="admin-section-title">Scholarships</h2>
        <div className="admin-stat-row">
          <StatCard label="Live (verified)" value={stats.scholarships.verified} />
          <StatCard label="Pending review" value={stats.scholarships.pending} hint="Hidden from public" />
          <StatCard label="Rejected" value={stats.scholarships.rejected} />
          <StatCard label="Expired" value={stats.scholarships.expired} />
        </div>
      </section>

      <section className="admin-stat-grid" aria-label="Opportunity stats">
        <h2 className="admin-section-title">Opportunities</h2>
        <div className="admin-stat-row">
          <StatCard label="Live (verified)" value={stats.opportunities.verified} />
          <StatCard label="Pending review" value={stats.opportunities.pending} />
          <StatCard label="Rejected" value={stats.opportunities.rejected} />
          <StatCard label="Expired" value={stats.opportunities.expired} />
        </div>
      </section>

      <section className="admin-stat-grid" aria-label="Sources">
        <h2 className="admin-section-title">Sources</h2>
        <div className="admin-stat-row admin-stat-row-narrow">
          <StatCard
            label="Registered sources"
            value={stats.sources.total}
            hint={`${stats.sources.enabled} enabled`}
          />
        </div>
      </section>
    </div>
  );
}
