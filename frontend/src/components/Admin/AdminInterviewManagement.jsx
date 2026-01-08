import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient'; // Ensure this path matches your project
import CandidateDrawer from '../CandidateDrawer'; 

// --- Icons ---
const SmallCalendarIcon = () => ( <svg style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.7)' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> );
const ChevronRightIcon = () => ( <svg style={{ width: '16px', height: '16px', marginLeft: '4px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg> );

// --- Modals ---
// --- Custom Styled Time Picker ---
const CustomTimePicker = ({ value, onChange }) => {
    // Parse current value (e.g., "14:30") or default to current time
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('PM');

    // Update parent whenever internal state changes
    useEffect(() => {
        // Convert 12h format back to 24h string for database (e.g. "14:30")
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        
        const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
        onChange(timeString);
    }, [hour, minute, period]);

    const selectStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        outline: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        textAlign: 'center'
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Hour Dropdown */}
            <select value={hour} onChange={(e) => setHour(e.target.value)} style={selectStyle}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h} style={{background: '#333'}}>{h.toString().padStart(2, '0')}</option>
                ))}
            </select>
            <span style={{color: 'rgba(255,255,255,0.5)', fontWeight: 'bold'}}>:</span>
            
            {/* Minute Dropdown */}
            <select value={minute} onChange={(e) => setMinute(e.target.value)} style={selectStyle}>
                {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m} style={{background: '#333'}}>{m}</option>
                ))}
            </select>
            
            {/* AM/PM Toggle */}
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...selectStyle, backgroundColor: '#EF4444', border: 'none', fontWeight: 'bold' }}>
                <option value="AM" style={{background: '#333'}}>AM</option>
                <option value="PM" style={{background: '#333'}}>PM</option>
            </select>
        </div>
    );
};



