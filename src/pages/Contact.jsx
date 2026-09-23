import { useState } from 'react';
import Seo from '../components/Seo.jsx';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const mailtoHref = () => {
    const subject = encodeURIComponent(form.subject || 'Message from GamScholarship contact form');
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    return `mailto:info@gamscolarship.online?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Seo
        title="Contact | GamScholarship"
        description="Get in touch with GamScholarship at info@gamscolarship.online."
      />

      <section className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>
            Email us directly at{' '}
            <a href="mailto:info@gamscolarship.online">info@gamscolarship.online</a>{' '}
            or use the form below.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-notice">
            This form doesn't send messages automatically yet &mdash; submitting
            opens your email app with the details pre-filled, ready to send to
            info@gamscolarship.online.
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />

            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
            />

            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="6"
              required
              value={form.message}
              onChange={handleChange}
            />

            <a
              href={mailtoHref()}
              className="btn btn-primary btn-block"
              onClick={(e) => {
                if (!form.name || !form.email || !form.message) {
                  e.preventDefault();
                }
              }}
            >
              Send via Email
            </a>
          </form>
        </div>
      </section>
    </>
  );
}
