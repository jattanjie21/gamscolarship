import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import './components/Cards.css';

import Home from './pages/Home.jsx';
import Scholarships from './pages/Scholarships.jsx';
import ScholarshipDetails from './pages/ScholarshipDetails.jsx';
import StudyAbroad from './pages/StudyAbroad.jsx';
import Opportunities from './pages/Opportunities.jsx';
import Tips from './pages/Tips.jsx';
import SmartCV from './pages/SmartCV.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminQueue from './pages/admin/AdminQueue.jsx';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
          <Route path="/study-abroad" element={<StudyAbroad />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/smartcv" element={<SmartCV />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/admin" element={<AdminQueue />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
