import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; 

// Import the new split modules
import AdminLayout from '../components/admin/AdminLayout';
import AdminSummary from '../components/admin/AdminSummary';
import AdminSortingPage from '../components/admin/AdminSortingPage';
import AdminInterviewManagement from '../components/admin/AdminInterviewManagement';
import AdminProfile from '../components/admin/AdminProfile';
import JobPosting from './JobPosting'; // Import your existing JobPosting component

export default function AdminDashboard({ onNavigate }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminSummary onNavigate={onNavigate} setIsModalOpen={setIsModalOpen} />;
            case 'jobs': 
                return <AdminSortingPage />;
            case 'messages': 
                return <AdminInterviewManagement />;
            case 'job-management': 
                return <JobPosting />;
            case 'settings': 
                return <AdminProfile onNavigate={onNavigate} />;
            default: 
                return null;
        }
    };

    const contentVariants = { 
        hidden: { opacity: 0, y: 10 }, 
        visible: { opacity: 1, y: 0 }, 
        exit: { opacity: 0, y: -10 } 
    };

    return (
        // ✅ Added onNavigate here so the Sidebar Logout button works
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={onNavigate}>
            <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
            >
                {renderContent()}
            </motion.div>
        </AdminLayout>
    );
}