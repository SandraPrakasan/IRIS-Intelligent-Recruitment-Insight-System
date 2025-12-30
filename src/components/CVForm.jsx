import React from 'react';
import { motion } from 'framer-motion';
import { UploadIcon } from './Icons';

const CVForm = ({
    profileData,
    photoUrl,
    resumeFile,
    isEditing,
    handlePhotoChange,
    handleFileChange
}) => {

    const getBaseName = (path) => {
        if (!path) return 'Existing Resume';
        return path.substring(path.lastIndexOf('/') + 1).substring(path.indexOf('_') + 1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* ========= AVATAR SECTION UPDATED ========= */}
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Your Avatar</h3>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                        
                        {/* Conditionally render DIV for real photo, or IMG for fallback */}
                        {photoUrl ? (
                            <div
                                key={photoUrl} // Key to force re-render on change
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    backgroundImage: `url(${photoUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: '3px solid rgba(251, 191, 36, 0.3)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                        ) : (
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.full_name || 'U')}&background=FBBF24&color=1a202c&size=150&bold=true`}
                                alt="Profile"
                                style={{ 
                                    width: '150px', 
                                    height: '150px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '3px solid rgba(251, 191, 36, 0.3)'
                                }}
                            />
                        )}
                    </div>

                    {/* Upload Section - ONLY VISIBLE IN EDIT MODE */}
                    {isEditing && (
                        <div style={{ border: '2px dashed rgba(251, 191, 36, 0.3)', borderRadius: '1rem', padding: '1rem' }}>
                            <input type="file" id="photo-upload" accept="image/jpeg, image/png" onChange={handlePhotoChange} style={{ display: 'none' }} disabled={!isEditing} />
                            <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <UploadIcon />
                                <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', marginBlockEnd: 0 }}>
                                    PNG, JPG (MAX. 1MB)
                                </p>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Resume Section (No changes needed here) */}
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Your Resume
                {/* This is the new status badge */}
                {(profileData?.resume_url) && (
                    <span style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.2)', 
                     color: '#22C55E', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600'
                        }}>
                    On File
                </span>
                )}</h3>

                
                {(resumeFile || profileData?.resume_url) ? (
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg style={{ width: '20px', height: '20px', color: '#22C55E' }} viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                        </div>
                        <div style={{ flex: '1', minWidth: 0 }}>
                            <p style={{ fontWeight: 'bold', color: '#22C55E', margin: 0, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {resumeFile ? resumeFile.name : getBaseName(profileData?.resume_url)}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.75rem' }}>
                                {resumeFile ? 'New file selected' : ''}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p style={{color: '#d1d5db', padding: '1rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem'}}>No resume has been uploaded.</p>
                )}
                
                {isEditing && (
                    <div style={{ border: '2px dashed rgba(251, 191, 36, 0.3)', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
                        <input type="file" id="resume-upload" accept=".pdf,.docx" onChange={handleFileChange} style={{ display: 'none' }} disabled={!isEditing} />
                        <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <UploadIcon />
                            <span>{profileData?.resume_url ? 'Upload New Resume' : 'Upload Resume'}</span>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', marginBlockEnd: 0 }}>
                                PDF, DOCX (MAX. 5MB)
                            </p>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVForm;