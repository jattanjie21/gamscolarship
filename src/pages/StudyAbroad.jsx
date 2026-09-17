import Seo from '../components/Seo.jsx';
import countries from '../data/countries.js';
import './StudyAbroad.css';

export default function StudyAbroad() {
  return (
    <>
      <Seo
        title="Study Abroad | GamScholarship"
        description="Explore study-abroad destinations including the UK, Canada, USA, Germany, France, Turkey, China and Australia."
      />

      <section className="page-header">
        <div className="container">
          <h1>Study Abroad</h1>
          <p>
            General information on popular study destinations. Always confirm
            visa and admission requirements with the relevant embassy or
            institution before applying.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {countries.map((c) => (
              <article key={c.id} className="card country-card">
                <h3>{c.name}</h3>
                <p className="country-overview">{c.overview}</p>

                <h4>Popular Study Options</h4>
                <ul>
                  {c.popularOptions.map((opt) => (
                    <li key={opt}>{opt}</li>
                  ))}
                </ul>

                <h4>Scholarship Possibilities</h4>
                <p className="country-note">{c.scholarshipNotes}</p>

                <h4>Admission Considerations</h4>
                <p className="country-note">{c.admissionNotes}</p>

                <a
                  href={c.usefulLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark btn-block"
                >
                  Official Resource
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
