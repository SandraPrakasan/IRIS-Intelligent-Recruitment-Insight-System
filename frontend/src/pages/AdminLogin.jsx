import { supabase } from '../supabaseClient';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// --- SVG Icon Components ---
const UserIcon = () => (<svg style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.7)' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const LockIcon = () => (<svg style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.7)' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>);
const SpinnerIcon = () => <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></motion.svg>;


export default function AdminLogin({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- STATE UPDATES ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Changed to a single string for all errors

  // --- UPDATED LOGIN HANDLER ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;
      if (!user) throw new Error("Login failed, please try again.");

      // 2. ✅ CORRECTED: Check role in 'user_roles' using 'user_id'
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')      // Correct table name
        .select('role')
        .eq('user_id', user.id)  // ⚠️ CHANGED: was 'id', now 'user_id'
        .single();

      // Handle case where no role row exists
      if (roleError && roleError.code !== 'PGRST116') {
        throw new Error("Could not verify user role.");
      }

      // 3. Check role and grant access
      // You mentioned checking for 'recruiter' here. 
      // If this is the ADMIN login page, you should check for 'admin'.
      // If this is a general login, checking for 'recruiter' is fine.
      if (roleData && roleData.role === 'recruiter') {

        // ✅ Success
        if (typeof onNavigate === 'function') {
          onNavigate('admin-dashboard');
        }

      } else {
        // ❌ Access Denied
        await supabase.auth.signOut();
        throw new Error("Access Denied. Authorized personnel only.");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', width: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      backgroundColor: '#020617', color: 'white', fontFamily: "'Montserrat', sans-serif", padding: '1rem',
    }}>
      <style>{`@import url('...'); input:-webkit-autofill...`}</style>

      {/* Background Shapes */}
      <>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, width: '384px', height: '384px', backgroundColor: '#EF4444', top: '-50px', left: '-100px' }}></div>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, width: '320px', height: '320px', backgroundColor: '#DC2626', bottom: '-80px', right: '-120px' }}></div>
      </>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: '100%', maxWidth: '512px', borderRadius: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '2rem', zIndex: 10,
        }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Admin Portal</h2>
          <p style={{ color: '#d1d5db', marginTop: '0.25rem' }}>Manage CV submissions and applications</p>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}><UserIcon /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder="admin@email.com" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid rgba(239, 68, 68, 0.3)`, borderRadius: '0.5rem', color: 'white', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}><LockIcon /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} placeholder="Password" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid rgba(239, 68, 68, 0.3)`, borderRadius: '0.5rem', color: 'white', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* --- UI TO DISPLAY ANY ERROR --- */}
          {error && <p style={{ color: '#F87171', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.98 }} style={{ width: '100%', backgroundColor: '#EF4444', color: 'white', fontWeight: 'bold', padding: '0.75rem 0', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
            {/* --- UI FEEDBACK FOR LOADING --- */}
            {loading && <SpinnerIcon />}
            {loading ? 'Verifying...' : 'Continue'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}