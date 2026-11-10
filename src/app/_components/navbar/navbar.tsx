"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Paintbrush, Calendar, Menu, Settings, LogOut, BarChart3, UserCircle } from "lucide-react";


type CurrentUser = {
  name: string | null;
  role: "CUSTOMER" | "SALON";
  salonId?: number;
} | null;

export type NavbarLinks = {
  home: string;
  salons: string;
  bookings: string;
  dashboard: string;
  calendar: string;
  services: string;
  settings: string;
  logout: string;
  profile: (salonId: number) => string;
};

const DEFAULT_LINKS: NavbarLinks = {
  home: "/",
  salons: "/salons",
  bookings: "/user",
  dashboard: "/dashboard",
  calendar: "/calendar",
  services: "/services",
  settings: "/settings",
  logout: "/logout",
  profile: (salonId) => `/salons/${salonId}`,
};

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const openMenu = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };

  const closeMenu = () => {
    timeout.current = setTimeout(() => {
      setOpen(false);
    }, 120); // 👈 delay (tweak 80–200ms)
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className="h-10 px-2 flex items-center justify-center text-center rounded-lg font-medium hover:text-black/70 dark:hover:text-foreground/70 transition"
      >
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-card text-black dark:text-foreground shadow-lg overflow-hidden z-[100] border border-transparent dark:border-border">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  currentUser,
  links = DEFAULT_LINKS,
  isDemo = false,
}: {
  currentUser?: CurrentUser;
  links?: NavbarLinks;
  // The demo renders its own navbar, so the site-wide one steps aside on /demo
  isDemo?: boolean;
}) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const openUserMenu = () => {
    clearTimeout(userTimeout.current);
    setUserMenuOpen(true);
  };

  const closeUserMenu = () => {
    userTimeout.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 120);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (userMenuOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, mobileMenuOpen]);

  // Mobile navigation links with icons
  const mobileNavLinks = currentUser && currentUser.role === "SALON" ? (
    <>
      <Link href={links.dashboard} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
        <BarChart3 className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link href={links.calendar} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
        <Calendar className="w-5 h-5" />
        <span>Calendar</span>
      </Link>
      <Link href={links.services} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
        <Paintbrush className="w-5 h-5" />
        <span>Services</span>
      </Link>
      {currentUser.salonId && (
        <Link href={links.profile(currentUser.salonId)} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
          <UserCircle className="w-5 h-5" />
          <span>My Profile</span>
        </Link>
      )}
    </>
  ) : (
    <>
      <Link href={links.home} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>
      <Link href={links.salons} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
        <Paintbrush className="w-5 h-5" />
        <span>Salons</span>
      </Link>
      {currentUser && currentUser.role === "CUSTOMER" && (
        <Link href={links.bookings} onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
          <Calendar className="w-5 h-5" />
          <span>Bookings</span>
        </Link>
      )}
    </>
  );

  if (!isDemo && pathname.startsWith("/demo")) {
    return null;
  }

  return (
    <div className="relative z-50 w-full h-20 px-4 md:px-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:gap-4 border-b border-black/10 dark:border-border bg-[#ffb3c6] dark:bg-secondary backdrop-blur text-black dark:text-foreground">
      {/* Left */}
      <Link 
        href={currentUser && currentUser.role === "SALON" ? links.dashboard : links.home} 
        className="text-base md:text-xl justify-self-start font-bold tracking-wide"
      >
        schedula
      </Link>

      {/* Center */}
      <div className="justify-self-center flex justify-center items-center">
        {currentUser && currentUser.role === "SALON" ? (
          <div className="hidden md:flex items-center md:gap-2 lg:gap-3 md:text-sm lg:text-base font-medium">
            <Link href={links.dashboard} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href={links.calendar} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </Link>
            <Link href={links.services} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
              <Paintbrush className="w-5 h-5" />
              <span>Services</span>
            </Link>
            {currentUser.salonId && (
              <Link href={links.profile(currentUser.salonId)} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
                <UserCircle className="w-5 h-5" />
                <span>My Profile</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center md:gap-2 lg:gap-3 md:text-sm lg:text-base font-medium">
            <Link href={links.home} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link href={links.salons} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
              <Paintbrush className="w-5 h-5" />
              <span>Salons</span>
            </Link>
            {currentUser && currentUser.role === "CUSTOMER" && (
              <Link href={links.bookings} className="h-14 px-3 flex flex-col items-center justify-center gap-1 text-center rounded-lg hover:text-black/70 dark:hover:text-foreground/70 transition">
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center justify-self-end gap-2 md:gap-3">
        {currentUser ? (
          <div
            ref={userMenuRef}
            className="relative"
            onMouseEnter={!isMobile ? openUserMenu : undefined}
            onMouseLeave={!isMobile ? closeUserMenu : undefined}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              onClick={isMobile ? toggleUserMenu : undefined}
              title={currentUser.name ?? "User"}
              className="h-10 md:w-40 lg:w-52 px-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:text-black/70 dark:hover:text-foreground/70 transition"
            >
              <span className="min-w-0 truncate max-w-[6rem] sm:max-w-[12rem] md:max-w-none">{currentUser.name ?? "User"}</span>
              <span className="shrink-0 uppercase text-xs px-2 py-1 rounded-full bg-white/70 dark:bg-accent text-black dark:text-foreground">
                {currentUser.role}
              </span>
            </button>

            {userMenuOpen && (
              <div className={`absolute right-0 mt-2 rounded-lg bg-white dark:bg-card text-black dark:text-foreground shadow-lg overflow-hidden z-[100] border border-transparent dark:border-border ${isMobile && currentUser && currentUser.role === "SALON" ? "w-56" : "w-44"}`}>
                {/* Navigation links - shown on mobile for salon users */}
                {isMobile && currentUser && currentUser.role === "SALON" && (
                  <>
                    <Link href={links.dashboard} onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href={links.calendar} onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                      <Calendar className="w-4 h-4" />
                      <span>Calendar</span>
                    </Link>
                    <Link href={links.services} onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                      <Paintbrush className="w-4 h-4" />
                      <span>Services</span>
                    </Link>
                    {currentUser.salonId && (
                      <Link href={links.profile(currentUser.salonId)} onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                        <UserCircle className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-200 dark:border-border my-1"></div>
                  </>
                )}
                <Link
                  href={links.settings}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent text-left w-full"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <a
                  href={links.logout}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-accent text-left w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile hamburger menu - only for unlogged users */}
            {isMobile ? (
              <div ref={mobileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="h-10 w-10 flex items-center justify-center hover:bg-white/20 dark:hover:bg-accent/50 rounded-lg transition"
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="w-6 h-6" />
                </button>

                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-card text-black dark:text-foreground shadow-lg overflow-hidden z-[100] border border-transparent dark:border-border">
                    {mobileNavLinks}
                    <div className="border-t border-gray-200 dark:border-border my-1"></div>
                    <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                      Login
                    </Link>
                    <Link href="/register" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                      Register as Customer
                    </Link>
                    <Link href="/salon-register" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-accent text-left w-full">
                      Register as Business
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-10 px-2 flex items-center justify-center text-center rounded-lg font-medium hover:text-black/70 dark:hover:text-foreground/70 transition"
                >
                  Login
                </Link>
                <Dropdown
                  label="Register"
                  items={[
                    { label: "Customer", href: "/register" },
                    { label: "Business", href: "/salon-register" },
                  ]}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
