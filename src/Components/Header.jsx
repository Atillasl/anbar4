import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import { UserActions } from './UserActions';

const Header = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="bg-white/90 dark:bg-[#05070A]/90 backdrop-blur-md border-b-2 border-yellow-500/10 dark:border-yellow-500/20 sticky top-0 z-50 h-20 md:h-24 flex items-center transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full flex items-center justify-between">
        
        {/* SOL: Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>
        
        {/* MƏRKƏZ: Naviqasiya (Yalnız Desktop) */}
        <div className="hidden lg:block flex-1 max-w-fit px-8">
          <Navigation />
        </div>
        
        {/* SAĞ: İstifadəçi İdarəetmə Paneli */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
          {/* Alətlər qrupu */}
          <div className="flex items-center gap-2 md:gap-4 border-r border-slate-200 dark:border-yellow-500/10 pr-2 sm:pr-4 md:pr-8">
            <div className="hover:scale-110 transition-transform">
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
            
          </div>
          
          {/* Profil və Çıxış */}
          <div className="hover:translate-x-1 transition-transform hidden sm:block">
            <UserActions onLogout={onLogout} />
          </div>

          {/* Mobil Menyu Düyməsi */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobil Menyu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;