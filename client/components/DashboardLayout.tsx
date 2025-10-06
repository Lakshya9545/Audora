'use client';

import React, { useState, useEffect, useRef, FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, PlusSquare, Bell, User, LogOut, Menu, Settings as SettingsIcon } from 'lucide-react';
import AuthenticatedHomePage from '@/app/dashboard/HomePage';
import ExplorePage from '@/app/dashboard/ExplorePage';
import CreatePost from '@/app/dashboard/CreatePost';
import Notifications from '@/app/dashboard/Notifications';
import MyProfile from '@/app/dashboard/MyProfile';
// import Settings from '@/app/dashboard/Settings';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// In a real app, these would be in their own files (e.g., components/ui/Button.tsx)
// I'm including them here to make this component self-contained and prevent errors.
const Button: FC<{ onClick?: () => void; className?: string; children: ReactNode }> = ({ onClick, className, children }) => (
    <button onClick={onClick} className={`transition-all duration-200 ease-in-out ${className}`}>
        {children}
    </button>
);
const Avatar: FC<{ onClick?: () => void; className?: string; children: ReactNode }> = ({ onClick, className, children }) => (
    <div onClick={onClick} className={`relative rounded-full flex items-center justify-center ${className}`}>
        {children}
    </div>
);
const AvatarImage: FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => (
    <img src={src} alt={alt} className={`rounded-full object-cover w-full h-full ${className}`} onError={(e) => (e.currentTarget.style.display = 'none')} />
);
const AvatarFallback: FC<{ className?: string; children: ReactNode }> = ({ className, children }) => (
    <div className={`absolute inset-0 flex items-center justify-center rounded-full text-white ${className}`}>
        {children}
    </div>
);

// Main Dashboard Component
type AudioAppSection = 'homeFeed' | 'explore' | 'createPost' | 'notifications' | 'myProfile' ;

const navItems = [
    { id: 'homeFeed', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'createPost', label: 'Create', icon: PlusSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'myProfile', label: 'Profile', icon: User },
];

const sectionTitleMap: Record<AudioAppSection, string> = {
    homeFeed: 'Home Feed',
    explore: 'Explore Audio',
    createPost: 'Create New Post',
    notifications: 'Notifications',
    myProfile: 'My Profile'
};

