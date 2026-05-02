import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  Cog6ToothIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/configuration', label: 'Configuration', icon: Cog6ToothIcon },
  { to: '/favourites', label: 'Favourites', icon: HeartIcon },
  { to: '/export', label: 'Export', icon: ArrowDownTrayIcon },
];

const BuyMeACoffeeLink = (
  <a
    href="https://buymeacoffee.com/dishfromthis"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 inline-flex items-center gap-2 text-sm text-sidebar-text transition-colors hover:text-accent"
  >
    <span className="flex-shrink-0 text-base leading-none" aria-hidden="true">🍺</span>
    Buy me a pint
  </a>
);

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const {
    isAuthenticated,
    isAuthEnabled,
    login,
    continueAsGuest,
    logout,
  } = useAuth();

  const themeLabel = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  const authButtonClasses = [
    'inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ].join(' ');

  const closeMobileNav = () => setMobileNavOpen(false);

  const handleGoogleLogin = () => {
    login('Google');
    closeMobileNav();
  };

  const handleAppleLogin = () => {
    login('SignInWithApple');
    closeMobileNav();
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    closeMobileNav();
  };

  const handleLogout = () => {
    logout();
    closeMobileNav();
  };

  const renderAuthControls = () => (
    <section className="mt-4 rounded-[28px] border border-white/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5" aria-label="Authentication">
      <div className="mb-3 flex items-center gap-2 text-sm text-sidebar-text">
        <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
        <p className="font-bold text-text-primary">
          {isAuthenticated ? 'Signed in' : 'Guest mode'}
        </p>
      </div>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={handleLogout}
          className={`${authButtonClasses} border-white/70 bg-white/70 text-header-text hover:bg-white/85 dark:border-white/10 dark:bg-white/10 dark:text-text-primary dark:hover:bg-white/15`}
          aria-label="Log out of your account"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
          Log out
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`${authButtonClasses} gradient-green-cta border-transparent text-white`}
            aria-label="Log in with Google"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            Login with Google
          </button>
          <button
            type="button"
            onClick={handleAppleLogin}
            disabled={!isAuthEnabled}
            className={`${authButtonClasses} border-white/70 bg-white/70 text-header-text hover:bg-white/85 dark:border-white/10 dark:bg-white/10 dark:text-text-primary dark:hover:bg-white/15`}
            aria-label="Log in with Apple"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            Login with Apple
          </button>
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className={`${authButtonClasses} border-white/70 bg-white/45 text-sidebar-text hover:bg-white/65 hover:text-header-text dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10`}
            aria-label="Continue as guest"
          >
            Continue as Guest
          </button>
          {!isAuthEnabled ? (
            <p className="text-xs leading-5 text-sidebar-text">
              Social login is currently unavailable.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );

  const renderNavItems = (mobile = false) => (
    <ul className="space-y-2" role="list">
      {navItems.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === '/'}
            onClick={mobile ? () => setMobileNavOpen(false) : undefined}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-bold uppercase tracking-[0.1em] transition-all duration-200',
                isActive
                  ? 'border-white/80 bg-white/70 text-accent shadow-[0_16px_34px_rgba(22,163,74,0.16)] dark:border-white/15 dark:bg-[rgba(74,222,128,0.15)] dark:text-accent'
                  : 'border-transparent text-sidebar-text hover:border-white/60 hover:bg-white/55 hover:text-header-text dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-colors',
                    isActive
                      ? 'gradient-green-badge text-white'
                      : 'bg-white/60 text-sidebar-text dark:bg-white/5 dark:text-sidebar-text',
                  ].join(' ')}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div
        className="mesh-blob -right-24 -top-24 h-[600px] w-[600px] bg-[#bbf7d0] opacity-60 blur-[120px] dark:bg-[#052e16] dark:opacity-40"
        aria-hidden="true"
      />
      <div
        className="mesh-blob -bottom-20 -left-16 h-[500px] w-[500px] bg-[#fef08a] opacity-50 blur-[100px] dark:bg-[#1c1900] dark:opacity-30"
        aria-hidden="true"
      />
      <div
        className="mesh-blob left-[18%] top-[35%] h-[300px] w-[300px] bg-[#86efac] opacity-40 blur-[90px] dark:bg-[#052e16] dark:opacity-30"
        aria-hidden="true"
      />

      <header className="glass-card fixed inset-x-0 top-0 z-50 h-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="gradient-green-badge flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_12px_30px_rgba(22,163,74,0.3)]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V7H5v3a1 1 0 0 1-2 0V3a1 1 0 1 1 2 0v2h1V3a1 1 0 0 1 1-1Zm7.5 0c.61 0 1.13.43 1.26 1.02l1.98 9A2.5 2.5 0 0 1 15.3 15H15v6a1 1 0 1 1-2 0v-6h-.3a2.5 2.5 0 0 1-2.44-2.98l1.98-9A1.3 1.3 0 0 1 13.5 2h1Z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-black tracking-tight text-header-text">
                  Dish<span className="text-accent">From</span>This
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-sidebar-text">Recipe generator</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-header-text dark:border-white/10 dark:bg-white/5 dark:text-text-primary">
                {isAuthenticated ? 'Signed in' : 'Guest'}
              </span>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 text-sm font-bold text-header-text transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-text-primary dark:hover:bg-white/10"
                  aria-label="Log out of your account"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                  Log out
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/60 text-header-text transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label={themeLabel}
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <SunIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/60 text-header-text transition hover:bg-white/80 lg:hidden dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
            >
              {mobileNavOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <aside
        className="glass-card fixed bottom-4 left-4 top-20 hidden w-72 flex-col rounded-[32px] p-4 lg:flex"
        aria-label="Main navigation"
      >
        <nav className="flex-1 overflow-y-auto" aria-label="Primary">
          {renderNavItems()}
        </nav>
        <div className="mt-4 rounded-[28px] border border-white/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-text-primary">DishFromThis</p>
          <p className="mt-2 text-sm leading-6 text-sidebar-text">
            Curate pantry staples, generate recipes, and keep your favourites close.
          </p>
          {BuyMeACoffeeLink}
        </div>
        {renderAuthControls()}
      </aside>

      <AnimatePresence>
        {mobileNavOpen ? (
          <>
            <motion.button
              type="button"
              key="mobile-nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation menu"
            />
            <motion.aside
              key="mobile-nav-panel"
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="glass-card fixed inset-y-0 left-0 z-50 flex w-72 flex-col rounded-r-[32px] border-l-0 p-5 lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="mb-6">
                <p className="text-lg font-black tracking-tight text-header-text">
                  Dish<span className="text-accent">From</span>This
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-sidebar-text">Navigate</p>
              </div>
              <nav className="flex-1 overflow-y-auto" aria-label="Primary">
                {renderNavItems(true)}
              </nav>
              <div className="mt-auto pt-4">
                {renderAuthControls()}
                {BuyMeACoffeeLink}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className="min-h-screen pt-20 lg:pl-72" id="main-content">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
