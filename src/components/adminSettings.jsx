import { supabase } from '../supabaseClient';
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Import motion for the button

// You might need this icon if it's not globally available
const SpinnerIcon = () => <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></motion.svg>;

export default function AdminSettings() {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInError) {
        throw new Error("Incorrect password. Please try again.");
      }

      const { error: invokeError } = await supabase.functions.invoke('initiate-admin-transfer', {
        body: { newAdminEmail: newAdminEmail },
      });

      if (invokeError) throw invokeError;

      alert(`An invitation to become the new admin has been sent to ${newAdminEmail}.`);
      setNewAdminEmail('');
      setPassword('');

    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransferRequest}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginTop: 0 }}>Transfer Admin Ownership</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>
          New Admin's Email
        </label>
        <input
          type="email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          required
          placeholder="david@company.com"
          // --- STYLE UPDATES FOR INPUT ---
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'white',
            boxSizing: 'border-box' // Important for consistent sizing
          }}
        />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>
          Confirm Your Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
           // --- STYLE UPDATES FOR INPUT ---
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'white',
            boxSizing: 'border-box'
          }}
        />
      </div>
      {/* --- STYLE UPDATES FOR BUTTON --- */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.03 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        style={{
          width: 'auto',
          backgroundColor: '#EF4444',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading && <SpinnerIcon />}
        {loading ? 'Sending Invitation...' : 'Send Transfer Invitation'}
      </motion.button>
    </form>
  );
}