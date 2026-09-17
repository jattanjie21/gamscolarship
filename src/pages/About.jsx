import Seo from '../components/Seo.jsx';
import './StaticPage.css';

export default function About() {
  return (
    <>
      <Seo
        title="About | GamScholarship"
        description="GamScholarship's mission is to help Gambian students discover scholarships and study-abroad opportunities."
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
            GamScholarship exists to help Gambian students &mdash; and other
            students looking for similar opportunities &mdash; discover
            scholarships, study-abroad options, fellowships, and internships
            that can support their education.
          </p>

          <h2>What We Focus On</h2>
          <ul>
            <li>Helping students discover scholarship and study-abroad opportunities</li>
            <li>Making information about eligibility and requirements easier to find</li>
            <li>Supporting students pursuing education locally and abroad</li>
            <li>Providing useful application resources, including SmartCV</li>
          </ul>

          <h2>A Growing Platform</h2>
          <p>
            GamScholarship is under active development. Opportunity listings
            are added and updated over time, and features are improved based
            on what students find most useful.
          </p>
        </div>
      </section>
    </>
  );
}
