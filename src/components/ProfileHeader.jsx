import React from 'react';
import { motion } from 'framer-motion';

const ProfileHeader = ({ 
    isEditing, 
    showFullProfile, 
    setShowFullProfile, 
    handleEditClick 
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Your Profile</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!isEditing && (
                    <motion.button 
                        onClick={() => setShowFullProfile(prev => !prev)} 
                        whileHover={{ scale: 1.03 }} 
                        whileTap={{ scale: 0.98 }} 
                        style={{ 
                            backgroundColor: 'rgba(251,191,36,0.15)', 
                            color: '#FCD34D', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem', 
                            border: '1px solid rgba(251,191,36,0.3)', 
                            cursor: 'pointer' 
                        }}
                    >
                        {showFullProfile ? 'Hide full profile' : 'See full profile'}
                    </motion.button>
                )}
                {!isEditing && (
                    <motion.button 
                        onClick={handleEditClick} 
                        whileHover={{ scale: 1.03 }} 
                        whileTap={{ scale: 0.98 }} 
                        style={{ 
                            backgroundColor: 'rgba(255,255,255,0.1)', 
                            color: 'white', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            cursor: 'pointer' 
                        }}
                    >
                        Edit Profile
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;
