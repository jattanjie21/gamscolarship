import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">GamScholarship</div>
          <p className="footer-text">
            Helping Gambian and international students discover scholarships,
            study-abroad opportunities, and fellowships.
          </p>
        </div>

        <div>
          <h4 className="footer-heading">Explore</h4>
          <ul className="footer-list">
            <li><Link to="/scholarships">Scholarships</Link></li>
            <li><Link to="/study-abroad">Study Abroad</Link></li>
            <li><Link to="/opportunities">Opportunities</Link></li>
            <li><Link to="/tips">Prep Tips</Link></li>
            <li><Link to="/smartcv">SmartCV</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-list">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Contact</h4>
          <p className="footer-text">
            <a href="mailto:info@gamscolarship.online">info@gamscolarship.online</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          &copy; {year} GamScholarship. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
