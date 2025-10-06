'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, FilePlus, Files, CheckSquare, Bell, LogOut } from 'lucide-react';

// --- Component Imports ---
// Import actual page components
import HomePage from '../app/dashboard/HomePage';
import Notifications from '../app/dashboard/Notifications';


// --- Placeholder Components, HOCs, and Hooks ---
// A generic placeholder for sections that are not yet implemented.
const PlaceholderComponent = ({ title }: { title: string }) => (
    <div style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</h1>
        <p>Content for the {title} section.</p>
    </div>
);

// A placeholder for a Higher-Order Component that might handle authentication.
const withAuth = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
    // This is a pass-through function for demonstration.
    // In a real app, it would contain authentication logic.
    const WithAuthComponent: React.FC<P> = (props) => {
        return <Component {...props} />;
    };
    WithAuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
    return WithAuthComponent;
};


// A simplified hook for logout functionality.
const useLogout = () => {
    const router = useRouter();

    const logout = () => {
        console.log('Logging out...');
        // In a real app, you would make an API call to log out.
        // For now, it just simulates logging out and redirecting.
        router.push('/');
    };

    return { logout };
};


// --- Sidebar Navigation Items Definition ---
const sidebarNavItems = [
    { id: 'home', label: 'Home', icon: () => <Home size={20} /> },
    { id: 'registerComplaints', label: 'Register Complaint', icon: () => <FilePlus size={20} /> },
    { id: 'myComplaints', label: 'My Complaints', icon: () => <Files size={20} /> },
    { id: 'claimedComplaints', label: 'Claimed Complaints', icon: () => <CheckSquare size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: () => <Bell size={20} /> },
];


// --- Mobile Bottom Navigation (Structural) ---
const MobileBottomNav = ({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (section: string) => void; }) => {
    return (
        <nav style={{
            // This component is intended for mobile view.
            // In a real app, you'd use CSS media queries to show/hide it.
            // For this structural component, we'll make it a flex container.
            display: 'flex',
            position: 'fixed',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #ccc',
            background: '#f9f9f9',
        }}>
            {sidebarNavItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        textAlign: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <item.icon />
                    <span style={{ display: 'block', fontSize: '0.75rem' }}>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};


// --- Simplified Dashboard Component ---
const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('home');
    const router = useRouter();
    const { logout } = useLogout();

    // Mapping section IDs to their respective components
    const sectionComponents: { [key: string]: React.ComponentType } = {
        home: HomePage,
        registerComplaints: () => <PlaceholderComponent title="Register Complaint" />,
        myComplaints: () => <PlaceholderComponent title="My Complaints" />,
        claimedComplaints: () => <PlaceholderComponent title="Claimed Complaints" />,
        notifications: Notifications,
    };

    const ActiveComponent = sectionComponents[activeSection] || (() => <div>Select an option</div>);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* --- Sidebar (Structural) --- */}
            <aside style={{
                width: '250px',
                borderRight: '1px solid #ccc',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Logo/Brand */}
                <div style={{ marginBottom: '2rem' }}>
                    <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>TRACEIT</a>
                </div>

                {/* Navigation */}
                <nav>
                    {sidebarNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.75rem',
                                background: activeSection === item.id ? '#e0e0e0' : 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginBottom: '0.5rem',
                            }}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={logout} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* --- Main Content Area (Structural) --- */}
            <main style={{ flex: 1, padding: '1rem' }}>
                {/* Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ccc',
                    paddingBottom: '1rem',
                }}>
                    <h1>
                        {sidebarNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                    </h1>
                    {/* User Avatar and Dropdown placeholder */}
                    <div>
                        <span>User Menu</span>
                        {/* A real dropdown would go here */}
                    </div>
                </header>

                {/* Content Rendering Area */}
                <div style={{ paddingTop: '1rem' }}>
                    <ActiveComponent />
                </div>
            </main>

            {/* --- Mobile Bottom Navigation --- */}
            <MobileBottomNav
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
        </div>
    );
};

export default withAuth(Dashboard);
