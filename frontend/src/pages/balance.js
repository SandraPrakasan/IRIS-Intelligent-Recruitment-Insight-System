// --- Settings Page Component ---
const SettingsPage = ({ onNavigate }) => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")) {
            setProfilePhoto(file);
        } else {
            alert("Please upload a JPG, PNG, or WEBP file.");
        }
    };

    const handleSaveSettings = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1500);
    };

    const companySettings = (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Company Settings</h2>
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
                        <input type="text" defaultValue="GroupMoo" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    ) : (
                        <p style={{ fontSize: '1rem', fontWeight: '500' }}>GroupMoo</p>
                    )}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Recruiter Name</label>
                     {isEditing ? (
                        <input type="text" defaultValue="Roman Reigns" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    ) : (
                        <p style={{ fontSize: '1rem', fontWeight: '500' }}>Roman Reigns</p>
                    )}
                </div>
                {isEditing && (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Default CV Sorting</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <select className="custom-select" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}><option>Match Score</option></select>
                                <select className="custom-select" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}><option>Descending</option></select>
                            </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '1rem'}}>
                            <motion.button onClick={handleSaveSettings} disabled={isSaving} whileHover={{ scale: isSaving ? 1 : 1.03 }} whileTap={{ scale: isSaving ? 1 : 0.98 }} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center' }}>
                               {isSaving && <SpinnerIcon />} {isSaving ? 'Saving...' : 'Save Settings'}
                            </motion.button>
                            <AnimatePresence>
                                {saveSuccess && <motion.p initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} style={{marginLeft: '1rem', color: '#34D399'}}>Settings Saved!</motion.p>}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const profilePhotoSection = (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Profile Photo</h2>
            <div style={{ textAlign: 'center' }}>
                {profilePhoto ? ( <img src={URL.createObjectURL(profilePhoto)} alt="Profile Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', objectFit: 'cover' }} /> ) : ( <img src="https://img.icons8.com/ios-filled/100/EF4444/batman-new.png" alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem' }} /> )}
                <div style={{ border: '2px dashed rgba(239, 68, 68, 0.3)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <input type="file" id="photo-upload" accept="image/jpeg, image/png, image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <UploadIcon />
                        <p style={{ color: '#d1d5db', marginTop: '1rem' }}>{profilePhoto ? profilePhoto.name : 'Click to upload or drag and drop'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>PNG, JPG or WEBP (MAX. 2MB)</p>
                    </label>
                </div>
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
                {profilePhoto ? (
                    <>
                        {profilePhotoSection}
                        {companySettings}
                    </>
                ) : (
                    <>
                        {companySettings}
                        {profilePhotoSection}
                    </>
                )}
            </div>
        </div>
    );
};