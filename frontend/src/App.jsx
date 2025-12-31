import React, { useState } from 'react';

// --- Imports ---
import LoginPage from './pages/LoginPage';
import AdminLogin from './pages/AdminLogin';
import AppliLogin from './pages/AppliLogin';
import ClientDash from './pages/clientdash';
import Admindash from './pages/admindash';

// --- Applicant Pages ---
import ApplicantJobPage from './pages/ApplicantJobPage';
import ApplicantProfile from './pages/ApplicantProfile';    // Make sure this file exists
import ApplicantATS from './pages/ApplicantATS';            // Make sure this file exists
import ApplicantInterviews from './pages/ApplicantInterviews'; // Make sure this file exists
import ApplicantMessages from './pages/ApplicantMessages';    // Make sure this file exists

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      // --- AUTH ---
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'admin': return <AdminLogin onNavigate={handleNavigate} />;
      case 'applicant': return <AppliLogin onNavigate={handleNavigate} />;

      // --- APPLICANT ROUTES ---
      case 'applicant-jobs':
        return <ApplicantJobPage onNavigate={handleNavigate} />;

      case 'applicant-profile':
        return <ApplicantProfile onNavigate={handleNavigate} />;
      
      case 'applicant-interviews':
        return <ApplicantInterviews onNavigate={handleNavigate} />;

      case 'applicant-ats':
        return <ApplicantATS onNavigate={handleNavigate} />;

      case 'applicant-messages':
        return <ApplicantMessages onNavigate={handleNavigate} />;

      // --- ADMIN / RECRUITER ---
      case 'dashboard': return <ClientDash onNavigate={handleNavigate} />;
      case 'admin-dashboard': return <Admindash onNavigate={handleNavigate} />;

      // --- DEFAULT ---
      default: return <LoginPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background-color: #0f172a; }
      `}</style>
      
      {renderPage()}
    </div>
  );
}