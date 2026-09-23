import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Seo from '../../components/Seo.jsx';
import './Admin.css';

/**
 * Private review queue — NOT linked from the public navbar (see
 * src/components/Navbar.jsx) and deliberately excluded from the sitemap/
 * robots. Reachable only by URL (/admin) plus the admin key, which is
 * never bundled into the app — it's typed in by whoever's reviewing and
 * held only in this component's state (not localStorage), so it doesn't
 * linger in the browser after a refresh.
 *
 * This is a lightweight starting point, not a full admin system — see the
 * README's "Admin access" section for how to harden this (Convex Auth,
 * IP allowlisting, etc.) before handing review access to more than one
 * trusted person.
 */
export default function AdminQueue() {
  const [adminKey, setAdminKey] = useState('');
  const [submittedKey, setSubmittedKey] = useState('');
  const [actionError, setActionError] = useState('');

  const queue = useQuery(api.admin.listQueue, submittedKey ? { adminKey: submittedKey } : 'skip');
  const approve = useMutation(api.admin.approve);
  const reject = useMutation(api.admin.reject);
  const markExpired = useMutation(api.admin.markExpired);

  const handleUnlock = (e) => {
    e.preventDefault();
    setActionError('');
    setSubmittedKey(adminKey);
  };

  const runAction = async (fn, args) => {
    setActionError('');
    try {
      await fn({ adminKey: submittedKey, ...args });
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Action failed — check the admin key is correct.');
    }
  };

  const isUnauthorized = queue !== undefined && queue.authorized === false;

  return (
    <>
      <Seo title="Admin Review Queue" description="Private review queue — not indexed." noIndex />
      <section className="section admin-section">
        <div className="container">
          <h1>Review Queue</h1>
          <p className="admin-subtitle">
            Pending and needs-review listings from every source. Nothing here is visible on the
            public site until approved.
          </p>

          <form className="admin-key-form" onSubmit={handleUnlock}>
            <label htmlFor="admin-key">Admin key</label>
            <input
              id="admin-key"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Paste your ADMIN_KEY"
            />
            <button type="submit" className="btn btn-primary">Unlock</button>
          </form>

          {actionError && <div className="admin-error">{actionError}</div>}

          {submittedKey && isUnauthorized && (
            <div className="admin-error">Not authorized — check the admin key and try again.</div>
          )}

          {submittedKey && queue === undefined && <p>Loading queue...</p>}

          {submittedKey && queue && queue.authorized && (
            <div className="admin-queue">
              {['scholarships', 'opportunities'].map((table) => (
                <div key={table}>
                  <h2 className="admin-table-heading">{table}</h2>
                  {queue[table].length === 0 ? (
                    <p className="admin-empty">Nothing in the queue.</p>
                  ) : (
                    <div className="admin-list">
                      {queue[table].map((item) => (
                        <div key={item._id} className="admin-card card">
                          <div className="admin-card-top">
                            <span className={`badge admin-status-${item.verificationStatus}`}>
                              {item.verificationStatus}
                            </span>
                            <span className="admin-source">source: {item.sourceName}</span>
                          </div>
                          <h3>{item.title}</h3>
                          <p className="admin-meta">{item.organization} &middot; {item.country}</p>
                          <p className="admin-meta">
                            <a href={item.applicationUrl} target="_blank" rel="noopener noreferrer">
                              {item.applicationUrl}
                            </a>
                          </p>
                          {item.verificationNotes && (
                            <p className="admin-notes">{item.verificationNotes}</p>
                          )}
                          {item.possibleDuplicateOf && (
                            <p className="admin-notes">Possible duplicate of doc id: {item.possibleDuplicateOf}</p>
                          )}
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => runAction(approve, { table, id: item._id })}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-dark"
                              onClick={() => runAction(reject, { table, id: item._id, reason: 'Rejected by admin.' })}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-dark"
                              onClick={() => runAction(markExpired, { table, id: item._id })}
                            >
                              Mark Expired
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
