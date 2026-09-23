import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import './NotFound.css';

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found | GamScholarship" description="The page you are looking for does not exist." />

      <section className="not-found">
        <div className="container not-found-inner">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for does not exist.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">Go Home</Link>
            <Link to="/scholarships" className="btn btn-outline-dark">Browse Scholarships</Link>
          </div>
        </div>
      </section>
    </>
  );
}
