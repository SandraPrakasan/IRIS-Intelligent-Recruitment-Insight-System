import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
    LogoutIcon, BriefcaseIcon, UserCircleIcon, ChatIcon,
    CalendarIcon, SearchIcon, AtsCheckerIcon
} from '../components/Icons';
import JobListings from '../components/JobListings';
import Calendar from '../components/Calendar';
import ProfilePage from '../components/ProfilePage';
import PlaceholderContent from '../components/PlaceholderContent';

export default function ClientDash({ onNavigate }) {

    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({});
    const [originalFormData, setOriginalFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resumeFile, setResumeFile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
    const [showFullProfile, setShowFullProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // 1. Fetch Profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    const combinedData = { ...profile, email: user.email };
                    setFormData(combinedData);
                    setOriginalFormData(combinedData);
                    if (profile.avatar_url) {
                       setAvatarUrl(profile.avatar_url);
                    }
                }

                // 2. Fetch Jobs (THIS WAS MISSING)
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs') // Make sure your table is named 'jobs'
                    .select('*');
                
                if (jobsData) {
                    setJobs(jobsData);
                } else if (jobsError) {
                    console.error("Error fetching jobs:", jobsError);
                }
            }
            setLoading(false);
        };
        fetchInitialData();
    }, []);

    // ✅ THIS IS THE UPDATED FUNCTION
    const handleEditClick = () => {
        // This function now ensures there's at least one experience form when editing
        setFormData(currentData => {
            const hasExperience = currentData.work_experience && currentData.work_experience.length > 0;
            
            // If no experience exists, add one empty row
            if (!hasExperience) {
                return {
                    ...currentData,
                    work_experience: [{ id: Date.now(), company: '', role: '', years: '' }]
                };
            }
            
            // Otherwise, just return the data as is
            return currentData;
        });

        setShowFullProfile(true);
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        if (originalFormData) setFormData(originalFormData);
        setAvatarFile(null);
        setResumeFile(null);
        setPhotoPreviewUrl(null);
        setIsEditing(false);
    };

    const handleProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };
    
    const handleAddExperience = () => {
        const newExperience = { id: Date.now(), company: '', role: '', years: '' };
        setFormData(prev => ({
            ...prev,
            work_experience: [...(prev.work_experience || []), newExperience]
        }));
    };
    
    const handleExperienceChange = (index, e) => {
        const { name, value } = e.target;
        const updatedExperience = [...(formData.work_experience || [])];
        updatedExperience[index] = { ...updatedExperience[index], [name]: value };
        setFormData(prev => ({ ...prev, work_experience: updatedExperience }));
    };

    const handleResumeFileChange = (e) => {
        if (!isEditing || !e.target.files || e.target.files.length === 0) return;
        setResumeFile(e.target.files[0]);
    };
    
    const handleAvatarFileChange = (e) => {
        if (!isEditing || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setAvatarFile(file);
        setPhotoPreviewUrl(URL.createObjectURL(file));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const updates = { ...formData, id: user.id, updated_at: new Date() };
            delete updates.email;

            if (avatarFile) {
                const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
                await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                updates.avatar_url = urlData.publicUrl;
            }

            if (resumeFile) {
                const filePath = `${user.id}/${Date.now()}_${resumeFile.name}`;
                await supabase.storage.from('resume').upload(filePath, resumeFile, { upsert: true });
                updates.resume_url = filePath;
            }
            
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            setSaveSuccess(true);
            if (updates.avatar_url) setAvatarUrl(updates.avatar_url);
            setOriginalFormData(formData);
            setPhotoPreviewUrl(null);
            setIsEditing(false);
        } catch (error) {
            alert(`Error saving profile: ${error.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };
    
    const filteredJobListings = jobs.filter(job =>
        job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'job-listings':
                return (
                    <JobListings
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isSearching={isSearching}
                        filteredJobListings={filteredJobListings}
                    />
                );
            case 'profile':
                return (
                    <ProfilePage
                        profileData={formData} 
                        loading={loading}
                        avatarUrl={avatarUrl}
                        photoPreviewUrl={photoPreviewUrl}
                        resumeFile={resumeFile}
                        isSaving={isSaving}
                        saveSuccess={saveSuccess}
                        isEditing={isEditing}
                        isExtracting={isExtracting}
                        showFullProfile={showFullProfile}
                        setShowFullProfile={setShowFullProfile}
                        handleEditClick={handleEditClick}
                        handleCancelClick={handleCancelClick}
                        handleProfileChange={handleProfileChange}
                        handleExperienceChange={handleExperienceChange}
                        handleAddExperience={handleAddExperience}
                        handleSaveProfile={handleSaveProfile}
                        handleFileChange={handleResumeFileChange}
                        handlePhotoChange={handleAvatarFileChange}
                    />
                );
            case 'interviews': return <Calendar />;
            case 'ats-checker': return <PlaceholderContent title="ATS Checker" message="This feature is under development." icon={<AtsCheckerIcon />} />;
            case 'messages': return <PlaceholderContent title="No messages yet" message="You'll see notifications here when you receive updates." icon={<ChatIcon />} />;
            default: return null;
        }
    };
    
    const contentVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };
    const tabItems = [
        { key: 'job-listings', icon: <BriefcaseIcon />, label: 'Job Listings' },
        { key: 'profile', icon: <UserCircleIcon />, label: 'Profile' },
        { key: 'interviews', icon: <CalendarIcon />, label: 'Interviews' },
        { key: 'ats-checker', icon: <AtsCheckerIcon />, label: 'ATS Checker' },
        { key: 'messages', icon: <ChatIcon />, label: 'Messages' },
    ];

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: '#020617', color: 'white', fontFamily: "'Montserrat', sans-serif", padding: '2rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <style>{` main::-webkit-scrollbar { width: 8px; } main::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } main::-webkit-scrollbar-thumb { background: #FBBF24; border-radius: 10px; } main::-webkit-scrollbar-thumb:hover { background: #FCD34D; } `}</style>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#FBBF24', top: '-50px', left: '-100px' }}></div>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#F59E0B', bottom: '-80px', right: '-120px' }}></div>
            </div>
            
            <header style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Welcome to the Recruitment Portal</h1>
                <motion.button onClick={() => { supabase.auth.signOut(); onNavigate('login'); }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#FBBF24', color: '#1a202c', display: 'flex', alignItems: 'center', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}><LogoutIcon />Logout</motion.button>
            </header>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0, marginBottom: '2rem' }}>
                <nav style={{ position: 'relative', zIndex: 1, display: 'inline-flex', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '0.5rem', overflowX: 'auto' }}>
                    {tabItems.map(({ key, icon, label }) => {
                        const isActive = key === activeTab;
                        return (
                            <div key={key} onClick={() => setActiveTab(key)} style={{ position: 'relative', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isActive ? '#FCD34D' : '#d1d5db', fontWeight: isActive ? 'bold' : 'normal', zIndex: 1 }}>
                                {icon}
                                <span style={{ marginLeft: '0.5rem', textTransform: 'capitalize' }}>{label}</span>
                                {isActive && (
                                    <motion.div layoutId="active-pill" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(251, 191, 36, 0.2)', borderRadius: '0.5rem', zIndex: -1 }} transition={{ duration: 0.2 }} />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <main style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} variants={contentVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};