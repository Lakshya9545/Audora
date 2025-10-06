"use client";
import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react'; // Added social icons
import { motion } from 'framer-motion'; // Import motion

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { Icon: Github, href: '#', label: 'GitHub' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-darkGray text-creamyTan/70 py-10 px-4 sm:px-6 lg:px-8 border-t border-mutedGold/20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="text-mutedGold h-6 w-6" />
            <span className="text-xl font-semibold text-brightWhite">Audora</span>
          </div>
          <p className="text-sm text-center md:text-left">
            &copy; {currentYear} Audora. All rights reserved.
          </p>
          <p className="text-xs mt-1 text-creamyTan/50 text-center md:text-left">
            Sound Off. Be Heard.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex justify-center space-x-6 text-sm font-medium">
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/about" className="hover:text-mutedGold transition-colors">About</Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/privacy" className="hover:text-mutedGold transition-colors">Privacy</Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/terms" className="hover:text-mutedGold transition-colors">Terms</Link>
          </motion.div>
        </nav>

        {/* Social Links */}
        <div className="flex justify-center md:justify-end space-x-5">
          {socialLinks.map(({ Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-creamyTan/70 hover:text-mutedGold transition-colors"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="h-5 w-5" />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;