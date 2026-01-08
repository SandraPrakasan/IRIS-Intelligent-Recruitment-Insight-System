import React, { useEffect, useState } from 'react';
// ✅ Correct path to go back to src
import { supabase } from '../../supabaseClient';

export default function UpcomingInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('interviews')
                    .select(`
                        id, scheduled_at, status,
                        applications ( profiles ( full_name ) )
                    `)
                    .order('scheduled_at', { ascending: true })
                    .limit(3);

                if (error) throw error;
                setInterviews(data || []);
            } catch (error) {
                console.error('Error fetching interviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
    };

    return (
        // 🔴 THEME MATCH: Dark Red Background & Border
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Upcoming Interviews</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                {loading ? <p style={{color: '#9CA3AF'}}>Loading...</p> : interviews.length === 0 ? <p style={{color: '#9CA3AF'}}>No upcoming interviews.</p> : interviews.map((item) => {
                    const { date, time } = formatDate(item.scheduled_at);
                    const name = item.applications?.profiles?.full_name || 'Candidate';
                    
                    return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {/* 🔴 THEME MATCH: Red Icon Box */}
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', 
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{date} • {time}</div>
                                </div>
                            </div>
                            
                            <button style={{ 
                                padding: '0.4rem 1rem', borderRadius: '2rem', 
                                border: '1px solid #EF4444', background: 'transparent', 
                                color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' 
                            }}>
                                View
                            </button>
                        </div>
                    );
                })}
            </div>

             <button style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#EF4444', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                View All Interviews →
            </button>
        </div>
    );
}