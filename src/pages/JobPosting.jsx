import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

// --- Icons ---
const PlusIcon = () => <svg style={{width:'20px', height:'20px', marginRight:'8px'}} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg style={{width:'16px', height:'16px'}} viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const TrashIcon = () => <svg style={{width:'16px', height:'16px', color:'#EF4444'}} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></motion.svg>;

export default function JobPosting() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // --- UPDATED FORM STATE ---
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        job_type: 'Full-time',
        experience_level: '',
        salary_range: '', // 🆕 Added Salary Range
        skills_required: '',
        deadline: '',
        description: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if(!user) return;

            const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
            
            if (profile?.company_id) {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('company_id', profile.company_id)
                    .order('created_at', { ascending: false });
                
                if (data) setJobs(data);
                if (error) console.error("Error fetching jobs:", error.message);
            }
        } catch (error) {
            console.error("System error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            const skillsArray = formData.skills_required.split(',').map(s => s.trim()).filter(s => s);

            const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
            if (!profile?.company_id) throw new Error("You are not linked to a company.");

            const payload = {
                title: formData.title,
                department: formData.department,
                location: formData.location,
                job_type: formData.job_type,
                experience_level: formData.experience_level,
                salary_range: formData.salary_range, // 🆕 Send Salary to DB
                skills_required: skillsArray,
                deadline: formData.deadline || null,
                description: formData.description,
                company_id: profile.company_id,
                status: 'Active'
            };

            let error;
            if (editingJob) {
                const { error: updateError } = await supabase.from('jobs').update(payload).eq('id', editingJob.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('jobs').insert(payload);
                error = insertError;
            }

            if (error) throw error;

            alert(editingJob ? "Job updated successfully!" : "Job posted successfully!");
            fetchJobs();
            closeModal();

        } catch (error) {
            alert("Error saving job: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the job posting.")) return;
        try {
            const { error } = await supabase.from('jobs').delete().eq('id', id);
            if (error) throw error;
            setJobs(jobs.filter(job => job.id !== id));
        } catch (error) {
            alert("Error deleting job: " + error.message);
        }
    };

    const openModal = (job = null) => {
        if (job) {
            setEditingJob(job);
            setFormData({
                title: job.title,
                department: job.department || '',
                location: job.location || '',
                job_type: job.job_type || 'Full-time',
                experience_level: job.experience_level || '',
                salary_range: job.salary_range || '', // 🆕 Load existing salary
                skills_required: job.skills_required ? job.skills_required.join(', ') : '',
                deadline: job.deadline || '',
                description: job.description || ''
            });
        } else {
            setEditingJob(null);
            setFormData({
                title: '', department: '', location: '', 
                job_type: 'Full-time', experience_level: '', salary_range: '', // 🆕 Reset salary
                skills_required: '', deadline: '', description: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '1rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' };

    return (
        <div>
            <style>{`
                select option { background-color: #111827; color: white; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}</style>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Job Postings</h1>
                <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()}
                    style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    <PlusIcon /> Post New Job
                </motion.button>
            </header>

            {loading ? <div style={{color: '#d1d5db'}}>Loading jobs...</div> : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {jobs.length === 0 && <p style={{color: '#666', textAlign: 'center', marginTop: '2rem'}}>No jobs posted yet.</p>}
                    
                    {jobs.map(job => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={job.id} 
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{job.title}</h3>
                                    <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', backgroundColor: job.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: job.status === 'Active' ? '#34D399' : '#EF4444' }}>{job.status || 'Active'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', color: '#d1d5db', fontSize: '0.9rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <span>{job.department}</span><span>•</span><span>{job.job_type}</span><span>•</span><span>{job.location}</span>
                                    
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(job)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><EditIcon /></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(job.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#EF4444', cursor: 'pointer', padding: '0.5rem' }}><TrashIcon /></motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: '#111827', width: '100%', maxWidth: '700px', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={labelStyle}>Job Title</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} placeholder="e.g. Senior React Dev" /></div>
                                    <div><label style={labelStyle}>Department</label><input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={inputStyle} placeholder="e.g. Engineering" /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Job Type</label>
                                        <select value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})} style={inputStyle}>
                                            <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div><label style={labelStyle}>Location</label><input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} placeholder="e.g. Remote" /></div>
                                </div>

                                {/* 🆕 SALARY & EXPERIENCE ROW */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={labelStyle}>Exp (Years)</label><input type="text" value={formData.experience_level} onChange={e => setFormData({...formData, experience_level: e.target.value})} style={inputStyle} placeholder="e.g. 3-5 years" /></div>
                                    <div>
                                        <label style={labelStyle}>Salary Range</label>
                                        <input type="text" value={formData.salary_range} onChange={e => setFormData({...formData, salary_range: e.target.value})} style={inputStyle} placeholder="e.g. $80k - $120k or 10-15 LPA" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Deadline</label><input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Required Skills <span style={{color: '#6B7280'}}>(Comma separated)</span></label><input type="text" value={formData.skills_required} onChange={e => setFormData({...formData, skills_required: e.target.value})} style={inputStyle} placeholder="React, Node.js, SQL" /></div>
                                <div><label style={labelStyle}>Job Description</label><textarea rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="Enter detailed job description here..." /></div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={closeModal} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid #374151', color: 'white', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={isSaving} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#EF4444', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                        {isSaving && <SpinnerIcon />} {isSaving ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}