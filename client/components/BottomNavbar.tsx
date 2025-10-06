  // components/BottomNavbar.tsx
  'use client';

  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { Home, Compass, PlusSquare, Bell, User } from 'lucide-react';
  import { motion } from 'framer-motion';

  const BottomNavbar = () => {
    const pathname = usePathname();
    const profileHref = '/profile/yourusername';

    const navItems = [
      { href: '/home', icon: Home, label: 'Home' },
      { href: '/explore', icon: Compass, label: 'Explore' },
      { href: '/create', icon: PlusSquare, label: 'Create' },
      { href: '/notifications', icon: Bell, label: 'Notifications' },
      { href: profileHref, icon: User, label: 'Profile' },
    ];

    return (
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 25, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 w-full
                  bg-gray-900/80 border-t border-white/10 backdrop-blur-lg
                  shadow-2xl shadow-purple-900/20 h-20
                  flex justify-center items-center"
        style={{ zIndex: 9999 }} // Explicit high z-index
      >
        <div className="flex justify-around items-center w-full max-w-sm mx-auto px-4">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link href={item.href} key={item.label} legacyBehavior passHref>
                <motion.a
                  title={item.label}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors duration-200 w-14 h-14 relative cursor-pointer
                            ${isActive ? 'text-purple-400 bg-purple-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <item.icon size={20} />
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute -bottom-1 w-1 h-1 bg-purple-400 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.a>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    );
  };

  export default BottomNavbar;
