import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookOpen, Home, Library, Menu, X, Sun, Moon } from 'lucide-react';
import { onAuthStateChange, logout } from '../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/search', label: 'Search', icon: Search },
  ];

  useEffect(() => {
    const unsub = onAuthStateChange(setUser);
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (e) {
      // noop
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-dark-200 dark:bg-dark-800 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-dark-900">MangaReader</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-dark-600 hover:text-primary-600 hover:bg-dark-50'
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-dark-600 hover:text-primary-600 hover:bg-dark-50 dark:text-dark-300 dark:hover:bg-dark-700"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth area */}
            {user ? (
              <>
                <span className="text-sm text-dark-700">Hi, {user.displayName || user.email}</span>
                <button onClick={handleLogout} className="px-3 py-2 text-sm rounded-lg bg-dark-900 text-white hover:bg-dark-800 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="px-3 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-dark-600 hover:text-primary-600 hover:bg-dark-50 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-dark-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-dark-600 hover:text-primary-600 hover:bg-dark-50'
                    }`}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-dark-200">
                <button
                  onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-dark-50"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
                </button>
                {user ? (
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-dark-900 text-white hover:bg-dark-800">
                    Logout
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
