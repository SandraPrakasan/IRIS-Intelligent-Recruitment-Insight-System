import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ✅ Go up 2 levels to reach src/supabaseClient
import { supabase } from "../../supabaseClient"; 

// ✅ Go up 1 level to reach components folder
import StatCard from "../StatCard";
import ApplicationTrendsChart from "../ApplicationTrendsChart";
import ExperienceChart from "../ExperienceChart";

// ✅ CORRECT
import UpcomingInterviews from "../Adminfront/UpcomingInterviews";
import RecentApplications from "../Adminfront/RecentApplications";
import TopPerformers from "../Adminfront/TopPerformers";

// Icons
const UsersIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> );
const SettingsIcon = () => ( <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> );

// 1. ACCEPT PROPS HERE (onNavigate)
export default function AdminSummary({ onNavigate }) {
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    // State for dashboard data
    const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
    const [trendData, setTrendData] = useState([]);
    const [avgExperience, setAvgExperience] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // ✅ ADDED: State for user name
    const [userName, setUserName] = useState('Admin'); 

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // ✅ 1. Fetch User Name
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: roleData, error } = await supabase
                    .from('user_roles')
                    .select('name')
                    .eq('user_id', user.id)
                    .single();

                if (roleData && roleData.name) {
                    setUserName(roleData.name);
                }
            }

            // 2. Fetch Dashboard Stats
            const { data: applicants, error } = await supabase
                .from('applications')
                .select('id, status, created_at, experience');

            if (error) throw error;

            if (applicants) {
                // -- Calculate Stats --
                const total = applicants.length;
                const pending = applicants.filter(a => a.status === 'Pending' || a.status === 'Screening' || a.status === 'Interviewing').length;
                const accepted = applicants.filter(a => a.status === 'Hired' || a.status === 'Offered' || a.status === 'Accepted').length;
                const rejected = applicants.filter(a => a.status === 'Rejected').length;

                setStats({ total, pending, accepted, rejected });

                // -- Calculate Trends (Last 30 Days) --
                const last30Days = Array.from({ length: 30 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i));
                    return d.toISOString().split('T')[0];
                });

                const trends = last30Days.map(dateStr => {
                    const count = applicants.filter(a => a.created_at && a.created_at.startsWith(dateStr)).length;
                    return { name: dateStr.split('-')[2], value: count };
                });
                setTrendData(trends);

                // -- Calculate Average Experience --
                const totalExp = applicants.reduce((acc, curr) => {
                    const expVal = parseFloat(curr.experience) || 0; 
                    return acc + expVal;
                }, 0);
                const avg = total > 0 ? totalExp / total : 0;
                setAvgExperience(avg);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ color: 'white', padding: '2rem' }}>Loading Dashboard...</div>;
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.header variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Welcome, {userName}!</h1>
            </motion.header>
            
            {/* Stat Cards */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<UsersIcon />} value={stats.total} label="Total applicants" tint="239, 68, 68" />
                <StatCard icon={<UsersIcon />} value={stats.pending} label="Pending review" tint="239, 68, 68" />
                <StatCard icon={<UsersIcon />} value={stats.accepted} label="Accepted applications" tint="34, 197, 94" />
                <StatCard icon={<UsersIcon />} value={stats.rejected} label="Rejected applications" tint="100, 116, 139" />
            </motion.div>

            {/* Main Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                
                {/* --- LEFT COLUMN --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 1. Trends Chart */}
                <motion.div
                variants={itemVariants}
                    style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    height: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden' // 🔑 IMPORTANT
                }}
                >
            <h2
                    style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    flexShrink: 0
                }}
                >
                    Application Trends
            </h2>

            {/* Chart container */}
            <div
                    style={{
                    flex: 1,
                    overflow: 'hidden',     // 🔑 ALSO IMPORTANT
                    position: 'relative'
                }}
            >
                <ApplicationTrendsChart data={trendData} />
                </div>
                </motion.div>


                    {/* 2. Top Performers (REVERTED) */}
                <motion.div variants={itemVariants}>
                     {/* Remove the prop here: */}
                    <TopPerformers /> 
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 1. Experience Chart */}
                    <motion.div variants={itemVariants} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', flexShrink: 0 }}>Avg. Experience</h2>
                        <div style={{flexGrow: 1}}>
                            <ExperienceChart avgExperience={avgExperience} />
                        </div>
                    </motion.div>

                    {/* 2. Upcoming Interviews */}
                    <motion.div variants={itemVariants}>
                        <UpcomingInterviews />
                    </motion.div>

                    {/* 3. Recent Applications (Added to bottom right) */}
                    <motion.div variants={itemVariants}>
                        <RecentApplications />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}