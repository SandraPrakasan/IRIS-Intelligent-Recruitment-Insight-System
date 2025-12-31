import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; // Make sure this path is correct
import AdminSettings from '../components/adminSettings';

// --- Icons used on this page ---
const LogoutIcon = () => ( <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg> );
const UploadIcon = () => <svg style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.5)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const SpinnerIcon = () => <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></motion.svg>;

export default function SettingsPage({ onNavigate }) {
    // --- State for UI control ---
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- State for data ---
    const [companyName, setCompanyName] = useState('');
    const [recruiterName, setRecruiterName] = useState('');
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoFile, setLogoFile] = useState(null); // For handling the new file upload
    const [companyEmail, setCompanyEmail] = useState('');

    // ✅ CORRECTED: Handler functions are now outside useEffect

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not found");

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select(`full_name, companies (name, logo_url, company_email)`)
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile) {
                    setRecruiterName(profile.full_name || '');
                    if (profile.companies) {
                        setCompanyName(profile.companies.name || '');
                        setLogoUrl(profile.companies.logo_url || null);
                        setCompanyEmail(profile.companies.company_email || '');
                    }
                }
            } catch (error) {
                console.error("Error fetching settings:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // useEffect ends here

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoUrl(URL.createObjectURL(file));
        } else {
            alert("Please select a valid image file.");
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            const { data: profileData } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
            if (!profileData) throw new Error("Could not fetch user profile.");
            
            // ✅ IMPROVEMENT: Safer domain extraction
            const domain = companyEmail ? companyEmail.split('@')[1] : null;
            
            const companyUpdateData = {
                name: companyName,
                company_email: companyEmail,
                domain: domain
            };

            let updatedLogoUrl = logoUrl;
            if (logoFile) {
                const filePath = `public/${user.id}-${logoFile.name}`;
                const { error: uploadError } = await supabase.storage.from('company_logos').upload(filePath, logoFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('company_logos').getPublicUrl(filePath);
                updatedLogoUrl = urlData.publicUrl;
                companyUpdateData.logo_url = updatedLogoUrl;
            }

            if (profileData.company_id) {
                const { error: companyError } = await supabase.from('companies').update(companyUpdateData).eq('id', profileData.company_id);
                if (companyError) throw companyError;
            } else {
                const { data: newCompany, error: companyError } = await supabase.from('companies').insert(companyUpdateData).select('id').single();
                if (companyError) throw companyError;
                const { error: linkError } = await supabase.from('profiles').update({ company_id: newCompany.id }).eq('id', user.id);
                if (linkError) throw linkError;
            }

            const { error: userProfileError } = await supabase.from('profiles').update({ full_name: recruiterName }).eq('id', user.id);
            if (userProfileError) throw userProfileError;

            alert('Profile saved successfully!');
            setSaveSuccess(true);
            setIsEditing(false);
            setLogoFile(null);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (error) {
            console.error("Error saving settings:", error.message);
            alert("Error: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div style={{color: 'white', padding: '2rem'}}>Loading Settings...</div>;
    }

    const profilePhotoSection = (
    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: 0 }}>Profile Photo</h2>
        <div style={{ textAlign: 'center' }}>
            {/* This image is always visible */}
            {logoUrl ? (
                <img 
                    src={logoUrl} 
                    alt="Profile Preview" 
                    // --- 👇 SIZE INCREASED HERE 👇 ---
                    style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.5rem', objectFit: 'cover' }} 
                />
            ) : (
                <img 
                    src="https://img.icons8.com/ios-filled/100/EF4444/batman-new.png" 
                    alt="Profile" 
                    // --- 👇 SIZE INCREASED HERE 👇 ---
                    style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.5rem' }} 
                />
            )}

            {/* This entire uploader section will now only appear when isEditing is true */}
            {isEditing && (
                <div style={{ border: '2px dashed rgba(239, 68, 68, 0.3)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <input type="file" id="photo-upload" accept="image/jpeg, image/png, image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <UploadIcon />
                        <p style={{ color: '#d1d5db', marginTop: '1rem' }}>{logoFile ? logoFile.name : 'Click to upload or drag and drop'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>PNG, JPG or WEBP (MAX. 2MB)</p>
                    </label>
                </div>
            )}
        </div>
        
        {/* The save button also correctly appears only in edit mode */}
        
    </div>
);

    const companySettings = (
    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Company Settings</h2>
            {!isEditing && (
                <motion.button onClick={() => setIsEditing(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                    Edit Profile
                </motion.button>
            )}
        </div>
        
        {/* 👇 This is the container I've adjusted 👇 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Company Name</label>
                {isEditing ? (
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                ) : (
                    <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>{companyName || 'Not set'}</p>
                )}
            </div>
            
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Recruiter Name</label>
                {isEditing ? (
                    <input type="text" value={recruiterName} onChange={e => setRecruiterName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                ) : (
                    <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>{recruiterName || 'Not set'}</p>
                )}
            </div>
            
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Company Email</label>
                {isEditing ? (
                    <input 
                        type="email" 
                        value={companyEmail} 
                        onChange={e => setCompanyEmail(e.target.value)} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} 
                    />
                ) : (
                    <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>{companyEmail || 'Not set'}</p>
                )}
            </div>
            {/* The save button also correctly appears only in edit mode */}
        {isEditing && (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '2rem'}}>
                <motion.button onClick={handleSaveSettings} disabled={isSaving} whileHover={{ scale: isSaving ? 1 : 1.03 }} whileTap={{ scale: isSaving ? 1 : 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center' }}>
                    {isSaving && <SpinnerIcon />} {isSaving ? 'Saving...' : 'Save Settings'}
                </motion.button>
                <AnimatePresence>
                    {saveSuccess && <motion.p initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} style={{marginLeft: '1rem', color: '#34D399'}}>Settings Saved!</motion.p>}
                </AnimatePresence>
            </div>
        )}
        </div>
    </div>
);



    return (
        <div>
            <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Settings</h1>
                <motion.button onClick={() => onNavigate('login')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
                    <LogoutIcon /> Logout
                </motion.button>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {profilePhotoSection}
                {companySettings}
                <div style={{ border: '1px solid #EF4444', borderRadius: '1rem', padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F87171', marginTop: 0 }}>Danger Zone</h2>
                    <p style={{color: '#d1d5db', marginTop: 0, marginBottom: '1.5rem'}}>Transferring ownership is a permanent action. The new admin will have full control, and your admin privileges will be revoked.</p>
                    <AdminSettings />
                </div>
            </div>
        </div>
    );
};