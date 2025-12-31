import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const ChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const VideoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;

export default function Calendar({ interviews = [], loading }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // Get interviews for the selected date
    const selectedInterviews = interviews.filter(interview => 
        interview.date.toDateString() === selectedDate.toDateString()
    );

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Check if a specific day has an interview
    const hasInterview = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return interviews.some(interview => interview.date.toDateString() === checkDate.toDateString());
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '2rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '1.5rem', 
            padding: '2rem',
            minHeight: '500px'
        }}>
            
            {/* Left Side: The Calendar Grid */}
            <div style={{ flex: '1', minWidth: '300px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><ChevronLeft /></button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><ChevronRight /></button>
                </div>

                {/* Days Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '1rem', textAlign: 'center' }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: '600' }}>{day}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                    {/* Empty slots for previous month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                        <div key={`empty-${index}`} />
                    ))}

                    {/* Actual Days */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isSelected = selectedDate.toDateString() === dateObj.toDateString();
                        const isToday = new Date().toDateString() === dateObj.toDateString();
                        const hasEvent = hasInterview(day);

                        return (
                            <div 
                                key={day}
                                onClick={() => setSelectedDate(dateObj)}
                                style={{
                                    height: '40px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    backgroundColor: isSelected ? '#FBBF24' : 'transparent',
                                    color: isSelected ? '#1a202c' : (isToday ? '#FBBF24' : 'white'),
                                    fontWeight: isSelected || isToday ? 'bold' : 'normal',
                                    border: isToday && !isSelected ? '1px solid #FBBF24' : 'none'
                                }}
                            >
                                {day}
                                {/* Gold Dot for Interview */}
                                {hasEvent && !isSelected && (
                                    <div style={{ 
                                        width: '4px', height: '4px', backgroundColor: '#FBBF24', borderRadius: '50%', 
                                        position: 'absolute', bottom: '6px' 
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Divider Line */}
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'block' }}></div>

            {/* Right Side: Selected Date Details */}
            <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                         <p style={{ color: '#9ca3af' }}>Loading...</p>
                    ) : selectedInterviews.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {selectedInterviews.map((interview) => (
                                <motion.div 
                                    key={interview.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        padding: '1.25rem', 
                                        borderRadius: '1rem',
                                        borderLeft: '4px solid #FBBF24'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{interview.title}</h4>
                                        <span style={{ fontSize: '0.9rem', color: '#FBBF24', fontWeight: 'bold' }}>{interview.time}</span>
                                    </div>
                                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>@ {interview.company}</p>
                                    
                                    {interview.link ? (
                                        <a 
                                            href={interview.link} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                backgroundColor: '#FBBF24', color: '#1a202c', 
                                                padding: '0.5rem 1rem', borderRadius: '0.5rem', 
                                                textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem'
                                            }}
                                        >
                                            <VideoIcon /> Join Meeting
                                        </a>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>No link provided</p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                            <p>No interviews scheduled on this date.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}