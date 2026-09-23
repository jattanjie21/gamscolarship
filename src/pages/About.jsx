import Seo from '../components/Seo.jsx';
import './StaticPage.css';

export default function About() {
  return (
    <>
      <Seo
        title="About | GamScholarship"
        description="GamScholarship helps students discover scholarship opportunities from around the world."
      />

      <section className="page-header">
        <div className="container">
          <h1>About GamScholarship</h1>
          <p>Making opportunity information easier to find.</p>
        </div>
      </section>

      <section className="section">
        <div className="container static-content">
          <h2>Our Mission</h2>
          <p>
            GamScholarship exists to make scholarship information easier to
            discover, understand, and access.
          </p>

          <h2>What We Focus On</h2>
          <ul>
            <li>Helping students discover scholarship opportunities</li>
            <li>Making eligibility and requirements easier to understand</li>
            <li>Keeping scholarship listings current</li>
            <li>Linking applicants to official application pages</li>
          </ul>

          <h2>A Growing Platform</h2>
          <p>
            GamScholarship is under active development. Scholarship listings are added and updated automatically as the platform grows.
          </p>
        </div>
      </section>
    </>
  );
}
