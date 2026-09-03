import { useState } from 'react'
import { Input, Button } from '@heroui/react'
import { useMatch } from '@typeroute/router'
import { cart, checkout, ai } from '../routes'

const footerLinks = {
  'Shop Hardware': [
    { label: 'Development Boards', href: '#' },
    { label: 'Battery Management', href: '#' },
    { label: 'FPGA Modules', href: '#' },
    { label: 'Power Electronics', href: '#' },
    { label: 'Debug Tools', href: '#' },
  ],
  Resources: [
    { label: 'Open Schematics', href: '#' },
    { label: 'Example Code (GitHub)', href: '#' },
    { label: 'Product Datasheets', href: '#' },
    { label: 'Video Tutorials', href: '#' },
    { label: 'API Documentation', href: '#' },
  ],
  Company: [
    { label: 'Our Story', href: '#' },
    { label: 'Engineering Support', href: '#' },
    { label: 'Bulk / B2B Orders', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Legal: [
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Warranty Information', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

const socialLinks = [
  {
    id: 'social-github',
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'social-youtube',
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'social-linkedin',
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'social-x',
    label: 'X (Twitter)',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

function NewsLetter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const match1 = useMatch({ from: cart })
  const match2 = useMatch({ from: checkout })

  return ( match1 || match2 ) ? null : (
    <>
      {/* Newsletter Section */}
      <div className="section-container">
        {<div className="py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="md:max-w-md">
            <h3 className="mb-4">
              Join the Engineering Inner Circle
            </h3>
            <p className="text-muted">
              Get updates on new board releases, open-source schematic drops,
              and deep-dive technical tutorials.
            </p>
          </div>

          <form
            id="newsletter-form"
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          >
            <Input
              variant="secondary"
              aria-label="Email"
              className="w-64"
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button size="lg" onPress={() => { }}>
              {subscribed ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Subscribed!
                </>
              ) : (
                <>
                  Subscribe
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </Button>
          </form>
        </div>}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />
    </>
  )
}

function Footer() {
  const matchAi = useMatch({ from: ai });
  if (matchAi) return null;

  return (
    <footer id="footer" className="bg-surface border-t border-border">
      <NewsLetter />
      {/* Link Grid */}
      <div className="section-container">
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4">
                {title}
              </h4>
              <nav aria-label={title}>
                <ul className="list-none p-0 m-0">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="block py-1.5 text-sm text-muted hover:text-foreground transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="section-container">
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
            {/* Copyright */}
            <p>&copy; 2026 Digicomp Technologies. All rights reserved.</p>

            {/* Made in India */}
            <p className="hidden md:block">Made with precision in India</p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  id={social.id}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted hover:text-foreground transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Made in India (mobile) */}
            <p className="block md:hidden">Made with precision in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
