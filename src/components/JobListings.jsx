import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; 
import { SearchIcon } from './Icons'; 
import JobDetail from './JobDetail'; 


// --- Icons ---
const BuildingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><path d="M5 12h14"></path><path d="M5 7h14"></path><path d="M5 17h14"></path></svg>);
const LocationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const MoneyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);

// --- Job Card Component ---
const JobCard = ({ id, title, company, logo, location, salary, type, postedAt, deadline, onViewDetails, onApply, isApplied, isApplying }) => {
    return (
        <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column',
            gap: '1rem', height: '100%', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {logo ? <img src={logo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>🏢</span>}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: 0, lineHeight: '1.4' }}>{title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#FBBF24', fontWeight: '600', marginTop: '0.25rem' }}><BuildingIcon /> {company}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}><LocationIcon /> {location}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}><MoneyIcon /> {salary}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', borderRadius: '999px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>{type}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>Deadline: {deadline}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                    onClick={onViewDetails} 
                    style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid #4b5563', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                >
                    View Details
                </button>
                
                {/* Apply Button Logic */}
                {isApplied ? (
                    <button disabled style={{ flex: 1, padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckIcon /> Applied
                    </button>
                ) : (
                    <button 
                        onClick={() => onApply(id)} 
                        disabled={isApplying}
                        style={{ 
                            flex: 1, padding: '0.5rem', 
                            backgroundColor: isApplying ? '#4b5563' : '#FBBF24', 
                            border: 'none', 
                            color: isApplying ? '#d1d5db' : '#1a202c', 
                            borderRadius: '0.5rem', fontWeight: 'bold', 
                            cursor: isApplying ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main Layout ---
const JobListings = ({ searchQuery, setSearchQuery, isSearching, filteredJobListings }) => {
    
    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [applying, setApplying] = useState(null); 

    // ✅ CHECK EXISTING APPLICATIONS (Using correct column: user_id)
    useEffect(() => {
        const fetchApplications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('applications')
                    .select('job_id')
                    .eq('user_id', user.id); // 🟢 FIXED: Changed 'applicant_id' to 'user_id'
                
                if (data) {
                    setAppliedJobIds(new Set(data.map(app => app.job_id)));
                }
            }
        };
        fetchApplications();
    }, []);

    // ✅ HANDLE APPLY (Matches your SQL Schema)
    const handleApply = async (jobId) => {
        setApplying(jobId);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                alert("Please log in to apply.");
                return;
            }

            const { error } = await supabase
                .from('applications')
                .insert([{ 
                    job_id: jobId, 
                    user_id: user.id,   // 🟢 FIXED: Changed 'applicant_id' to 'user_id'
                    status: 'Pending'   // 🟢 FIXED: Must be 'Pending' (not 'Applied') to match constraints
                    // 🟢 NOTE: We removed 'applied_at' because your DB uses 'created_at' default now()
                }]);

            if (error) throw error;

            // Update UI instantly
            setAppliedJobIds(prev => new Set(prev).add(jobId));

        } catch (error) {
            console.error("Error applying:", error.message); // Helpful debug log
            alert(`Could not apply: ${error.message}`);
        } finally {
            setApplying(null);
        }
    };

    

    return (
        <>
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Open Positions</h2>
                <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>Browse through our current job openings</p>
                <div style={{ position: 'relative' }}>
                    <motion.div animate={{ scale: isSearching ? 1.1 : 1, rotate: isSearching ? 5 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} style={{ position: 'absolute', left: '0.75rem', top: '0', bottom: '0', display: 'grid', placeItems: 'center' }}><SearchIcon /></motion.div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by job title..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid rgba(251, 191, 36, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
            </div>
            
            <motion.main layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <AnimatePresence>
                    {filteredJobListings.length > 0 ? (
                        filteredJobListings.map((job) => (
                            <motion.div key={job.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                                <JobCard 
                                    {...job} 
                                    onViewDetails={() => setSelectedJob(job)} 
                                    onApply={handleApply}
                                    isApplied={appliedJobIds.has(job.id)}
                                    isApplying={applying === job.id}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.p initial={{opacity: 0}} animate={{opacity: 1}} style={{ color: '#d1d5db' }}>No jobs found.</motion.p>
                    )}
                </AnimatePresence>
            </motion.main>

            {/* Modal Logic */}
            {selectedJob && (
                <JobDetail 
                    job={selectedJob} 
                    onClose={() => setSelectedJob(null)} 
                    onApply={handleApply}
                    isApplied={appliedJobIds.has(selectedJob.id)}
                    isApplying={applying === selectedJob.id}
                />
            )}
        </>
    );
};

export default JobListings;