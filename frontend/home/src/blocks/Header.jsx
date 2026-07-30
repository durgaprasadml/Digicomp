import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from '@typeroute/router';
import { Button, Badge, Modal } from '@heroui/react';

import { home, cart as cartRoute, checkout, wishlist, wishlistView, shop, account, accountTab } from '../routes';
import { ThemeStore } from '../stores/ThemeStore';
import { CartStore } from '../stores/CartStore';
import { PageStore } from '../stores/PageStore';
import { WishlistStore } from '../stores/WishlistStore';
import { UserStore } from '../stores/UserStore';
import { logout } from '../utils/api';

const preloadAuthModal = () => import('./AuthModalContent');
const AuthModalContent = lazy(preloadAuthModal);

import { Logo, LogoDefs, Drawer, CustomButton } from '../components'
import SearchBox, { SearchIcon } from './SearchBox';

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

function MegaMenu() {
  return (
    <div className="popover w-full left-0">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {megaColumns.map((col) => (
          <div key={col.title}>
            <div className="mb-3 flex items-center gap-2 text-accent">
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
    </div>
  )
}

function UserMenu() {
  const { user } = UserStore.use()
  const navigate = useNavigate()

  const [isOpenLogin, setIsOpenLogin] = useState(false);
  const [isOpenSignup, setIsOpenSignup] = useState(false);

  const handleLogout = async () => {
    await logout()
    await UserStore.refreshData()
    navigate( { to: home } )
  }

  if ( user?.is_logged_in ) {
    return (
      <div className="popover shadow-2xl w-56 right-0 p-4">
        <h4 className="mb-3 font-semibold text-[var(--text)]">My Account</h4>
        <ul className="flex flex-col text-sm gap-1">
          <li><Link to={account} preload="intent" className="block py-1">Dashboard</Link></li>
          <li><Link to={accountTab} params={{ tab: 'orders' }} preload="intent" className="block py-1">My Orders</Link></li>
          <li><Link to={accountTab} params={{ tab: 'edit-account' }} preload="intent" className="block py-1">Settings</Link></li>
          <li><hr className="my-2 border-[var(--border)]" /></li>
          <li><button onClick={ handleLogout } className="cursor-pointer hover:text-accent transition-colors py-1 w-full text-left">Logout</button></li>
        </ul>
      </div>
    )
  }

  return (
    <div className="popover shadow-2xl w-56 right-0 p-4">
      <h4 className="mb-3 font-semibold text-[var(--text)]">Welcome</h4>
      <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
        <li>
          <Modal isOpen={isOpenLogin} onOpenChange={setIsOpenLogin}>
            <Button variant='ghost' className='w-full justify-start' onPress={() => setIsOpenLogin(true)} onMouseEnter={preloadAuthModal} onFocus={preloadAuthModal}>Login</Button>
            {isOpenLogin && (
              <Suspense fallback={null}>
                <AuthModalContent defaultTab="login" />
              </Suspense>
            )}
          </Modal>
        </li>
        <li>
          <Modal isOpen={isOpenSignup} onOpenChange={setIsOpenSignup}>
            <Button variant='ghost' className='w-full justify-start' onPress={() => setIsOpenSignup(true)} onMouseEnter={preloadAuthModal} onFocus={preloadAuthModal}>Register</Button>
            {isOpenSignup && (
              <Suspense fallback={null}>
                <AuthModalContent defaultTab="signup" />
              </Suspense>
            )}
          </Modal>
        </li>
      </ul>
    </div>
  )
}

function WishlistMenu() {
  const { wishlists = [] } = WishlistStore.use() || {};

  return (
    <div className="popover shadow-2xl w-64 right-0 p-4">
      <h4 className="mb-2 font-semibold text-[var(--text)]">Wishlist</h4>
      {wishlists.length === 0 ? (
        <>
          <p className="text-sm text-[var(--text-secondary)]">Your wishlist is currently empty.</p>
          <CustomButton size="lg" className="mt-4 w-full">
            <Link to={ shop } preload="intent">Explore Products</Link>
          </CustomButton>
        </>
      ) : (
        <>
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
            { wishlists.map( wl => (
              <li key={ wl.id } className="flex justify-between items-center text-sm py-1">
                <Link to={ wishlistView } params={{ id: wl.id }} preload="intent" className="truncate pr-2">
                  { wl.name }
                </Link>
                <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap bg-default-100 px-2 py-0.5 rounded-full">
                  {Array.isArray(wl.items) ? wl.items.length : 0} items
                </span>
              </li>
            ) ) }
          </ul>
          <CustomButton size="md" className="w-full mt-2" variant="secondary">
            <Link to={ wishlist } preload="intent">View All Lists</Link>
          </CustomButton>
        </>
      )}
    </div>
  )
}

function CartMenu( { cart } ) {
  const { currency } = PageStore.use();

  return (
    <div className="popover w-80 right-0 p-5">
      <h4 className="mb-3 font-semibold border-b border-border pb-2">Shopping Cart</h4>
      {cart.lineCount === 0 ? (
        <p className="text-sm py-4">Your cart is currently empty.</p>
      ) : (
        <>
          <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1 my-3 scrollbar-thin">
            {cart.items.map((item, index) => (
              <div key={item.id || index} className="flex gap-3 items-center">
                {item.image ? (
                  <img src={item.image} alt={item.name || 'Product'} className="h-12 w-12 rounded object-cover border border-border bg-surface" />
                ) : (
                  <div className="h-12 w-12 rounded flex justify-center items-center text-muted text-xs">IMG</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={item.name || `Product #${item.id}`}>
                    {item.name || `Product #${item.id}`}
                  </p>
                  <p className="text-xs mt-0.5">
                    {item.qty} × {item.price ? `${currency}${item.price}` : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-4 mt-2">
            <CustomButton variant='secondary' className="w-full">
              <Link to={ cartRoute } preload="intent">View Cart</Link>
            </CustomButton>
            <CustomButton className="w-full">
              <Link to={ checkout } preload="intent">Checkout</Link>
            </CustomButton>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Header ── */
export default function Header() {
  const { theme } = ThemeStore.use()
  const toggleTheme = () => ThemeStore.toggleTheme()
  const [scrolled, setScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const lastScrollY = useRef(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cart } = CartStore.use()
  const { wishlists } = WishlistStore.use()

  const wishlistItemsCount = wishlists?.reduce((total, list) => total + (list.items?.length || 0), 0) || 0;

  const cartRef = useRef(null);
  const wishlistRef = useRef(null);

  useEffect(() => {
    CartStore.setRef( cartRef )
    WishlistStore.setRef( wishlistRef )
    return () => {
      CartStore.setRef( null )
      WishlistStore.setRef( null )
    }
  }, []);

  /* Scroll detection */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);
      if (currentScrollY > lastScrollY.current + 10) {
        setShowTopBar(false);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 50) {
        setShowTopBar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <LogoDefs />
      {/* ── Mobile Top Header ── */}
      <div className={`sticky top-0 z-40 w-full lg:hidden transition-all bg-surface border-b border-[var(--border)] ${ showTopBar ? 'translate-y-0' : '-translate-y-full' }`}>
        <div className="section-container flex h-14 items-center justify-between">
          <Link to={ home } preload="intent" aria-label="Digicomp Technologies">
            <span className="sr-only">Digicomp Technologies</span>
            <Logo className="h-6 w-auto" />
          </Link>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2"
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>

    <header
      id="site-header"
      className={`fixed bottom-0 lg:sticky lg:bottom-auto lg:top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl bg-[var(--surface)]/80 border-t lg:border-t-0 lg:border-b border-[var(--border)] ${ scrolled ? 'shadow-sm' : '' }`}
    >
      <div className="section-container relative flex h-16 items-center justify-between gap-4 border-none">
        {/* ── Left: Brand ── */}
        <Link
          id="header-brand"
          to={ home }
          preload="intent"
          className="hidden lg:flex flex-shrink-0"
          alt="Digicomp Technologies"
        >
          <span className="sr-only">Digicomp Technologies</span>
          <Logo className="h-8 w-auto" />
        </Link>

        {/* ── Center: Navigation + Search (desktop) ── */}
        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasMega ? (
                <div key={link.id} className="popover-wrap h-16">
                  <Button variant='outline'>
                    {link.label}
                    <ChevronDown />
                  </Button>
                  <MegaMenu />
                </div>
              ) : (
                <a
                  key={link.id}
                  id={`nav-${link.id}`}
                  href={link.href}
                  className="popover"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Search */}
          <SearchBox id="header-search-input" />
        </div>

        {/* ── Right: Utilities (desktop) & Bottom Nav (mobile) ── */}
        <div className="flex w-full justify-around lg:w-auto lg:justify-end items-center gap-1 text-[var(--text-secondary)]">
          <div className="icon-nav flex">
            <CustomButton isIconOnly variant='ghost'>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="icon-btn"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </CustomButton>
          </div>

          <div className="popover-wrap icon-nav">
            <CustomButton isIconOnly variant='ghost'>
              <Link to={ account } preload="intent" className="icon-btn" aria-label="Account" ref={ wishlistRef }><UserIcon /></Link>
            </CustomButton>
            <UserMenu />
          </div>

          <div className="icon-nav flex lg:hidden">
            <CustomButton isIconOnly variant='ghost'>
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Search"
                className="icon-btn"
              >
                <SearchIcon />
              </button>
            </CustomButton>
          </div>

          <div className="popover-wrap icon-nav">
            <Badge.Anchor>
              <CustomButton isIconOnly variant='ghost'>
                <Link to={ wishlist } preload="intent" className="icon-btn" aria-label="Wishlist" ref={ wishlistRef }><HeartIcon /></Link>
              </CustomButton>
              {wishlistItemsCount > 0 && (
                <Badge size="sm" className="bg-gradient-to-r from-accent to-(--color-accent-hover) text-white border-none shadow-sm" placement="top-right">
                  {wishlistItemsCount}
                </Badge>
              )}
            </Badge.Anchor>
            <WishlistMenu />
          </div>

          <div className="popover-wrap icon-nav">
            <Badge.Anchor>
              <CustomButton isIconOnly variant='ghost'>
                <Link to={ cartRoute } preload="intent" className="icon-btn" aria-label="Cart" ref={ cartRef }><CartIcon /></Link>
              </CustomButton>
              {cart.lineCount > 0 && (
                <Badge size="sm" className="bg-gradient-to-r from-accent to-(--color-accent-hover) text-white border-none shadow-sm" placement="top-right">
                  {cart.lineCount}
                </Badge>
              )}
            </Badge.Anchor>
            <CartMenu cart={ cart } />
          </div>
        </div>

      </div>

      {/* ── Mobile Drawer ── */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        position="right"
        swipeToOpen={true}
        className="w-96"
      >
        {/* Close */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <span className="sr-only">Digicomp Technologies</span>
          <Logo className="h-7" />
          <button id="mobile-drawer-close" onClick={() => setDrawerOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text)]">
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
              onClick={() => setDrawerOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Drawer>
    </header>
    </>
  );
}
