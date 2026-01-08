import React from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient'; 

// --- Icons ---
const HomeIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );
const BriefcaseIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> );
const MessageSquareIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
// ✅ UPDATED: Complete, robust Settings Icon (Gear)
const SettingsIcon = () => ( 
    <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg> 
);
const BriefcasePlusIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>);
const LogoutIcon = () => ( <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> );

export default function AdminLayout({ children, activeTab, setActiveTab, onNavigate }) {
    
    // Global Logout Handler
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error.message);
        if (onNavigate) onNavigate('login');
    };

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: '#020617', color: 'white', fontFamily: "'Montserrat', sans-serif", display: 'flex', position: 'relative', overflow: 'hidden' }}>
            
            {/* Background Effects */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#EF4444', top: '-50px', left: '-100px' }}></div>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#DC2626', bottom: '-80px', right: '-120px' }}></div>
            </div>

            {/* Sidebar */}
            <aside style={{ width: '100px', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EF4444', marginBottom: '2rem' }}>IRIS</div>
                <nav style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', 
                    backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                    borderRadius: '9999px', padding: '2rem 1rem' 
                }}>
                    <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<HomeIcon />} />
                    <NavButton active={activeTab === 'job-management'} onClick={() => setActiveTab('job-management')} icon={<BriefcasePlusIcon />} />
                    <NavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={<BriefcaseIcon />} />
                    <NavButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<MessageSquareIcon />} />
                    <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} />
                </nav>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', height: '100vh', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
                
                {/* ✅ GLOBAL LOGOUT BUTTON - Updated Styles for Alignment */}
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 50 }}>
                    <motion.button 
                        onClick={handleLogout} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        style={{ 
                            backgroundColor: '#EF4444', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            padding: '0.75rem 1.5rem', 
                            borderRadius: '0.5rem', 
                            fontWeight: 'bold', 
                            cursor: 'pointer', 
                            border: 'none', 
                            // Matches the visual weight of "Post New Job"
                            minWidth: '160px' 
                        }}
                    >
                        <LogoutIcon /> Logout
                    </motion.button>
                </div>

                {children}
            </div>
        </div>
    );
}

// Helper Component for Navigation Buttons
const NavButton = ({ active, onClick, icon }) => (
    <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={onClick} 
        style={{ background: 'none', border: 'none', color: active ? '#EF4444' : '#d1d5db', cursor: 'pointer' }}
    >
        {icon}
    </motion.button>
);