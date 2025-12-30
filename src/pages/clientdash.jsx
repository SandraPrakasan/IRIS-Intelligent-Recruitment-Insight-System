import React, { useState } from 'react';

// ✅ Import your new modular page components
// Make sure these paths match exactly where you saved the files
import ApplicantProfile from './ApplicantProfile';
import ApplicantJobPage from './ApplicantJobPage';
import ApplicantInterviews from './ApplicantInterviews';
import ApplicantATS from './ApplicantATS';
import ApplicantMessages from './ApplicantMessages';

export default function ClientDash({ onNavigate: globalNavigate }) {
    
    // Default to the profile page when logging in
    const [activePage, setActivePage] = useState('applicant-profile');

    // 🛑 Traffic Controller Function
    // This decides if we are switching TABS (internal) or LOGGING OUT (external)
    const handleNavigation = (destination) => {
        if (destination === 'login') {
            // Pass 'login' up to App.js to handle logout
            globalNavigate('login');
        } else {
            // Otherwise, just switch the local tab
            setActivePage(destination);
        }
    };

    // Render the correct component based on the activePage state
    // We pass our new 'handleNavigation' down to the pages so their buttons work
    switch (activePage) {
        case 'applicant-profile':
            return <ApplicantProfile onNavigate={handleNavigation} />;
        
        case 'applicant-jobs':
            return <ApplicantJobPage onNavigate={handleNavigation} />;
            
        case 'applicant-interviews':
            return <ApplicantInterviews onNavigate={handleNavigation} />;
            
        case 'applicant-ats':
            return <ApplicantATS onNavigate={handleNavigation} />;
            
        case 'applicant-messages':
            return <ApplicantMessages onNavigate={handleNavigation} />;
            
        default:
            return <ApplicantProfile onNavigate={handleNavigation} />;
    }
}