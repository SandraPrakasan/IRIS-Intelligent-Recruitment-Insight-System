import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
    LogoutIcon, BriefcaseIcon, UserCircleIcon, ChatIcon,
    CalendarIcon, AtsCheckerIcon
} from './Icons'; 

export default function ApplicantLayout({ children, activePage, onNavigate }) {

    // ✅ FIX: Initialize state directly from LocalStorage. 
    // This removes the "flicker" because it grabs the name instantly before the page paints.
    const [userName, setUserName] = useState(() => localStorage.getItem('applicant_name') || '');

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .maybeSingle();
                    
                    if (profile && profile.full_name) {
                        const firstName = profile.full_name.split(' ')[0];
                        
                        // Update state
                        setUserName(firstName);
                        
                        // ✅ Save to LocalStorage for next time (Instant load on refresh)
                        localStorage.setItem('applicant_name', firstName);
                    }
                }
            } catch (error) {
                console.error("Error fetching name:", error);
            }
        };
        fetchUserName();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('applicant_name'); // ✅ Clear cache so next user doesn't see your name
        onNavigate('login');
    };

    // Helper to check if a tab is active
    const isActive = (key) => activePage === key;

    const navItems = [
        { key: 'applicant-jobs', icon: <BriefcaseIcon />, label: 'Job Listings' },
        { key: 'applicant-profile', icon: <UserCircleIcon />, label: 'Profile' },
        { key: 'applicant-interviews', icon: <CalendarIcon />, label: 'Interviews' },
        { key: 'applicant-ats', icon: <AtsCheckerIcon />, label: 'ATS Checker' },
        { key: 'applicant-messages', icon: <ChatIcon />, label: 'Messages' },
    ];

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: '#020617', color: 'white', fontFamily: "'Montserrat', sans-serif", padding: '2rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <style>{` main::-webkit-scrollbar { width: 8px; } main::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } main::-webkit-scrollbar-thumb { background: #FBBF24; border-radius: 10px; } main::-webkit-scrollbar-thumb:hover { background: #FCD34D; } `}</style>
            
            {/* Background Blobs */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#FBBF24', top: '-50px', left: '-100px' }}></div>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#F59E0B', bottom: '-80px', right: '-120px' }}></div>
            </div>
            
            {/* Header */}
            <header style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexShrink: 0 }}>
                {/* Name appears instantly now if cached */}
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                    {userName ? `Hi, ${userName} 👋` : 'Welcome 👋'}
                </h1>

                <motion.button 
                    onClick={handleLogout} 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.98 }} 
                    style={{ backgroundColor: '#FBBF24', color: '#1a202c', display: 'flex', alignItems: 'center', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                >
                    <LogoutIcon />
                    Logout
                </motion.button>
            </header>

            {/* Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0, marginBottom: '2rem' }}>
                <nav style={{ position: 'relative', zIndex: 1, display: 'inline-flex', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '0.5rem', overflowX: 'auto' }}>
                    {navItems.map(({ key, icon, label }) => {
                        const active = isActive(key);
                        return (
                            <div 
                                key={key} 
                                onClick={() => onNavigate(key)} 
                                style={{ position: 'relative', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: active ? '#FCD34D' : '#d1d5db', fontWeight: active ? 'bold' : 'normal', zIndex: 1 }}
                            >
                                {icon}
                                <span style={{ marginLeft: '0.5rem', textTransform: 'capitalize' }}>{label}</span>
                                {active && (
                                    <motion.div layoutId="active-pill" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(251, 191, 36, 0.2)', borderRadius: '0.5rem', zIndex: -1 }} transition={{ duration: 0.2 }} />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <main style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activePage} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};