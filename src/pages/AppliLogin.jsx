import { supabase } from '../supabaseClient';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SVG Icon Components (no changes) ---
const EyeIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> );
const EyeOffIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> );

export default function AppliLogin({ onNavigate }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // NEW: State for integrated notifications
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '...' }

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid.';
    
    if (mode !== 'forgot') {
      if (!password) newErrors.password = 'Password is required.';
    }

    if (mode === 'register') {
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    }
    return newErrors;
  };

  // --- FULLY MODIFIED handleSubmit Function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    setNotification(null); // Clear previous notifications

    try {
      if (mode === 'login') {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // ✅ Check user role from Supabase metadata
  const role = data.user?.user_metadata?.role;

    if (role === 'applicant') {
    onNavigate('dashboard');
  } else {
    // If role is undefined or invalid
    setNotification({ type: 'error', message: 'Unauthorized role detected.' });
    await supabase.auth.signOut(); // Log out unauthorized users
  }
}
 else if (mode === 'register') {
        // FIXED: Added options to pass the 'applicant' role to our trigger
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'applicant'
            }
          }
        });
        if (error) throw error;
        setNotification({ type: 'success', message: 'Registration successful! Please login to access your account.' });
        setMode('login');
      } else if (mode === 'forgot') {
        // NEW: Added password reset logic
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, // Or a specific password reset page
        });
        if (error) throw error;
        setNotification({ type: 'success', message: 'Password reset link sent! Check your email.' });
        setMode('login');
      }
    } catch (error) {
      // FIXED: Using integrated notification instead of alert()
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const notificationStyles = {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    textAlign: 'center',
    border: '1px solid',
  };

  const successStyles = {
    ...notificationStyles,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(5, 150, 105, 0.3)',
    color: '#34D399',
  };

  const errorStyles = {
    ...notificationStyles,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
    color: '#F87171',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden', backgroundColor: '#020617', color: 'white', fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'); input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-text-fill-color: #fff !important; -webkit-box-shadow: 0 0 0px 1000px rgba(251, 191, 36, 0.1) inset !important; box-shadow: 0 0 0px 1000px rgba(251, 191, 36, 0.1) inset !important; transition: background-color 5000s ease-in-out 0s; }`}</style>
      <>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, width: '384px', height: '384px', backgroundColor: '#FBBF24', top: '-50px', left: '-100px' }}></div>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, width: '320px', height: '320px', backgroundColor: '#F59E0B', bottom: '-80px', right: '-120px' }}></div>
      </>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: '512px', borderRadius: '1rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(251, 191, 36, 0.3)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '2rem', zIndex: 10 }}>
        
        {/* NEW: Render Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={notification.type === 'success' ? successStyles : errorStyles}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* --- Login Form --- */}
            {mode === 'login' && (
              <div>
                <h1 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#FCD34D', marginBottom: '0.5rem' }}>IRIS</h1>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Applicant Portal</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lead@example.com" disabled={loading} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${errors.email ? '#EF4444' : 'rgba(251, 191, 36, 0.3)'}`, borderRadius: '0.5rem', color: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
                    {errors.email && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>{errors.email}</p>}
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type={isPasswordVisible ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${errors.password ? '#EF4444' : 'rgba(251, 191, 36, 0.3)'}`, borderRadius: '0.5rem', color: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
                      <div style={{ position: 'absolute', right: '0.5rem' }}>
                        <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} title={isPasswordVisible ? 'Hide Password' : 'Show Password'} style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#FCD34D' }}>
                          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                    {errors.password ? <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>{errors.password}</p> : <button type="button" onClick={() => setMode('forgot')} style={{ fontSize: '0.75rem', color: '#FCD34D', textDecoration: 'none', marginTop: '0.5rem', display: 'block', textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>}
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={loading} style={{ width: '100%', backgroundColor: '#FBBF24', color: '#1a202c', fontWeight: 'bold', padding: '0.75rem 0', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </motion.button>
                </form>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>Don't have an account? <button onClick={() => setMode('register')} style={{ color: '#FCD34D', fontWeight: '600', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Register for free</button></p>
              </div>
            )}
            
            {/* --- Register Form --- */}
            {mode === 'register' && (
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lead@example.com" disabled={loading} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${errors.email ? '#EF4444' : 'rgba(251, 191, 36, 0.3)'}`, borderRadius: '0.5rem', color: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
                    {errors.email && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>{errors.email}</p>}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${errors.password ? '#EF4444' : 'rgba(251, 191, 36, 0.3)'}`, borderRadius: '0.5rem', color: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
                    {errors.password && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>{errors.password}</p>}
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>Confirm Password</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={loading} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${errors.confirmPassword ? '#EF4444' : 'rgba(251, 191, 36, 0.3)'}`, borderRadius: '0.5rem', color: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
                    {errors.confirmPassword && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>{errors.confirmPassword}</p>}
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={loading} style={{ width: '100%', backgroundColor: '#FBBF24', color: '#1a202c', fontWeight: 'bold', padding: '0.75rem 0', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Registering...' : 'Register'}
                  </motion.button>
                </form>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>Already have an account? <button onClick={() => setMode('login')} style={{ color: '#FCD34D', fontWeight: '600', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign In</button></p>
              </div>
            )}

            {/* --- Forgot Password Form --- */}
            {mode === 'forgot' && (
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Forgot Password</h2>
                <p style={{ color: '#d1d5db', marginBottom: '1.5rem', textAlign: 'center' }}>Enter your email and we'll send you a reset link.</p>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#d1d5db' }}>Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${errors.email ? '#EF4444' : 'rgba(251, 191, 36, 0.3)'}`, borderRadius: '0.5rem', color: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
                    {errors.email && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>{errors.email}</p>}
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={loading} style={{ width: '100%', backgroundColor: '#FBBF24', color: '#1a202c', fontWeight: 'bold', padding: '0.75rem 0', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </motion.button>
                </form>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}><button onClick={() => setMode('login')} style={{ color: '#FCD34D', fontWeight: '600', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Back to Sign In</button></p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}