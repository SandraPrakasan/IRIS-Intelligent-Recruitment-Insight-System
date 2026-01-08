import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;

export default function ApplyModel({ job, onClose, onSubmit, isSubmitting }) {
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeLink, setResumeLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass data back to parent
        onSubmit({ 
            cover_letter: coverLetter, 
            resume_url: resumeLink 
        });
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    backdropFilter: 'blur(5px)', padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    style={{ 
                        backgroundColor: '#1f2937', width: '100%', maxWidth: '500px', 
                        borderRadius: '1rem', border: '1px solid #374151', 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Apply for {job.title}</h3>
                            <p style={{ color: '#FBBF24', fontSize: '0.9rem', margin: 0 }}>at {job.company}</p>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><CloseIcon /></button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                        
                        {/* Resume Link Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                Portfolio / Resume Link <span style={{color: '#9ca3af', fontWeight: 'normal'}}>(Optional)</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}><UploadIcon /></div>
                                <input 
                                    type="url" 
                                    // ❌ REMOVED "required" attribute here
                                    placeholder="https://drive.google.com/..." 
                                    value={resumeLink}
                                    onChange={(e) => setResumeLink(e.target.value)}
                                    style={{ 
                                        width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', 
                                        backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #374151', 
                                        borderRadius: '0.5rem', color: 'white', boxSizing: 'border-box'
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Cover Letter Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                Cover Letter <span style={{color: '#9ca3af', fontWeight: 'normal'}}>(Optional)</span>
                            </label>
                            <textarea 
                                rows="4"
                                placeholder="Tell us why you're a great fit..." 
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                style={{ 
                                    width: '100%', padding: '1rem', 
                                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #374151', 
                                    borderRadius: '0.5rem', color: 'white', resize: 'vertical', boxSizing: 'border-box'
                                }} 
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: '1px solid #4b5563', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                style={{ 
                                    padding: '0.75rem 2rem', backgroundColor: '#FBBF24', color: '#1a202c', 
                                    border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}