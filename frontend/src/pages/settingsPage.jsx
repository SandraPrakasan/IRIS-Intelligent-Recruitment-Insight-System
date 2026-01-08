import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; 
import AdminSettings from '../components/adminSettings';

// --- Icons ---
const UploadIcon = () => <svg style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.5)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const SpinnerIcon = () => <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></motion.svg>;

export default function SettingsPage() {
    // --- State for UI control ---
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- State for data ---
    const [companyName, setCompanyName] = useState('');
    const [recruiterName, setRecruiterName] = useState('');
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [companyEmail, setCompanyEmail] = useState('');
    const [currentCompanyId, setCurrentCompanyId] = useState(null); // To track which company to update

    // --- 1. Fetch Data from 'user_roles' and 'companies' ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not found");

                // A. Get Recruiter/Admin Details from 'user_roles'
                const { data: roleData, error: roleError } = await supabase
                    .from('user_roles')
                    .select('name, company_id')
                    .eq('user_id', user.id)
                    .single();

                if (roleError) {
                    // Handle case where user exists in Auth but not in user_roles table yet
                    if (roleError.code !== 'PGRST116') throw roleError;
                }

                if (roleData) {
                    setRecruiterName(roleData.name || '');
                    
                    // B. If they have a company assigned, fetch Company Details
                    if (roleData.company_id) {
                        setCurrentCompanyId(roleData.company_id);
                        
                        const { data: companyData, error: companyError } = await supabase
                            .from('companies')
                            .select('*')
                            .eq('id', roleData.company_id)
                            .single();

                        if (companyError) throw companyError;

                        if (companyData) {
                            setCompanyName(companyData.name || '');
                            setLogoUrl(companyData.logo_url || null);
                            setCompanyEmail(companyData.company_email || '');
                        }
                    }
                }

            } catch (error) {
                console.error("Error fetching settings:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoUrl(URL.createObjectURL(file));
        }
    };

    // --- 2. Save Data to 'user_roles' and 'companies' ---
    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // --- A. Upload Logo if changed ---
            let updatedLogoUrl = logoUrl;
            if (logoFile) {
                // Ensure you have a bucket named 'company_logos' or similar
                const filePath = `company_logos/${user.id}-${Date.now()}-${logoFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('company_logos') // Make sure this bucket exists!
                    .upload(filePath, logoFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('company_logos')
                    .getPublicUrl(filePath);
                
                updatedLogoUrl = urlData.publicUrl;
            }

            // --- B. Update or Create Company ---
            const domain = companyEmail ? companyEmail.split('@')[1] : null;
            const companyUpdateData = {
                name: companyName,
                company_email: companyEmail,
                domain: domain,
                logo_url: updatedLogoUrl
            };

            let finalCompanyId = currentCompanyId;

            if (currentCompanyId) {
                // Update existing company
                const { error: companyError } = await supabase
                    .from('companies')
                    .update(companyUpdateData)
                    .eq('id', currentCompanyId);
                if (companyError) throw companyError;
            } else {
                // Create new company if none exists
                const { data: newCompany, error: createError } = await supabase
                    .from('companies')
                    .insert(companyUpdateData)
                    .select('id')
                    .single();
                
                if (createError) throw createError;
                finalCompanyId = newCompany.id;
                setCurrentCompanyId(finalCompanyId);
            }

            // --- C. Update Recruiter Profile in 'user_roles' ---
            const { error: roleUpdateError } = await supabase
                .from('user_roles')
                .update({ 
                    name: recruiterName,
                    company_id: finalCompanyId 
                })
                .eq('user_id', user.id);

            if (roleUpdateError) throw roleUpdateError;

            // Success UI
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

    // --- Component JSX (UI) remains mostly the same, just using the new state ---
    const profilePhotoSection = (
        <div style={{ marginTop: '4rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: 0 }}>Profile Photo</h2>
            <div style={{ textAlign: 'center' }}>
                {logoUrl ? (
                    <img 
                        src={logoUrl} 
                        alt="Profile Preview" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.5rem', objectFit: 'cover' }} 
                    />
                ) : (
                    // ✅ CHANGED: Default icon is now a user profile icon
                    <img 
                        src="https://img.icons8.com/ios-filled/100/EF4444/user.png" 
                        alt="Profile" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.5rem' }} 
                    />
                )}

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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Recruiter/Admin Name</label>
                    {isEditing ? (
                        <input type="text" value={recruiterName} onChange={e => setRecruiterName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                    ) : (
                        <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>{recruiterName || 'Not set'}</p>
                    )}
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Company Email</label>
                    {isEditing ? (
                        <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                    ) : (
                        <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>{companyEmail || 'Not set'}</p>
                    )}
                </div>

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