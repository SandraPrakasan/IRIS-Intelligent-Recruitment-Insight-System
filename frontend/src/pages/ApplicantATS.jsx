import React from 'react';
import ApplicantLayout from '../components/ApplicantLayout';
import PlaceholderContent from '../components/PlaceholderContent';
import { AtsCheckerIcon } from '../components/Icons';

export default function ApplicantATS({ onNavigate }) {
    return (
        <ApplicantLayout activePage="applicant-ats" onNavigate={onNavigate}>
            <PlaceholderContent 
                title="ATS Checker" 
                message="This feature is under development." 
                icon={<AtsCheckerIcon />} 
            />
        </ApplicantLayout>
    );
}