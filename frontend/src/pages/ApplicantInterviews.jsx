import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import ApplicantLayout from '../components/ApplicantLayout';

// --- ICONS ---
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MapPinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const VideoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const BriefcaseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

// --- INTERNAL CALENDAR COMPONENT ---
function InternalCalendar({ interviews }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const selectedInterviews = interviews.filter(i => new Date(i.scheduled_time).toDateString() === selectedDate.toDateString());
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const hasInterview = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return interviews.some(i => new Date(i.scheduled_time).toDateString() === checkDate.toDateString());
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', backgroundColor: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1.5rem', padding: '2rem', minHeight: '500px' }}
        >
            <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><ChevronLeft /></button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><ChevronRight /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold' }}>{d}</div>)}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isSel = selectedDate.toDateString() === dateObj.toDateString();
                        const isToday = new Date().toDateString() === dateObj.toDateString();
                        const hasEvt = hasInterview(day);
                        return (
                            <div key={day} onClick={() => setSelectedDate(dateObj)}
                                style={{
                                    height: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', position: 'relative',
                                    backgroundColor: isSel ? '#FBBF24' : 'transparent', color: isSel ? '#1a202c' : (isToday ? '#FBBF24' : 'white'), fontWeight: isSel || isToday ? 'bold' : 'normal', border: isToday && !isSel ? '1px solid #FBBF24' : 'none'
                                }}>
                                {day}
                                {hasEvt && !isSel && <div style={{ width: '4px', height: '4px', backgroundColor: '#FBBF24', borderRadius: '50%', position: 'absolute', bottom: '6px' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ flex: '1', minWidth: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                {selectedInterviews.length > 0 ? selectedInterviews.map(i => (
                    <div key={i.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', borderLeft: '4px solid #FBBF24', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'white' }}>{i.applications.jobs.title}</div>
                        <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{new Date(i.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {i.mode}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>@ {i.applications.jobs.companies.name}</div>
                        {i.meeting_link && <a href={i.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#FBBF24', textDecoration: 'underline' }}>Join Meeting</a>}
                    </div>
                )) : <p style={{ color: '#6b7280' }}>No interviews on this date.</p>}
            </div>
        </motion.div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function ApplicantInterview({ onNavigate }) {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false); // Default is FALSE (List View)

    useEffect(() => {
        const fetchInterviews = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('interviews')
                        .select(`
                            id, scheduled_time, status, interview_type, mode, meeting_link,
                            applications!inner ( applicant_id, jobs ( title, companies ( name ) ) )
                        `)
                        .eq('applications.applicant_id', user.id)
                        .order('scheduled_time', { ascending: true });
                    if (error) throw error;
                    setInterviews(data || []);
                }
            } catch (error) { console.error('Error fetching interviews:', error); } 
            finally { setLoading(false); }
        };
        fetchInterviews();
    }, []);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Scheduled': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: '#3B82F6' };
            case 'Completed': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: '#10B981' };
            case 'Rescheduled': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: '#F59E0B' };
            case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: '#EF4444' };
            default: return { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: '#6B7280' };
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            datePart: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            timePart: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
        };
    };

    return (
        <ApplicantLayout activePage="applicant-interviews" onNavigate={onNavigate}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header with Toggle Button */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                            {showCalendar ? 'Interview Calendar' : 'Upcoming Interviews'}
                        </h2>
                        <p style={{ color: '#9ca3af' }}>
                            {showCalendar ? 'View your schedule by month.' : 'Track your upcoming sessions and status.'}
                        </p>
                    </div>

                    {/* VIEW TOGGLE BUTTON */}
                    <button 
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            backgroundColor: '#374151', color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    >
                        {showCalendar ? <><ListIcon /> List View</> : <><CalendarIcon /> Calendar View</>}
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Loading...</div>
                ) : (
                    <AnimatePresence mode="wait">
                        {showCalendar ? (
                            <InternalCalendar key="calendar" interviews={interviews} />
                        ) : (
                            /* --- LIST VIEW --- */
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'grid', gap: '1rem' }}
                            >
                                {interviews.length > 0 ? interviews.map((interview) => {
                                    const styles = getStatusStyles(interview.status);
                                    const { datePart, timePart } = formatDateTime(interview.scheduled_time);
                                    return (
                                        <div key={interview.id}
                                            style={{
                                                backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexWrap: 'wrap',
                                                alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            {/* Job Info */}
                                            <div style={{ flex: '1 1 300px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                                        {interview.applications?.jobs?.title || 'Unknown Role'}
                                                    </h3>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: styles.bg, color: styles.text, border: `1px solid ${styles.border}` }}>
                                                        {interview.status}
                                                    </span>
                                                </div>
                                                <div style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                                    <BriefcaseIcon /> {interview.applications?.jobs?.companies?.name || 'Unknown Company'}
                                                    <span style={{ color: '#4b5563' }}>•</span>
                                                    <span style={{ color: '#FBBF24' }}>{interview.interview_type} Interview</span>
                                                </div>
                                            </div>

                                            {/* Date Info */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '180px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: '500' }}>
                                                    <ClockIcon /> {datePart}
                                                </div>
                                                <div style={{ paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>{timePart}</div>
                                            </div>

                                            {/* Action */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                                    {interview.mode === 'Online' ? <VideoIcon /> : <MapPinIcon />} {interview.mode}
                                                </div>
                                                {interview.mode === 'Online' && interview.meeting_link && (
                                                    <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                                                        style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                                        Join
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#9ca3af' }}>
                                        <p>No upcoming interviews found.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </ApplicantLayout>
    );
}