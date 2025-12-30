import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const VideoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;

const InterviewDetailModal = ({ interview, onClose }) => {
    if (!interview) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    zIndex: 99999, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' 
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.95, y: 20 }} 
                    style={{ 
                        backgroundColor: '#1e293b', width: '100%', maxWidth: '550px', 
                        borderRadius: '1rem', overflow: 'hidden', border: '1px solid #374151', 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'start', backgroundColor: '#0f172a' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                                {interview.job_title}
                            </h2>
                            <p style={{ color: '#FBBF24', fontSize: '0.9rem', fontWeight: '600' }}>
                                {interview.interview_type} Interview
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><CloseIcon /></button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '1.5rem', color: '#d1d5db' }}>
                        
                        {/* Interviewer & Time Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <UserIcon /> Interviewer
                                </div>
                                <div style={{ color: 'white', fontWeight: 'bold' }}>{interview.interviewer_name || "Hiring Team"}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{interview.interviewer_role}</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <ClockIcon /> Duration
                                </div>
                                <div style={{ color: 'white', fontWeight: 'bold' }}>{interview.duration_mins} Minutes</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(interview.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Instructions</h3>
                        <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '3px solid #FBBF24', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {interview.instructions || "Please join 5 minutes early and ensure your camera is working."}
                        </div>

                        {/* Meeting Link Button */}
                        {interview.mode === 'Online' && interview.meeting_link && (
                            <a 
                                href={interview.meeting_link} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    width: '100%', padding: '0.75rem', 
                                    backgroundColor: '#2563eb', color: 'white', 
                                    borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <VideoIcon /> Join Meeting via {interview.meeting_link.includes('zoom') ? 'Zoom' : 'Platform'}
                            </a>
                        )}
                        
                        {interview.mode === 'Offline' && (
                             <div style={{ padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.5rem', textAlign: 'center', color: '#e5e7eb', fontSize: '0.9rem' }}>
                                📍 In-Person Interview. Check location details in email.
                             </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default InterviewDetailModal;