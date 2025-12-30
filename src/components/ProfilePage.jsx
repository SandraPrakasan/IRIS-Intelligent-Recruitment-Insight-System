import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpinnerIcon } from './Icons';
import ProfileHeader from './ProfileHeader';
import ProfileTab from './ProfileTab';
import CVForm from './CVForm';

const ProfilePage = ({
    profileData,
    loading,
    avatarUrl,
    photoPreviewUrl,
    resumeFile,
    isSaving,
    saveSuccess,
    isEditing,
    isExtracting,
    showFullProfile,
    setShowFullProfile,
    handleEditClick,
    handleCancelClick,
    handleProfileChange,
    handleExperienceChange,
    handleAddExperience,
    handleSaveProfile,
    handleFileChange,
    handlePhotoChange,
}) => {
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><SpinnerIcon /> <span style={{ marginLeft: '1rem', fontSize: '1.25rem' }}>Loading Profile...</span></div>;
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Your Profile Section */}
                    <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <ProfileHeader
                            isEditing={isEditing}
                            showFullProfile={showFullProfile}
                            setShowFullProfile={setShowFullProfile}
                            handleEditClick={handleEditClick}
                        />
                        <ProfileTab
                            profileData={profileData}
                            isEditing={isEditing}
                            handleProfileChange={handleProfileChange}
                            handleExperienceChange={handleExperienceChange}
                            handleAddExperience={handleAddExperience}
                            showFullProfile={showFullProfile}
                            isExtracting={isExtracting}
                        />
                    </div>
                </div>
                
                {/* Right Column - Always visible */}
                <CVForm
                    profileData={profileData}
                    photoUrl={photoPreviewUrl || avatarUrl}
                    resumeFile={resumeFile}
                    isEditing={isEditing}
                    handlePhotoChange={handlePhotoChange}
                    handleFileChange={handleFileChange}
                />
            </div>
            
            {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
                    {/* Save and Cancel Buttons */}
                    <motion.button onClick={handleCancelClick} whileHover={{ scale: 1.03 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                        Cancel
                    </motion.button>
                    <AnimatePresence>
                        {saveSuccess && ( <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#34D399', marginRight: '1rem' }}> Profile Saved! </motion.p> )}
                    </AnimatePresence>
                    <motion.button onClick={handleSaveProfile} disabled={isSaving} whileHover={{ scale: isSaving ? 1 : 1.03 }} style={{ backgroundColor: '#FBBF24', color: '#1a202c', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center' }}>
                        {isSaving && <SpinnerIcon />} {isSaving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;