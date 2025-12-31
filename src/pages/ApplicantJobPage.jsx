import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import JobListings from '../components/JobListings';
import ApplicantLayout from '../components/ApplicantLayout';

// Simple "Ghost" Card Component for loading state
const SkeletonLoader = () => (
    <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '1rem', 
        padding: '1.5rem', 
        marginBottom: '1rem', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ flex: 1 }}>
                <div style={{ width: '40%', height: '20px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '8px' }}></div>
                <div style={{ width: '25%', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
            </div>
        </div>
        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
    </div>
);

export default function ApplicantJobPage({ onNavigate }) {
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get User
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('skills, job_title') 
                        .eq('id', user.id)
                        .maybeSingle(); 
                    
                    if (profile) {
                        console.log("LOG: User Profile Found:", profile);
                        setUserProfile(profile);
                    } else {
                        console.log("LOG: No User Profile Found");
                    }
                }

                // 2. Fetch Jobs - ✅ FIXED QUERY HERE
                const { data: jobsData, error } = await supabase
                    .from('jobs')
                    // We removed 'location' from inside companies() because it caused the crash
                    .select(`
                        *,
                        companies ( name, logo_url )
                    `)
                    .eq('status', 'Active')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formattedJobs = (jobsData || []).map(job => ({
                    id: job.id,
                    title: job.title,
                    type: job.job_type,
                    company: job.companies?.name || 'Unknown Company',
                    logo: job.companies?.logo_url || '', 
                    // We now check job.location first, then fallback to 'Remote'
                    location: job.location || 'Remote',
                    salary: job.salary_range || job.salary || 'Not disclosed', 
                    deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open',
                    postedAt: new Date(job.created_at).toLocaleDateString(),
                    skills: job.skills_required || [],
                    description: job.description
                }));

                setAllJobs(formattedJobs);
                setFilteredJobs(formattedJobs);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- SMART RECOMMENDATION ENGINE ---
    const getRecommendedJobs = () => {
        if (!userProfile) return [];

        return allJobs.filter(job => {
            const userSkills = userProfile.skills || []; 
            const jobSkills = job.skills || [];          
            
            const skillMatch = jobSkills.some(skill => 
                userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
            );

            let titleMatch = false;
            if (userProfile.job_title) {
                const userTitle = userProfile.job_title.toLowerCase();
                const jobTitle = job.title.toLowerCase();
                titleMatch = jobTitle.includes(userTitle) || userTitle.includes(jobTitle);
            }

            return skillMatch || titleMatch;
        });
    };

    useEffect(() => {
        let result = activeTab === 'recommended' ? getRecommendedJobs() : allJobs;
        
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(job => 
                job.title.toLowerCase().includes(lowerQuery) ||
                job.company.toLowerCase().includes(lowerQuery)
            );
        }
        setFilteredJobs(result);
    }, [searchQuery, activeTab, allJobs, userProfile]);

    return (
        <ApplicantLayout activePage="applicant-jobs" onNavigate={onNavigate}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {activeTab === 'recommended' ? 'Jobs For You' : 'All Opportunities'}
                </h2>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setActiveTab('all')} style={{ padding: '0.5rem 1rem', borderRadius: '0.3rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'all' ? '#FBBF24' : 'transparent', color: activeTab === 'all' ? '#1a202c' : '#9ca3af' }}>All Jobs</button>
                    <button onClick={() => setActiveTab('recommended')} style={{ padding: '0.5rem 1rem', borderRadius: '0.3rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'recommended' ? '#FBBF24' : 'transparent', color: activeTab === 'recommended' ? '#1a202c' : '#9ca3af' }}>Recommended ✨</button>
                </div>
            </div>

            {loading ? (
                <div>
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                </div>
            ) : (
                <>
                    {activeTab === 'recommended' && filteredJobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', border: '1px dashed #374151', borderRadius: '1rem' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No direct matches found yet.</p>
                            <p>We look for matches based on your <strong>Job Title</strong> or <strong>Skills</strong>.</p>
                            
                            {userProfile && !userProfile.job_title && !userProfile.skills && (
                                <p style={{color: '#F87171', marginTop: '10px', fontSize: '0.9rem'}}>
                                    ⚠️ Your profile has no Job Title or Skills saved. 
                                </p>
                            )}

                            <button onClick={() => onNavigate('applicant-profile')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Update Profile</button>
                        </div>
                    ) : (
                        <JobListings searchQuery={searchQuery} setSearchQuery={setSearchQuery} isSearching={searchQuery.length > 0} filteredJobListings={filteredJobs} />
                    )}
                </>
            )}
            
        </ApplicantLayout>
    );
}