const DashboardLayout = () => {
    const [activeSection, setActiveSection] = useState<AudioAppSection>('homeFeed');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [user, setUser] = useState<{ name: string; avatarUrl: string; email: string } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (!apiUrl) {
                console.error("Client-side API_URL is not configured.");
                setAuthLoading(false);
                // Potentially show an error message to the user
                return;
            }
            try {
                // This endpoint should be protected and return user info if the cookie is valid
                const response = await axios.get(`${apiUrl}/api/auth/check`, { withCredentials: true });
                if (response.data.authenticated && response.data.user) {
                    const userData = response.data.user;
                    setUser({
                        name: userData.username,
                        email: userData.email,
                        avatarUrl: userData.avatarUrl || '/default-avatar.png',
                    });
                } else {
                    // If not authenticated, redirect to login
                    router.push('/login');
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                // Redirect to login on any error (e.g., 401 Unauthorized)
                router.push('/login');
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuthStatus();
    }, [router, apiUrl]);

    // Listen for global requests to open settings (e.g., from profile page)



    const logout = async () => {
        if (!apiUrl) {
            console.error("API_URL not configured, cannot log out.");
            return;
        }
        try {
            await axios.post(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true });
            setUser(null); // Clear user state
            router.push('/login'); // Redirect to login page
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally, show a user-friendly error message
            alert("Logout failed. Please try again.");
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showUserDropdown &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !avatarRef.current?.contains(event.target as Node)
            ) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserDropdown]);

    const renderSection = () => {
        switch (activeSection) {
            case 'homeFeed': return <AuthenticatedHomePage />;
            case 'explore': return <ExplorePage />;
            case 'createPost': return <CreatePost />;
            case 'notifications': return <Notifications />;
            case 'myProfile': return <MyProfile />;
            default: return <AuthenticatedHomePage />;
        }
    };

    const handleNavClick = (section: AudioAppSection) => {
        setActiveSection(section);
        if (isMobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#111827] text-gray-300">
            <div className="px-4 py-6 text-center">
                <a href="#" className="text-3xl font-bold text-white hover:text-[#D4AF37] transition-colors duration-300">
                    AUDORA
                </a>
            </div>
            <nav className="flex-grow space-y-2 px-4">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        className={`w-full flex items-center justify-start text-md font-medium rounded-lg p-3 ${
                            activeSection === item.id
                                ? 'bg-[#6A1B9A] text-white shadow-lg'
                                : 'hover:bg-gray-700 hover:text-white'
                        }`}
                        onClick={() => handleNavClick(item.id as AudioAppSection)}
                    >
                        <item.icon className={`mr-4 h-5 w-5 ${activeSection === item.id ? 'text-white' : 'text-[#D4AF37]'}`} />
                        {item.label}
                    </Button>
                ))}
            </nav>
            <div className="p-4 mt-auto border-t border-gray-700">
                <Button className="w-full flex items-center justify-start text-md font-medium rounded-lg p-3 hover:bg-red-800/50 hover:text-white" onClick={logout}>
                    <LogOut className="mr-4 h-5 w-5" /> Logout
                </Button>
            </div>
        </div>
    );

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-[#111827]">
                <div className="text-center">
                    <p className="text-3xl font-bold text-white">AUDORA</p>
                    <p className="text-gray-400 mt-2">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // This should not be visible for long as the effect will redirect.
        // It's a fallback.
        return null;
    }

    return (
        <div className="flex bg-gray-100 font-sans h-screen overflow-hidden">
            {/* --- Desktop Sidebar (Fixed) --- */}
            <aside className="hidden md:flex md:w-64 md:flex-shrink-0">
                <div className="flex flex-col w-64 h-full">
                    <SidebarContent />
                </div>
            </aside>

            {/* --- Mobile Sidebar (Off-canvas) --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-50 flex md:hidden"
                    >
                        <div className="w-64 bg-[#111827] text-white shadow-2xl">
                            <SidebarContent />
                        </div>
                        <div className="flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
                            <div className="h-full w-screen bg-black/30 backdrop-blur-sm" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Main Content Area (Scrollable) --- */}
            <div className="flex flex-col flex-1 min-w-0 h-screen">
                {/* Header */}
                <header className="flex items-center justify-between bg-white/80 backdrop-blur-lg p-4 sticky top-0 z-30 border-b border-gray-200 h-20 flex-shrink-0">
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900">
                        <Menu className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 hidden md:block">{sectionTitleMap[activeSection]}</h1>
                    <div className="flex-1 flex justify-center md:hidden">
                         <a href="#" className="text-2xl font-bold text-[#6A1B9A]">AUDORA</a>
                    </div>
                    <div className="relative">
                        <div ref={avatarRef}>
                            <Avatar onClick={() => setShowUserDropdown(!showUserDropdown)} className="cursor-pointer h-12 w-12 border-2 border-[#D4AF37]/80 hover:border-[#D4AF37] hover:scale-105 transition-transform">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="bg-[#6A1B9A] text-xl font-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <AnimatePresence>
                            {showUserDropdown && (
                                <motion.div
                                    ref={dropdownRef}
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute right-0 mt-2 w-64 bg-white text-gray-800 shadow-xl rounded-lg z-40 border border-gray-200/80 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="font-semibold text-md text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-2">
                                        <Button className="w-full text-left px-4 py-2 flex items-center text-gray-700 hover:bg-gray-100 hover:text-[#6A1B9A]" onClick={() => { handleNavClick('myProfile'); setShowUserDropdown(false); }}>
                                            <User className="mr-3 h-5 w-5 text-[#D4AF37]" /> My Profile
                                        </Button>
                                        <Button className="w-full text-left px-4 py-2 flex items-center text-gray-700 hover:bg-gray-100 hover:text-[#6A1B9A]" onClick={() => { handleNavClick('notifications'); setShowUserDropdown(false); }}>
                                            <Bell className="mr-3 h-5 w-5 text-[#D4AF37]" /> Notifications
                                        </Button>
                                    </div>
                                    <div className="py-2 border-t border-gray-200">
                                       <Button className="w-full text-left px-4 py-2 flex items-center text-red-600 hover:bg-red-50" onClick={() => { logout(); setShowUserDropdown(false); }}>
                                            <LogOut className="mr-3 h-5 w-5" /> Logout
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 p-6 md:p-8 bg-[#F8F7FA] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                            {renderSection()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;