const DateTimeModal = ({ isOpen, onClose, onSchedule }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('12:00'); // Default time

    const handleSchedule = () => {
        if (selectedDate && selectedTime) {
            onSchedule(selectedDate, selectedTime);
            onClose();
        } else {
            alert('Please select both date and time.');
        }
    };

    if (!isOpen) return null;

    // Dark style for the Date input
    const darkInputStyle = {
        padding: '0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: 'white',
        colorScheme: 'dark',
        width: '100%' // Full width for date
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Select Date & Time</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* 1. Date Picker (Native is okay with Dark Mode) */}
                    <div>
                        <label style={{display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Date</label>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)} 
                            style={darkInputStyle} 
                        />
                    </div>

                    {/* 2. Custom Time Picker (New Design) */}
                    <div>
                        <label style={{display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Time</label>
                        <CustomTimePicker 
                            value={selectedTime} 
                            onChange={(newTime) => setSelectedTime(newTime)} 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={onClose} style={{ backgroundColor: 'transparent', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSchedule} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Confirm</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const MessageModal = ({ isOpen, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    const handleSend = () => {
        if (message.trim()) { onSend(message); onClose(); } else { alert('Message cannot be empty.'); }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Compose Message</h2>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." rows="6" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={onClose} style={{ backgroundColor: 'transparent', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSend} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Send</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main Component ---
export default function AdminInterviewManagement() {
    const [activeSubTab, setActiveSubTab] = useState('interviews');
    const [loading, setLoading] = useState(true);
    
    // State to hold sorted applicants
    const [applicants, setApplicants] = useState({
        interviews: [],
        accepted: [],
        rejected: []
    });

    const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerCandidate, setDrawerCandidate] = useState(null);

    // --- 1. Fetch Data Logic ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Join applications with profiles, jobs, and CHECK interviews table
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    id, created_at, status, experience, skills, match_score,
                    profiles ( id, full_name, email, avatar_url ),
                    jobs ( title ),
                    interviews ( id, date, time, status )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const categorized = { interviews: [], accepted: [], rejected: [] };

            data.forEach(app => {
                // Check if an interview row exists for this application
                const interviewData = app.interviews && app.interviews.length > 0 ? app.interviews[0] : null;

                // Format the object for UI (Handle '0' values correctly)
                const formattedApp = {
                    ...app,
                    name: app.profiles?.full_name || 'Unknown User',
                    role: app.jobs?.title || 'Unknown Role',
                    avatar: app.profiles?.avatar_url,
                    // FIX: Handle 0 experience
                    experience: (app.experience === '0' || app.experience === 0) 
                        ? 'Fresher' 
                        : (app.experience ? `${app.experience} years` : 'N/A'),
                    skills: Array.isArray(app.skills) ? app.skills : (app.skills ? [app.skills] : []),
                    // Use interview details if available
                    interviewId: interviewData?.id,
                    date: interviewData ? interviewData.date : 'Not Scheduled',
                    time: interviewData ? interviewData.time : '',
                };

                // --- SORTING LOGIC ---
                if (interviewData) {
                    // HAS interview -> Interviews Tab
                    categorized.interviews.push(formattedApp);
                } else if (app.status === 'Accepted' || app.status === 'Approved') {
                    // Approved but NO interview -> Accepted Tab
                    categorized.accepted.push(formattedApp);
                } else if (app.status === 'Rejected') {
                    // Rejected -> Rejected Tab
                    categorized.rejected.push(formattedApp);
                }
            });

            setApplicants(categorized);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Action Handlers ---

    const openDrawer = (applicant) => {
        setDrawerCandidate(applicant);
        setIsDrawerOpen(true);
    };

    const handleSchedule = async (date, time) => { 
        if (!selectedApplicant) return;

        try {
            // Check if already scheduled to update instead of insert (optional optimization)
            if (selectedApplicant.interviewId) {
                 await supabase
                    .from('interviews')
                    .update({ date, time, status: 'Scheduled' })
                    .eq('id', selectedApplicant.interviewId);
            } else {
                // Insert new interview
                const { error } = await supabase
                    .from('interviews')
                    .insert([
                        { 
                            application_id: selectedApplicant.id, 
                            date: date, 
                            time: time,
                            status: 'Scheduled'
                        }
                    ]);
                if (error) throw error;
            }

            alert(`Interview scheduled for ${selectedApplicant.name} on ${date} at ${time}`);
            setIsDateTimeModalOpen(false);
            
            // Refresh to move candidate to "Interviews" tab
            fetchData(); 

        } catch (error) {
            console.error("Error scheduling:", error.message);
            alert("Failed to save schedule.");
        }
    };
    
    const handleSendMessage = (message) => { 
        // Placeholder for email/message logic
        alert(`Message sent to ${selectedApplicant?.name}: "${message}"`); 
    };

    const openDateTimeModal = (applicant) => { setSelectedApplicant(applicant); setIsDateTimeModalOpen(true); };
    const openMessageModal = (applicant) => { setSelectedApplicant(applicant); setIsMessageModalOpen(true); };

    // --- Styles ---
    const primaryButtonStyle = { backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' };
    const secondaryButtonStyle = { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Interview Management</h1></header>
            
            {/* Tabs Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem' }}>
                <nav style={{ position: 'relative', display: 'inline-flex', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '0.5rem' }}>
                    {['interviews', 'accepted', 'rejected'].map(key => (
                        <div key={key} onClick={() => setActiveSubTab(key)} style={{ position: 'relative', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: key === activeSubTab ? '#F87171' : '#d1d5db', fontWeight: key === activeSubTab ? 'bold' : 'normal', zIndex: 1 }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)} ({applicants[key]?.length || 0})
                            {key === activeSubTab && <motion.div layoutId="sub-active-pill" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', zIndex: -1 }} transition={{ duration: 0.2 }} />}
                        </div>
                    ))}
                </nav>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeSubTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    
                    {loading ? (
                        <div style={{textAlign: 'center', color: '#888', padding: '2rem'}}>Loading candidates...</div>
                    ) : applicants[activeSubTab].length === 0 ? (
                        <div style={{textAlign: 'center', color: '#666', padding: '2rem'}}>No candidates found in this category.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            {applicants[activeSubTab].map((applicant, index) => (
                                <div key={applicant.id || index} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    
                                    {/* Left Side: Info */}
                                    <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                                        {/* Dynamic Avatar with Initials Fallback */}
                                        <img 
                                            src={applicant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name)}&background=random`} 
                                            alt={applicant.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{applicant.name}</h3>
                                                
                                            </div>
                                            <p style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{applicant.role} • {applicant.experience}</p>
                                            
                                            {/* Skills Badges */}
                                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                                {applicant.skills.map((skill, i) => (
                                                    <span key={i} style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>{skill}</span>
                                                ))}
                                            </div>

                                            {/* Show Interview Date (Only in Interviews Tab) */}
                                            {activeSubTab === 'interviews' && applicant.time && (
                                                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <SmallCalendarIcon />
                                                    <span>Interview: <span style={{ color: 'white' }}>{applicant.date} at {applicant.time}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Action Buttons */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '170px' }}>
                                        
                                        {/* === INTERVIEW TAB (Has Schedule) === */}
                                        {activeSubTab === 'interviews' && (
                                            <>
                                                <motion.button onClick={() => openDateTimeModal(applicant)} whileHover={{ scale: 1.02 }} style={secondaryButtonStyle}>
                                                    Reschedule
                                                </motion.button>
                                                <motion.button onClick={() => openMessageModal(applicant)} whileHover={{ scale: 1.02 }} style={secondaryButtonStyle}>
                                                    Message
                                                </motion.button>
                                                <motion.button onClick={() => openDrawer(applicant)} whileHover={{ scale: 1.02 }} style={primaryButtonStyle}>
                                                    View CV <ChevronRightIcon />
                                                </motion.button>
                                            </>
                                        )}

                                        {/* === ACCEPTED TAB (Needs Schedule) === */}
                                        {activeSubTab === 'accepted' && (
                                            <>
                                                <motion.button onClick={() => openDateTimeModal(applicant)} whileHover={{ scale: 1.02 }} style={secondaryButtonStyle}>
                                                    Schedule Interview
                                                </motion.button>
                                                <motion.button onClick={() => openMessageModal(applicant)} whileHover={{ scale: 1.02 }} style={secondaryButtonStyle}>
                                                    Send Message
                                                </motion.button>
                                                <motion.button onClick={() => openDrawer(applicant)} whileHover={{ scale: 1.02 }} style={primaryButtonStyle}>
                                                    View CV <ChevronRightIcon />
                                                </motion.button>
                                            </>
                                        )}

                                        {/* === REJECTED TAB === */}
                                        {activeSubTab === 'rejected' && (
                                            <>
                                                <motion.button onClick={() => openMessageModal(applicant)} whileHover={{ scale: 1.02 }} style={secondaryButtonStyle}>
                                                    Send Message
                                                </motion.button>
                                                <motion.button onClick={() => openDrawer(applicant)} whileHover={{ scale: 1.02 }} style={primaryButtonStyle}>
                                                    View CV <ChevronRightIcon />
                                                </motion.button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>{isDateTimeModalOpen && <DateTimeModal isOpen={isDateTimeModalOpen} onClose={() => setIsDateTimeModalOpen(false)} onSchedule={handleSchedule} />}</AnimatePresence>
            <AnimatePresence>{isMessageModalOpen && <MessageModal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} onSend={handleSendMessage} />}</AnimatePresence>
            <AnimatePresence>{isDrawerOpen && <CandidateDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} candidate={drawerCandidate} />}</AnimatePresence>
        </div>
    );
}