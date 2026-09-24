import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import './components/Cards.css';

import Home from './pages/Home.jsx';
import Scholarships from './pages/Scholarships.jsx';
import ScholarshipDetails from './pages/ScholarshipDetails.jsx';
import Tips from './pages/Tips.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import AdminApp from './pages/admin/AdminApp.jsx';
import NotFound from './pages/NotFound.jsx';

function PublicLayout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route
        path="*"
        element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
              <Route path="/tips" element={<Tips />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PublicLayout>
        }
      />
    </Routes>
  );
}
