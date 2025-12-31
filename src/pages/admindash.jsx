import { supabase } from '../supabaseClient'; // Adjust the path if your file is in a different folder
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- IMPORT YOUR PAGE COMPONENTS ---
import JobPosting from './JobPosting'; // 👈 IMPORT THE NEW PAGE
import SettingsPage from './settingsPage'; // 👈 IMPORT THE NEW PAGE


// --- Icon Components ---
const HomeIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );
const UsersIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> );
const BriefcaseIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> );
const MessageSquareIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
const SettingsIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> );
const LogoutIcon = () => ( <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg> );
const PlusIcon = () => <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const ViewIcon = () => <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.5)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const SpinnerIcon = () => <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></motion.svg>;
const CheckCircleIcon = () => ( <svg style={{ width: '20px', height: '20px', color: '#34D399', marginRight: '10px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> );
const SmallCalendarIcon = () => ( <svg style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.7)' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> );
const ChevronRightIcon = () => ( <svg style={{ width: '16px', height: '16px', marginLeft: '4px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg> );
const BriefcasePlusIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>);


// --- New Icons for CV Sorting Page ---
const FiltersIcon = () => ( <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg> );
const ScoringIcon = () => ( <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M.293 7.293a1 1 0 011.414 0L6 11.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0L.293 8.707a1 1 0 010-1.414zM14 12a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L15 13.414l-2.293 2.293a1 1 0 11-1.414-1.414l3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg> );
const ClearIcon = () => ( <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg> );
const ArrowRightOnRectangleIcon = () => (<svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5"></path><polyline points="17 16 21 12 17 8"></polyline><line x1="21" y1="12" x2="7" y2="12"></line></svg>);


// --- Stat Card Component ---
const StatCard = ({ icon, value, label, tint }) => (
    <div style={{ backgroundColor: `rgba(${tint}, 0.1)`, border: `1px solid rgba(${tint}, 0.3)`, borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', }}>
        {icon}
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{value}</p>
        <p style={{ color: '#d1d5db' }}>{label}</p>
    </div>
);



// --- Placeholder for other pages ---
const PlaceholderContent = ({ title }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>{title}</h1>
    </div>
);

// --- Job Posting Modal ---
const JobPostingModal = ({ isOpen, onClose, onPostSuccess }) => {
    const handlePost = () => {
        onPostSuccess();
        onClose();
    };
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={{ width: '100%', maxWidth: '600px', backgroundColor: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '1rem', padding: '2rem', color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Job Posting</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" placeholder="Job Title" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    <input type="text" placeholder="Department (e.g., Engineering)" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select className="custom-select" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                        </select>
                        <input type="date" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>
                    <textarea placeholder="Job Description..." rows="5" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>Cancel</motion.button>
                    <motion.button onClick={handlePost} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Post Job</motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Date/Time Picker Modal ---
const DateTimeModal = ({ isOpen, onClose, onSchedule }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const handleSchedule = () => {
        if (selectedDate && selectedTime) {
            onSchedule(selectedDate, selectedTime);
            onClose();
        } else {
            alert('Please select both date and time.');
        }
    };

    if (!isOpen) return null;

    // Dynamically generate time slots for 15-minute intervals
    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 4; j++) {
                const hour = String(i).padStart(2, '0');
                const minute = String(j * 15).padStart(2, '0');
                slots.push(`${hour}:${minute}`);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '1rem', padding: '2rem', color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Schedule Interview</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>Cancel</motion.button>
                    <motion.button onClick={handleSchedule} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Schedule</motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Message Modal ---
const MessageModal = ({ isOpen, onClose, onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            onClose();
        } else {
            alert('Message cannot be empty.');
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '1rem', padding: '2rem', color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Compose Message</h2>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." rows="8" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>Cancel</motion.button>
                    <motion.button onClick={handleSend} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Send Message</motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Interview Management Page ---
const InterviewManagementPage = () => {
    const [activeSubTab, setActiveSubTab] = useState('interviews');
    const applicants = {
        interviews: [ { name: 'Varun', role: 'UI Designer', experience: '8 years', skills: ['game'], date: 'April 15th, 2025', time: '10:30 AM', status: 'Awaiting Response' }, ],
        accepted: [ { name: 'Jane Smith', role: 'UI Designer', experience: '3 years', skills: ['Figma', 'Sketch'], date: 'N/A', time: '', status: 'Accepted' }, ],
        rejected: [ { name: 'Peter Jones', role: 'Backend Developer', experience: '7 years', skills: ['Python', 'Django'], date: 'N/A', time: '', status: 'Rejected' }, ]
    };
    const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const handleSchedule = (date, time) => {
        console.log(`Scheduled for ${selectedApplicant?.name} on ${date} at ${time}`);
        // Here you would typically update your backend/state for the scheduled interview
        alert(`Interview scheduled for ${selectedApplicant?.name} on ${date} at ${time}`);
    };

    const handleSendMessage = (message) => {
        console.log(`Message to ${selectedApplicant?.name}: ${message}`);
        // Here you would typically send the message via an API
        alert(`Message sent to ${selectedApplicant?.name}: "${message}"`);
    };

    const openDateTimeModal = (applicant) => {
        setSelectedApplicant(applicant);
        setIsDateTimeModalOpen(true);
    };

    const openMessageModal = (applicant) => {
        setSelectedApplicant(applicant);
        setIsMessageModalOpen(true);
    };

    const ApplicantCard = ({ data, tab }) => {
        const statusColors = { 'Accepted': '#34D399', 'Awaiting Response': '#FBBF24', 'Rejected': '#EF4444' };
        return (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <div style={{backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.5rem'}}>
                        <SmallCalendarIcon />
                    </div>
                    <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.name}</h3>
                            <span style={{backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{data.status}</span>
                        </div>
                        <p style={{ color: '#d1d5db', marginBottom: '0.5rem' }}>{data.role} • {data.experience}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {data.skills.map(skill => (<span key={skill} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{skill}</span>))}
                        </div>
                        {data.date !== 'N/A' && <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Interview: {data.date} at {data.time}</p>}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                    {tab === 'interviews' && (
                        <motion.button onClick={() => openDateTimeModal(data)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500', cursor: 'pointer' }}>Reschedule</motion.button>
                    )}
                    {tab === 'accepted' && (
                        <motion.button onClick={() => openDateTimeModal(data)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500', cursor: 'pointer' }}>Schedule</motion.button>
                    )}
                    {(tab === 'interviews' || tab === 'accepted' || tab === 'rejected') && (
                        <motion.button onClick={() => openMessageModal(data)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500', cursor: 'pointer' }}>Send Message</motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        View CV <ChevronRightIcon />
                    </motion.button>
                </div>
            </div>
        );
    };
    const tabItems = [ { key: 'interviews', label: 'Interviews' }, { key: 'accepted', label: 'Accepted CVs' }, { key: 'rejected', label: 'Rejected CVs' }, ];
    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Interview Management</h1>
            </header>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem' }}>
                <nav style={{ position: 'relative', display: 'inline-flex', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '0.5rem' }}>
                    {tabItems.map(({ key, label }) => {
                        const isActive = key === activeSubTab;
                        return (
                            <div key={key} onClick={() => setActiveSubTab(key)} style={{ position: 'relative', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: isActive ? '#F87171' : '#d1d5db', fontWeight: isActive ? 'bold' : 'normal', zIndex: 1 }}>
                                {label}
                                {isActive && <motion.div layoutId="sub-active-pill" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', zIndex: -1 }} transition={{ duration: 0.2 }} />}
                            </div>
                        );
                    })}
                </nav>
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={activeSubTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                        {applicants[activeSubTab].map((applicant, index) => (
                            <ApplicantCard key={index} data={applicant} tab={activeSubTab} />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
            <AnimatePresence>
                {isDateTimeModalOpen && (
                    <DateTimeModal
                        isOpen={isDateTimeModalOpen}
                        onClose={() => setIsDateTimeModalOpen(false)}
                        onSchedule={handleSchedule}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isMessageModalOpen && (
                    <MessageModal
                        isOpen={isMessageModalOpen}
                        onClose={() => setIsMessageModalOpen(false)}
                        onSend={handleSendMessage}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- CV Sorting Page Component ---
const CVSortingPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Match Score');
    const [jobPositionFilter, setJobPositionFilter] = useState('All Positions');
    const [applicationStatusFilter, setApplicationStatusFilter] = useState('All Statuses');

    const applicants = [
        { name: 'Elena Martinez', email: 'elena.martinez@example.com', experience: 10, skills: ['Python', 'TensorFlow', 'Pandas'], jobTitle: 'N/A', status: 'Pending', score: 90, img: 'https://i.pravatar.cc/150?u=elena' },
        { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', experience: 8, skills: ['Figma', 'Adobe XD', 'Sketch'], jobTitle: 'Programmer', status: 'Accepted', score: 82, img: 'https://i.pravatar.cc/150?u=sarah' },
        { name: 'Varun', email: 'vaaran@gmail.com', experience: 8, skills: ['game'], jobTitle: 'N/A', status: 'Accepted', score: 59, img: 'https://i.pravatar.cc/150?u=varun' },
        { name: 'Rey Misterio', email: 'rey@gm.com', experience: 3, skills: ['JavaScript', 'TypeScript', 'React'], jobTitle: 'UI Designer', status: 'Accepted', score: 56, img: 'https://i.pravatar.cc/150?u=rey' },
    ];

    const filteredAndSortedApplicants = useMemo(() => {
        return applicants
            .filter(a => 
                (jobPositionFilter === 'All Positions' || a.jobTitle === jobPositionFilter) &&
                (applicationStatusFilter === 'All Statuses' || a.status === applicationStatusFilter) &&
                (
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
            .sort((a, b) => {
                switch (sortBy) {
                    case 'Experience': return b.experience - a.experience;
                    case 'Name': return a.name.localeCompare(b.name);
                    case 'Date': return 0; // Assuming date is not available yet
                    case 'Match Score': return b.score - a.score; // Match Score
                    default: return b.score - a.score; // Match Score
                }
            });
    }, [searchQuery, sortBy, jobPositionFilter, applicationStatusFilter]);

    const StatusBadge = ({ status }) => {
        const style = {
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'white',
        };
        if (status === 'Accepted') style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        else if (status === 'Rejected') style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        else style.backgroundColor = 'rgba(251, 191, 36, 0.2)';
        return <span style={style}>{status}</span>;
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>CV Sorting</h1>
            </header>

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="text" placeholder="Search by name, skills, or job title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><FiltersIcon /> Filters</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ScoringIcon /> Scoring</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ClearIcon /> Clear</motion.button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{color: '#d1d5db'}}>Sort by:</span>
                    {['Match Score', 'Experience', 'Name', 'Date'].map(sortKey => (
                        <button key={sortKey} onClick={() => setSortBy(sortKey)} style={{
                            backgroundColor: sortBy === sortKey ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            color: sortBy === sortKey ? '#F87171' : 'white',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }}>{sortKey}</button>
                    ))}
                </div>

                {/* Filter Applications Panel */}
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Filter Applications</h2>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><FiltersIcon /> Filters</motion.button>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        {/* Job Position Dropdown */}
                        <div>
                            <label htmlFor="job-position-filter" style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>Job Position</label>
                            <select id="job-position-filter" value={jobPositionFilter} onChange={e => setJobPositionFilter(e.target.value)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>All Positions</option>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>Programmer</option>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>UI Designer</option>
                            </select>
                        </div>

                        {/* Application Status Dropdown */}
                        <div>
                            <label htmlFor="application-status-filter" style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>Application Status</label>
                            <select id="application-status-filter" value={applicationStatusFilter} onChange={e => setApplicationStatusFilter(e.target.value)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>All Statuses</option>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>Pending</option>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>Accepted</option>
                                <option style={{ backgroundColor: '#DC2626', color: 'white' }}>Rejected</option>
                            </select>
                        </div>

                        {/* Only show pending toggle */}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                            <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Only show pending</span>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Applications</h2>
                 <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                {['Applicant', 'Experience', 'Skills', 'Job Title', 'Status', 'Score', 'Actions'].map(header => (
                                    <th key={header} style={{ padding: '0.75rem', textAlign: 'left', color: '#d1d5db' }}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredAndSortedApplicants.map((app, index) => (
                                    <motion.tr key={app.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                        <td style={{ padding: '1rem 0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={app.img} alt={app.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                            <div>
                                                <p style={{ fontWeight: 'bold' }}>{app.name}</p>
                                                <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{app.email}</p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{app.experience} years</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {app.skills.map(skill => <span key={skill} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{skill}</span>)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{app.jobTitle}</td>
                                        <td style={{ padding: '0.75rem' }}><StatusBadge status={app.status} /></td>
                                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{app.score}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer' }}><ViewIcon /></motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Chart Components ---
const BarChart = () => {
    const generateRandomData = () => {
        const data = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (29 - i));
            const month = date.toLocaleString('en-us', { month: 'short' });
            const day = date.getDate();
            data.push({ name: `${month} ${day < 10 ? '0' : ''}${day}`, value: Math.floor(Math.random() * 5) + 1 });
        }
        return data;
    };

    const data = generateRandomData();
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', borderLeft: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                {data.map(d => (
                    <motion.div key={d.name} initial={{ height: 0 }} animate={{ height: `${(d.value / maxValue) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} style={{ width: '10px', backgroundColor: '#EF4444', borderRadius: '2px' }} />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', color: '#d1d5db', marginTop: '0.5rem' }}>
                {data.map(d => <span key={d.name}>{d.name}</span>)}
            </div>
        </div>
    );
};

const DoughnutChart = () => {
    const generateRandomExperienceData = () => {
        const total = 100;
        const val1 = Math.floor(Math.random() * (total / 2));
        const val2 = Math.floor(Math.random() * (total - val1));
        const val3 = total - val1 - val2;

        const p1 = (val1 / total) * 100;
        const p2 = (val2 / total) * 100;
        const p3 = (val3 / total) * 100;

        const start2 = p1;
        const start3 = p1 + p2;

        return {
            gradient: `conic-gradient(#EF4444 0% ${p1}%, #DC2626 ${start2}% ${start3}%, #B91C1C ${start3}% 100%)`,
            avgExp: (Math.random() * 10).toFixed(1) // Random average experience
        };
    };

    const { gradient, avgExp } = generateRandomExperienceData();

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: gradient }}></div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', backgroundColor: '#020617', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{avgExp}</p>
                    <p style={{ fontSize: '0.75rem', color: '#d1d5db' }}>Avg. Exp</p>
                </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db', textAlign: 'center' }}>Showing experience distribution across all candidates</p>
        </div>
    );
};

// --- Dashboard Content Component ---
const DashboardContent = ({ onNavigate, setIsModalOpen }) => {
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.header variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Hello, Roman Reigns!</h1>
                <motion.button onClick={() => onNavigate('login')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
                    <ArrowRightOnRectangleIcon /> Logout
                </motion.button>
            </motion.header>
            
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<UsersIcon />} value={Math.floor(Math.random() * 50) + 10} label="Total applicants" tint="239, 68, 68" />
                <StatCard icon={<UsersIcon />} value={Math.floor(Math.random() * 10) + 1} label="Pending review" tint="239, 68, 68" />
                <StatCard icon={<UsersIcon />} value={Math.floor(Math.random() * 15) + 5} label="Accepted applications" tint="239, 68, 68" />
                <StatCard icon={<UsersIcon />} value={Math.floor(Math.random() * 8) + 1} label="Rejected applications" tint="239, 68, 68" />
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <motion.div variants={itemVariants} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
                         <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', flexShrink: 0 }}>Application Trends</h2>
                         <div style={{flexGrow: 1}}>
                            <BarChart />
                         </div>
                    </motion.div>
                    <motion.div variants={itemVariants} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Top Performers</h2>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                                Config <SettingsIcon />
                            </motion.button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[...Array(5)].map((_, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img src={`https://i.pravatar.cc/150?img=${index + 10}`} alt="performer" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <div>
                                            <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>{['Elena Martinez', 'Sarah Johnson', 'Iffathfatimakp', 'Rayaaan', 'Varun'][index]}</p>
                                            <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{['Data Scientist', 'UX/UI Designer', 'Studing', 'Senior developer', 'UI Designer'][index]} • {Math.floor(Math.random() * 10) + 1} yrs • {Math.floor(Math.random() * 5) + 3} skills • <span style={{ color: '#34D399' }}>Certified</span></p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>Score: {Math.floor(Math.random() * 40) + 60}</span>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>View</motion.button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.875rem' }}>
                                View all candidates
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <motion.div variants={itemVariants} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', flexShrink: 0 }}>Experience Distribution</h2>
                        <div style={{flexGrow: 1}}>
                            <DoughnutChart />
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Upcoming Interviews</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[...Array(3)].map((_, index) => {
                                const names = ['Varun', 'Sarah Johnson', 'dhanoon kp'];
                                const roles = ['UI Designer', 'Data Scientist', 'Software Engineer'];
                                const statuses = ['Awaiting Response', 'Accepted'];
                                const dates = ['April 15, 2025', 'April 15, 2025', 'April 21, 2025'];
                                const times = ['10:30 AM', '1:30 PM', '1:30 PM'];
                                const status = statuses[Math.floor(Math.random() * statuses.length)];
                                const statusColor = status === 'Accepted' ? '#34D399' : '#FBBF24';
                                const bgColor = status === 'Accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)';

                                return (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img src={`https://i.pravatar.cc/150?img=${index + 20}`} alt="interviewer" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <div>
                                                <p style={{ fontWeight: 'bold' }}>{names[index]}</p>
                                                <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{dates[index]} at {times[index]}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ backgroundColor: bgColor, color: statusColor, padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{status}</span>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>View</motion.button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.875rem' }}>
                                Manage all interviews
                            </motion.button>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Applications</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[...Array(4)].map((_, index) => {
                                const names = ['sameer s', 'iffahfathimakp', 'Raayaaan', 'Raayaaan'];
                                const roles = ['ui developer', 'Studing', 'Senior developer', 'Senior developer'];
                                const dates = ['4/11/2025', '4/10/2025', '4/3/2025', '4/3/2025'];
                                const statuses = ['pending', 'rejected', 'pending', 'pending'];
                                const status = statuses[index];
                                const statusColor = status === 'pending' ? '#FBBF24' : (status === 'rejected' ? '#EF4444' : '#34D399');
                                const bgColor = status === 'pending' ? 'rgba(251, 191, 36, 0.2)' : (status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)');

                                return (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem 1rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img src={`https://i.pravatar.cc/150?img=${index + 30}`} alt="applicant" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <div>
                                                <p style={{ fontWeight: 'bold' }}>{names[index]}</p>
                                                <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{roles[index]} • {Math.floor(Math.random() * 10) + 1} years</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{dates[index]}</p>
                                            <span style={{ backgroundColor: bgColor, color: statusColor, padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{status}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.875rem' }}>
                                View all applications
                            </motion.button>
                        </div>
                    </motion.div>
                 </div>
            </div>
        </motion.div>
    );
};


// --- Main Admin Dashboard Component ---
export default function Admindash({ onNavigate }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handlePostSuccess = () => {
        setShowSuccessToast(true);
        setTimeout(() => {
            setShowSuccessToast(false);
        }, 3000);
    };

    const contentVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardContent onNavigate={onNavigate} setIsModalOpen={setIsModalOpen} />;
            case 'jobs': return <CVSortingPage />;
            case 'messages': return <InterviewManagementPage />;
            case 'job-management': return <JobPosting />;
            case 'settings': return <SettingsPage onNavigate={onNavigate} />;
            default: return null;
        }
    };

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: '#020617', color: 'white', fontFamily: "'Montserrat', sans-serif", display: 'flex', position: 'relative', }}>
            <style>{`.settings-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; } @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } } 
        
        /* Toggle Switch Styles */
        .switch {
            position: relative;
            display: inline-block;
            width: 38px;
            height: 22px;
        }
        
        .switch input { 
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255,255,255,0.2);
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 22px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #EF4444;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #EF4444;
        }
        
        input:checked + .slider:before {
            -webkit-transform: translateX(16px);
            -ms-transform: translateX(16px);
            transform: translateX(16px);
        }`}</style>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#EF4444', top: '-50px', left: '-100px' }}></div>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#DC2626', bottom: '-80px', right: '-120px' }}></div>
            </div>
            <aside style={{ width: '100px', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EF4444', marginBottom: '2rem' }}>IRIS</div>
                <nav style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '1.5rem', 
                    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    borderRadius: '9999px', 
                    padding: '2rem 1rem' 
                }}>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? '#EF4444' : '#d1d5db', cursor: 'pointer' }}><HomeIcon /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('job-management')} style={{ background: 'none', border: 'none', color: activeTab === 'job-management' ? '#EF4444' : '#d1d5db', cursor: 'pointer' }}><BriefcasePlusIcon /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('jobs')} style={{ background: 'none', border: 'none', color: activeTab === 'jobs' ? '#EF4444' : '#d1d5db', cursor: 'pointer' }}><BriefcaseIcon /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('messages')} style={{ background: 'none', border: 'none', color: activeTab === 'messages' ? '#EF4444' : '#d1d5db', cursor: 'pointer' }}><MessageSquareIcon /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', color: activeTab === 'settings' ? '#EF4444' : '#d1d5db', cursor: 'pointer' }}><SettingsIcon /></motion.button>

                </nav>
            </aside>
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', height: '100vh', boxSizing: 'border-box', position: 'relative', zIndex: 1, }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {isModalOpen && <JobPostingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostSuccess={handlePostSuccess} />}
            </AnimatePresence>
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '2rem',
                            right: '2rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 100,
                        }}
                    >
                        <CheckCircleIcon />
                        Job Posted Successfully!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
