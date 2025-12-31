import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileTab = ({
    profileData,
    isEditing,
    handleProfileChange,
    handleExperienceChange,
    handleAddExperience,
    showFullProfile,
}) => {
    if (!profileData) return null;

    const inputStyles = {
        width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        backgroundColor: 'rgba(255,255,255,0.1)', color: 'white'
    };
    
    const labelStyles = { display: 'block', marginBottom: '0.5rem', color: '#d1d5db' };
    
    // --- Styles for checkboxes ---
    const checkboxLabelStyles = { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' };
    const checkboxStyles = { width: '1.15em', height: '1.15em', accentColor: '#FBBF24' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                    <label style={labelStyles}>Full Name</label>
                    {isEditing ? ( <input type="text" name="full_name" value={profileData?.full_name || ''} onChange={handleProfileChange} style={inputStyles} placeholder="e.g., John Doe" /> ) : ( <p>{profileData?.full_name || 'Not set'}</p> )}
                </div>
                <div>
                    <label style={labelStyles}>Headline</label>
                    {isEditing ? ( <input type="text" name="headline" value={profileData?.headline || ''} onChange={handleProfileChange} style={inputStyles} placeholder="e.g., Senior Software Engineer"/> ) : ( <p>{profileData?.headline || 'Not set'}</p> )}
                </div>
            </div>

            {/* Summary */}
            <div>
                <label style={labelStyles}>Summary</label>
                {isEditing ? ( <textarea name="summary" value={profileData?.summary || ''} onChange={handleProfileChange} rows="4" style={inputStyles} placeholder="Tell us about yourself..."/> ) : ( <p>{profileData?.summary || 'Not set'}</p> )}
            </div>

            {/* Extended Profile Fields */}
            <AnimatePresence>
                {showFullProfile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div>
                                <label style={labelStyles}>Email</label>
                                {isEditing ? ( <input type="email" name="email" value={profileData?.email || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <p>{profileData?.email || 'Not set'}</p> )}
                            </div>
                            <div>
                                <label style={labelStyles}>Phone</label>
                                {isEditing ? ( <input type="tel" name="phone" value={profileData?.phone || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <p>{profileData?.phone || 'Not set'}</p> )}
                            </div>
                             <div>
                                <label style={labelStyles}>Address</label>
                                {isEditing ? ( <input type="text" name="address" value={profileData?.address || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <p>{profileData?.address || 'Not set'}</p> )}
                            </div>
                            <div>
                                <label style={labelStyles}>Current Position</label>
                                {isEditing ? ( <input type="text" name="current_position" value={profileData?.current_position || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <p>{profileData?.current_position || 'Not set'}</p> )}
                            </div>
                            <div>
                                <label style={labelStyles}>Years of Experience</label>
                                {isEditing ? ( <input type="text" name="experience_years" value={profileData?.experience_years || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <p>{profileData?.experience_years || 'Not set'}</p> )}
                            </div>
                            <div>
                                <label style={labelStyles}>Desired Salary</label>
                                {isEditing ? ( <input type="text" name="desired_salary" value={profileData?.desired_salary || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <p>{profileData?.desired_salary || 'Not set'}</p> )}
                            </div>
                            <div>
                                <label style={labelStyles}>LinkedIn</label>
                                {isEditing ? ( <input type="url" name="linkedin" value={profileData?.linkedin || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <a href={profileData?.linkedin || '#'} target="_blank" rel="noreferrer" style={{color: '#93C5FD'}}>{profileData?.linkedin || 'Not set'}</a> )}
                            </div>
                            <div>
                                <label style={labelStyles}>GitHub</label>
                                {isEditing ? ( <input type="url" name="github" value={profileData?.github || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <a href={profileData?.github || '#'} target="_blank" rel="noreferrer" style={{color: '#93C5FD'}}>{profileData?.github || 'Not set'}</a> )}
                            </div>
                             <div>
                                <label style={labelStyles}>Portfolio</label>
                                {isEditing ? ( <input type="url" name="portfolio" value={profileData?.portfolio || ''} onChange={handleProfileChange} style={inputStyles} /> ) : ( <a href={profileData?.portfolio || '#'} target="_blank" rel="noreferrer" style={{color: '#93C5FD'}}>{profileData?.portfolio || 'Not set'}</a> )}
                            </div>
                             <div style={{gridColumn: 'span 2'}}>
                                <label style={labelStyles}>Technical Skills</label>
                                {isEditing ? ( <textarea name="technical_skills" value={profileData?.technical_skills || ''} onChange={handleProfileChange} rows="3" style={inputStyles} /> ) : ( <p>{profileData?.technical_skills || 'Not set'}</p> )}
                            </div>
                             <div style={{ alignSelf: 'center' }}>
                                 {isEditing ? (
                                     <label style={checkboxLabelStyles}><input type="checkbox" name="willing_to_relocate" checked={!!profileData?.willing_to_relocate} onChange={handleProfileChange} style={checkboxStyles}/> Willing to Relocate</label>
                                 ) : ( <p>{profileData?.willing_to_relocate ? 'Willing to relocate' : 'Not willing to relocate'}</p> )}
                             </div>
                             <div style={{ alignSelf: 'center' }}>
                                 {isEditing ? (
                                     <label style={checkboxLabelStyles}><input type="checkbox" name="available_remote" checked={!!profileData?.available_remote} onChange={handleProfileChange} style={checkboxStyles}/> Available for Remote Work</label>
                                 ) : ( <p>{profileData?.available_remote ? 'Available for remote' : 'Not available for remote'}</p> )}
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Work Experience Section */}
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: '1.5rem' }}>Work Experience</h3>
                {isEditing ? (
                    <>
                        {(profileData?.work_experience || []).map((exp, index) => (
                            <div key={exp.id || index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <input type="text" name="company" value={exp.company || ''} onChange={(e) => handleExperienceChange(index, e)} placeholder="Company" style={inputStyles} />
                                <input type="text" name="role" value={exp.role || ''} onChange={(e) => handleExperienceChange(index, e)} placeholder="Role" style={inputStyles} />
                                <input type="text" name="years" value={exp.years || ''} onChange={(e) => handleExperienceChange(index, e)} placeholder="Years" style={inputStyles} />
                            </div>
                        ))}
                        <button 
                            onClick={handleAddExperience} 
                            style={{ 
                                backgroundColor: 'rgba(251, 191, 36, 0.2)', 
                                color: '#FCD34D', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '0.5rem', 
                                border: 'none', 
                                cursor: 'pointer' 
                            }}
                        >
                            + Add More Experience
                        </button>
                    </>
                ) : (
                    <div>
                        {profileData?.work_experience && profileData.work_experience.length > 0 ? (
                            profileData.work_experience.map((exp, index) => (
                                <div key={exp.id || index} style={{marginBottom: '1rem'}}>
                                    <p style={{ fontWeight: 'bold', margin: 0 }}>{exp.role}</p>
                                    <p style={{ color: '#d1d5db', margin: 0 }}>{exp.company} • {exp.years} years</p>
                                </div>
                            ))
                        ) : (
                            <p>No work experience added.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileTab;