import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function RecentApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                // ✅ FIX: Using the EXACT constraint name from your error log
                
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        id, created_at, status, experience,
                        jobs:jobs!applications_job_id_fkey ( title ),
                        profiles:profiles!fk_applications_profiles ( full_name, avatar_url )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (error) throw error;

                console.log('Fetched Data:', data);
                setApplications(data || []);

            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchApps();
    }, []);

    // Helper for Status Badges
    const getStatusBadge = (status) => {
        const s = status ? status.toLowerCase() : '';
        let bg = 'rgba(255,255,255,0.1)'; let text = '#D1D5DB';
        
        if (s === 'accepted' || s === 'hired') { bg = 'rgba(16, 185, 129, 0.2)'; text = '#34D399'; }
        else if (s === 'rejected') { bg = 'rgba(239, 68, 68, 0.2)'; text = '#F87171'; }
        else if (s === 'pending') { bg = 'rgba(245, 158, 11, 0.2)'; text = '#FBBF24'; }

        return (
            <span style={{ backgroundColor: bg, color: text, padding: '4px 10px', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' }}>
                {status || 'Pending'}
            </span>
        );
    };

    return (
        <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.05)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '1rem', 
            padding: '1.5rem', 
            color: 'white',
            height: '100%',
            display: 'flex', 
            flexDirection: 'column'
        }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Recent Applications</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                {loading ? (
                    <p style={{color: '#9CA3AF'}}>Loading...</p>
                ) : applications.length === 0 ? (
                    <p style={{color: '#9CA3AF'}}>No applications yet.</p>
                ) : (
                    applications.map((app) => {
                        // Safe access
                        const profile = app.profiles || {};
                        const job = app.jobs || {};
                        
                        const name = profile.full_name || 'Unknown User';
                        const jobTitle = job.title || 'Unknown Role';
                        const exp = app.experience ? `• ${app.experience} years` : '';
                        const initial = name.charAt(0).toUpperCase();
                        
                        return (
                            <div key={app.id} style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', borderRadius: '0.75rem',
                                backgroundColor: 'rgba(255,255,255,0.03)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                                            {initial}
                                        </div>
                                    )}
                                    
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#F3F4F6' }}>{name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
                                            {jobTitle} <span style={{ opacity: 0.6 }}>{exp}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </span>
                                    {getStatusBadge(app.status)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <button style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#EF4444', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                View all applications →
            </button>
        </div>
    );
}