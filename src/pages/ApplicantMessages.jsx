import React from 'react';
import ApplicantLayout from '../components/ApplicantLayout';
import PlaceholderContent from '../components/PlaceholderContent';
import { ChatIcon } from '../components/Icons';

export default function ApplicantMessages({ onNavigate }) {
    return (
        <ApplicantLayout activePage="applicant-messages" onNavigate={onNavigate}>
            <PlaceholderContent 
                title="No messages yet" 
                message="You'll see notifications here when you receive updates." 
                icon={<ChatIcon />} 
            />
        </ApplicantLayout>
    );
}