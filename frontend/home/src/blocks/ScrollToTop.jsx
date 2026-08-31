import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button onClick={ scrollToTop } size="lg" isIconOnly className={`fixed bottom-24 lg:bottom-8 right-8 z-40 cursor-pointer shadow-lg bg-gradient-to-r from-accent to-(--color-accent-hover) transition-all opacity-0 scale-0 hover:scale-110 ${ visible ? 'opacity-100 scale-100' : '' }`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
    </Button> )
}

export default ScrollToTop;
