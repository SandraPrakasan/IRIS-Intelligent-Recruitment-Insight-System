import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ApplicantLayout from '../components/ApplicantLayout'; // The Navigation Wrapper
import ProfilePage from '../components/ProfilePage'; // The UI Component

export default function ApplicantProfile({ onNavigate }) {
    // --- 1. STATE VARIABLES ---
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

    // --- 2. FETCH DATA ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    // Fetch Profile using maybeSingle() to avoid errors if empty
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (error) {
                        console.error("Error fetching profile:", error.message);
                    }

                    if (profile) {
                        // Profile exists - Load it
                        const combinedData = { ...profile, email: user.email };
                        setFormData(combinedData);
                        setOriginalFormData(combinedData);
                        if (profile.avatar_url) {
                           setAvatarUrl(profile.avatar_url);
                        }
                    } else {
                        // New user - Initialize with just email
                        setFormData({ email: user.email });
                    }
                }
            } catch (error) {
                console.error("Unexpected error:", error);
            } finally {
                // ✅ CRITICAL FIX: This ensures loading ALWAYS stops
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- 3. HANDLERS ---
    const handleEditClick = () => {
        setFormData(currentData => {
            const hasExperience = currentData.work_experience && currentData.work_experience.length > 0;
            if (!hasExperience) {
                return {
                    ...currentData,
                    work_experience: [{ id: Date.now(), company: '', role: '', years: '' }]
                };
            }
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
            delete updates.email; // Don't try to update email in profiles table

            if (avatarFile) {
                const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
                await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                updates.avatar_url = urlData.publicUrl;
            }

            if (resumeFile) {
                const filePath = `${user.id}/${Date.now()}_${resumeFile.name}`;
                // Make sure your bucket is named 'resumes' (plural) or 'resume' (singular) to match your Supabase Storage
                await supabase.storage.from('resumes').upload(filePath, resumeFile, { upsert: true });
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

    // --- 4. RENDER ---
    return (
        <ApplicantLayout activePage="applicant-profile" onNavigate={onNavigate}>
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
                // Pass Handlers
                handleEditClick={handleEditClick}
                handleCancelClick={handleCancelClick}
                handleProfileChange={handleProfileChange}
                handleExperienceChange={handleExperienceChange}
                handleAddExperience={handleAddExperience}
                handleSaveProfile={handleSaveProfile}
                handleFileChange={handleResumeFileChange}
                handlePhotoChange={handleAvatarFileChange}
            />
        </ApplicantLayout>
    );
}