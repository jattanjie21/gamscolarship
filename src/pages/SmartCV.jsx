import Seo from '../components/Seo.jsx';
import './StaticPage.css';

export default function SmartCV() {
  return (
    <>
      <Seo
        title="SmartCV | GamScholarship"
        description="SmartCV helps students create professional CVs and cover letters for scholarship and job applications."
      />

      <section className="page-header">
        <div className="container">
          <h1>SmartCV</h1>
          <p>Build a professional CV and cover letter, tailored for scholarship and job applications.</p>
        </div>
      </section>

      <section className="section">
        <div className="container static-content">
          <p>
            SmartCV helps students create professional CVs and cover letters
            so applications stand out to scholarship committees, universities,
            and employers.
          </p>
          <p>
            Clicking the button below opens SmartCV in a new tab, so you don't
            lose your place on GamScholarship.
          </p>
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
    </>
  );
}
