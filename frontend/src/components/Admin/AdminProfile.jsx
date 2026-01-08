import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient'; // ✅ Imported Supabase
import SettingsPage from '../../pages/settingsPage'; // 👈 Check this path! 

export default function AdminProfile({ onNavigate }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    if (loading) {
        return <div style={{ color: 'white', padding: '2rem' }}>Loading Profile...</div>;
    }

    // Render the existing SettingsPage component
    return (
        <div style={{ height: '100%', width: '100%' }}>
            {/* You can pass the user object down if SettingsPage needs it */}
            <SettingsPage onNavigate={onNavigate} user={user} />
        </div>
    );
}