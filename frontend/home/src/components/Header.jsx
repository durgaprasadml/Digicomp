import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import SearchBox from './SearchBox';
import { createPortal } from 'react-dom';

import Logo from "../assets/digicomp.svg?react";

const navLinks = [
  { id: 'products', label: 'Products', hasMega: true },
];

const megaColumns = [
  {
    title: 'Dev Boards',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
        <circle cx="9" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="15" r="1" fill="currentColor" />
        <line x1="4" y1="12" x2="2" y2="12" />
        <line x1="22" y1="12" x2="20" y2="12" />
        <line x1="12" y1="4" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="20" />
      </svg>
    ),
    links: [
      { label: 'ESP32-S3 Dev Board', href: '#esp32-s3' },
      { label: 'RP2040 Dev Board', href: '#rp2040' },
      { label: 'CH32V003 RISC-V', href: '#ch32v003' },
    ],
  },
  {
    title: 'FPGAs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="5" width="14" height="14" rx="1" />
        <rect x="8" y="8" width="8" height="8" rx="1" />
        <line x1="5" y1="9" x2="3" y2="9" />
        <line x1="5" y1="12" x2="3" y2="12" />
        <line x1="5" y1="15" x2="3" y2="15" />
        <line x1="19" y1="9" x2="21" y2="9" />
        <line x1="19" y1="12" x2="21" y2="12" />
        <line x1="19" y1="15" x2="21" y2="15" />
        <line x1="9" y1="5" x2="9" y2="3" />
        <line x1="12" y1="5" x2="12" y2="3" />
        <line x1="15" y1="5" x2="15" y2="3" />
        <line x1="9" y1="19" x2="9" y2="21" />
        <line x1="12" y1="19" x2="12" y2="21" />
        <line x1="15" y1="19" x2="15" y2="21" />
      </svg>
    ),
    links: [
      { label: 'Lattice FPGA Module', href: '#lattice-fpga' },
      { label: 'FPGA Starter Kit', href: '#fpga-starter' },
      { label: 'FPGA IO Board', href: '#fpga-io' },
    ],
  },
  {
    title: 'Power Electronics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    links: [
      { label: 'Buck Converter Module', href: '#buck-converter' },
      { label: 'Motor Driver Board', href: '#motor-driver' },
      { label: '16-Cell Active BMS', href: '#bms-16' },
      { label: '8-Cell Passive BMS', href: '#bms-8' },
    ],
  },
  {
    title: 'Others',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="7" width="12" height="10" rx="2" />
        <line x1="10" y1="7" x2="10" y2="4" />
        <line x1="14" y1="7" x2="14" y2="4" />
        <line x1="10" y1="11" x2="14" y2="11" />
        <line x1="12" y1="9" x2="12" y2="13" />
      </svg>
    ),
    links: [
      { label: 'About us', href: '#about' },
      { label: 'Contact us', href: '#contact' },
      { label: 'Documentation', href: '#documentation' },
      { label: 'Community & Learn', href: '#community' },
    ],
  },
];

/* ── Icon Components ── */

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ── Mega Menu Panel ── */
function MegaMenu() {
  return (
    <motion.div
      id="mega-menu"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute left-0 top-full w-full border-b border-[var(--border)] bg-[var(--surface)] shadow-2xl py-8"
    >
      <div className="section-container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {megaColumns.map((col) => (
          <div key={col.title}>
            <div className="mb-3 flex items-center gap-2 text-[var(--color-accent-start)]">
              {col.icon}
              <span className="text-sm font-semibold">{col.title}</span>
            </div>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--elevated)] hover:text-[var(--text)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Mobile Drawer ── */
function MobileDrawer({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  const { cart, cartRef } = useCart();

  const drawerContent = (
    <motion.div
      id="mobile-drawer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm clear-both"
      onClick={onClose}
    >
      <motion.aside
        id="mobile-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <span className="sr-only">Digicomp Technologies</span>
          <Logo className="h-7" />
          <button id="mobile-drawer-close" onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text)]">
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4">
          <SearchBox id="mobile-search-input" isMobile={true} />
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-5 py-2">
          {navLinks.map((link) => (
            <a
              key={link.id}
              id={`mobile-nav-${link.id}`}
              href={link.href || '#products'}
              className="block border-b border-[var(--border-subtle)] py-3.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
              onClick={onClose}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Utilities */}
        <div className="border-t border-[var(--border)] px-5 py-5">
          <div className="flex items-center justify-around">
            <button id="mobile-theme-toggle" onClick={toggleTheme} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--elevated)] hover:text-[var(--text)]">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <a id="mobile-login-link" href="#login" className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--elevated)] hover:text-[var(--text)]">
              <UserIcon />
            </a>
            <a id="mobile-wishlist-link" href="#wishlist" className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--elevated)] hover:text-[var(--text)]">
              <HeartIcon />
            </a>
            <a ref={ cartRef } id="mobile-cart-link" href={ cart.url } className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--elevated)] hover:text-[var(--text)]">
              <CartIcon />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] text-[10px] font-bold text-white">
                { cart.lineCount }
              </span>
            </a>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent;
}

/* ── Header ── */
export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { cart, cartRef } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const megaRef = useRef(null);

  /* Scroll detection */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close mega-menu on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    };
    if (megaOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [megaOpen]);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <header
      id="site-header"
      className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl bg-[var(--surface)]/80 border-b ${ scrolled ? 'border-[var(--border)]' : 'border-transparent' }`}
    >
      <div className="section-container flex h-16 items-center justify-between gap-4 border-none">
        {/* ── Left: Brand ── */}
        <a id="header-brand" href="#" className="flex-shrink-0" alt="Digicomp Technologies">
          <span className="sr-only">Digicomp Technologies</span>
          <Logo className="h-8" />
        </a>

        {/* ── Center: Navigation + Search (desktop) ── */}
        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          <nav className="flex items-center gap-1" ref={megaRef}>
            {navLinks.map((link) =>
              link.hasMega ? (
                <button
                  key={link.id}
                  id={`nav-${link.id}`}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                  onClick={() => setMegaOpen((prev) => !prev)}
                  onMouseEnter={() => setMegaOpen(true)}
                >
                  {link.label}
                  <ChevronDown />
                </button>
              ) : (
                <a
                  key={link.id}
                  id={`nav-${link.id}`}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Search */}
          <SearchBox id="header-search-input" />
        </div>

        {/* ── Right: Utilities (desktop) ── */}
        <div className="hidden items-center gap-1 lg:flex">
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--elevated)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            id="login-link"
            href="#login"
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--elevated)] hover:text-[var(--text)]"
            aria-label="Account"
          >
            <UserIcon />
          </a>

          <a
            id="wishlist-link"
            href="#wishlist"
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--elevated)] hover:text-[var(--text)]"
            aria-label="Wishlist"
          >
            <HeartIcon />
          </a>

          <a
            id="cart-link"
            href={ cart.url }
            className="relative rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--elevated)] hover:text-[var(--text)]"
            aria-label="Cart"
            ref={ cartRef }
          >
            <CartIcon />
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] text-[10px] font-bold leading-none text-white">
              { cart.lineCount }
            </span>
          </a>
        </div>

        {/* ── Hamburger (mobile) ── */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text)] lg:hidden"
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* ── Mega Menu (desktop) ── */}
      <AnimatePresence>
        {megaOpen && (
          <div ref={megaRef} onMouseLeave={() => setMegaOpen(false)}>
            <MegaMenu />
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && <MobileDrawer onClose={() => setDrawerOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
