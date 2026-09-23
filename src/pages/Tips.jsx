import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import './Tips.css';

const steps = [
  {
    title: 'Start early — 6 to 12 months ahead',
    body:
      'Strong scholarship applications take time. Academic transcripts, recommendation letters, English tests (IELTS/TOEFL), and passports/visas can each take weeks to arrange. Working backward from a deadline is the single most common thing applicants get wrong.',
  },
  {
    title: 'Gather your core documents',
    body:
      'Most scholarships ask for a similar core set: academic transcripts and certificates, a valid passport, a CV/resume, a personal statement or motivation letter, and 1–3 letters of recommendation. Keep digital copies (PDF) organized in one folder so you can apply quickly when you find a fit.',
  },
  {
    title: 'Check eligibility carefully before you start',
    body:
      'Read the eligibility section first — country of citizenship, age limits, minimum GPA, required work experience, and field of study restrictions vary a lot between programs. Applying to something you\'re not eligible for wastes the time you could spend on ones you can actually win.',
  },
  {
    title: 'Write a focused personal statement',
    body:
      'Explain clearly what you want to study, why, and what you plan to do afterward. Specific and honest beats generic and impressive-sounding — admissions committees read thousands of these and can tell the difference.',
  },
  {
    title: 'Ask for recommendation letters early',
    body:
      'Give your recommenders (teachers, lecturers, employers) at least 3–4 weeks notice, and share your CV and a short summary of what you\'re applying for so they can write something specific rather than generic.',
  },
  {
    title: 'Prepare for language tests if required',
    body:
      'Many international scholarships require IELTS or TOEFL scores. These take time to book, sit, and receive results for — check the required minimum score for your target program and plan the test date well before the deadline.',
  },
  {
    title: 'Track every deadline in one place',
    body:
      'Keep a simple list or calendar of every scholarship you\'re applying to, with its deadline and required documents. Missing a strong-fit scholarship because of a missed date is one of the most avoidable mistakes.',
  },
  {
    title: 'Apply to more than one',
    body:
      'Scholarship competitions are competitive by nature, even for strong candidates. Applying to several realistic options (not just the most famous ones) meaningfully improves your overall odds.',
  },
];

const commonDocuments = [
  'Valid passport or national ID',
  'Academic transcripts and degree/diploma certificates',
  'CV / resume',
  'Personal statement or motivation letter',
  '1–3 letters of recommendation',
  'English language test results (IELTS/TOEFL), if required',
  'Passport-sized photo',
  'Proof of admission or course offer (for some programs)',
];

export default function Tips() {
  return (
    <>
      <Seo
        title="Scholarship Prep Tips | GamScholarship"
        description="Practical, general guidance on how to prepare a strong scholarship application: documents needed, timelines, and common mistakes to avoid."
      />

      <section className="page-header">
        <div className="container">
          <h1>Preparing Your Application</h1>
          <p>
            General guidance on getting scholarship-ready. This isn't
            specific to any one program &mdash; always follow the exact
            requirements listed on each scholarship's official page.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container tips-layout">
          <div className="tips-main">
            <h2>Step by Step</h2>
            <div className="tips-steps">
              {steps.map((step, index) => (
                <div className="tip-step" key={step.title}>
                  <div className="tip-step-number">{index + 1}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="tips-sidebar card">
            <h3>Commonly Requested Documents</h3>
            <ul className="tips-doc-list">
              {commonDocuments.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
            <p className="tips-sidebar-note">
              Exact requirements vary by program &mdash; always check the
              official scholarship page for its specific document list.
            </p>
            <Link to="/scholarships" className="btn btn-primary btn-block">
              Browse Scholarships
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
