import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const BuildingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><path d="M5 12h14"></path><path d="M5 7h14"></path><path d="M5 17h14"></path></svg>);
const LocationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const MoneyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);

const JobDetail = ({ job, onClose, onApply, isApplied, isApplying }) => {
    // Portal renders this outside the main app flow
    return ReactDOM.createPortal(
        <AnimatePresence>
            {job && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 9999,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        style={{
                            backgroundColor: '#1e293b', width: '100%', maxWidth: '650px', maxHeight: '90vh',
                            borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            border: '1px solid #374151',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'start', backgroundColor: '#0f172a' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', margin: 0 }}>{job.title}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24', fontWeight: '600', marginTop: '0.5rem' }}>
                                    <BuildingIcon /> {job.company}
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><CloseIcon /></button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '2rem', overflowY: 'auto', color: '#d1d5db', lineHeight: '1.6' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}><LocationIcon /> {job.location}</span>
                                <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}><MoneyIcon /> {job.salary}</span>
                                <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold' }}>{job.type}</span>
                            </div>

                            <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>About the Role</h3>
                            <p style={{ marginBottom: '2rem', whiteSpace: 'pre-line' }}>{job.description || "No description provided."}</p>

                            {/* Safe Skills Rendering */}
                            {job.skills && job.skills.length > 0 && (
                                <>
                                    <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Skills Required</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                        {job.skills.map((skill, index) => (
                                            <span key={index} style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', borderRadius: '999px' }}>{skill}</span>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                Posted: {job.postedAt} • Deadline: <span style={{ color: '#ef4444' }}>{job.deadline}</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #374151', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', cursor: 'pointer' }}>Close</button>
                            
                            {/* Logic for Apply Button */}
                            {isApplied ? (
                                <button disabled style={{ padding: '0.75rem 2rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid #10B981', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'default', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckIcon /> Applied
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onApply && onApply(job.id)}
                                    disabled={isApplying}
                                    style={{ 
                                        padding: '0.75rem 2rem', 
                                        backgroundColor: isApplying ? '#4b5563' : '#FBBF24', 
                                        color: isApplying ? '#d1d5db' : '#1a202c', 
                                        border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: isApplying ? 'not-allowed' : 'pointer' 
                                    }}
                                >
                                    {isApplying ? 'Applying...' : 'Apply Now'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default JobDetail;