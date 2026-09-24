import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAdminAuth } from './AdminAuth.jsx';

const PAGE_SIZE = 10;

function paginate(items, page) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    page: safePage,
    totalPages,
    total,
    slice: items.slice(start, start + PAGE_SIZE),
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + PAGE_SIZE, total),
  };
}

function QueueSection({ table, items, onAction }) {
  const [page, setPage] = useState(1);
  const paged = useMemo(() => paginate(items, page), [items, page]);

  useEffect(() => {
    if (page !== paged.page) setPage(paged.page);
  }, [page, paged.page]);

  return (
    <div>
      <h2 className="admin-section-title">
        {table}
        <span className="admin-source"> · {paged.total}</span>
      </h2>
      {paged.total === 0 ? (
        <p className="admin-empty">Nothing in the queue.</p>
      ) : (
        <>
          <div className="admin-list">
            {paged.slice.map((item) => (
              <div key={item._id} className="admin-card">
                <div className="admin-card-top">
                  <span className={`badge admin-status-${item.verificationStatus}`}>
                    {item.verificationStatus}
                  </span>
                  <span className="admin-source">source: {item.sourceName}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="admin-meta">
                  {item.organization} · {item.country}
                </p>
                <p className="admin-meta">
                  <a href={item.applicationUrl} target="_blank" rel="noopener noreferrer">
                    {item.applicationUrl}
                  </a>
                </p>
                {item.verificationNotes && (
                  <p className="admin-notes">{item.verificationNotes}</p>
                )}
                {item.possibleDuplicateOf && (
                  <p className="admin-notes">
                    Possible duplicate of doc id: {item.possibleDuplicateOf}
                  </p>
                )}
                <div className="admin-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onAction('approve', { table, id: item._id })}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() =>
                      onAction('reject', { table, id: item._id, reason: 'Rejected by admin.' })
                    }
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => onAction('expire', { table, id: item._id })}
                  >
                    Mark expired
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-pagination">
            <p className="admin-pagination-meta">
              Showing {paged.from}–{paged.to} of {paged.total}
            </p>
            <div className="admin-pagination-actions">
              <button
                type="button"
                className="btn btn-outline-dark"
                disabled={paged.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="admin-pagination-meta">
                Page {paged.page} of {paged.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline-dark"
                disabled={paged.page >= paged.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminQueue() {
  const { adminKey } = useAdminAuth();
  const [actionError, setActionError] = useState('');

  const queue = useQuery(api.admin.listQueue, { adminKey });
  const approve = useMutation(api.admin.approve);
  const reject = useMutation(api.admin.reject);
  const markExpired = useMutation(api.admin.markExpired);

  const runAction = async (kind, args) => {
    setActionError('');
    const fn = kind === 'approve' ? approve : kind === 'reject' ? reject : markExpired;
    try {
      await fn({ adminKey, ...args });
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Action failed.');
    }
  };

  if (queue === undefined) {
    return <p className="admin-loading">Loading queue…</p>;
  }

  if (!queue.authorized) {
    return <p className="admin-error">Session expired. Sign out and sign in again.</p>;
  }

  const pendingCount = queue.scholarships.length + queue.opportunities.length;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Review queue</h1>
          <p>
            Pending listings from every source. Nothing here is public until approved or
            auto-verified.
          </p>
        </div>
        <span className="admin-count-pill">{pendingCount} waiting</span>
      </header>

      {actionError && (
        <div className="admin-error" role="alert">
          {actionError}
        </div>
      )}

      <div className="admin-queue">
        <QueueSection table="scholarships" items={queue.scholarships} onAction={runAction} />
        <QueueSection table="opportunities" items={queue.opportunities} onAction={runAction} />
      </div>
    </div>
  );
}
