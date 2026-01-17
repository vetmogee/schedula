"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Paintbrush, Calendar, Building2 } from "lucide-react";

type CurrentUser = {
  name: string | null;
  role: "CUSTOMER" | "SALON";
  salonId?: number;
} | null;

function Dropdown({
  label,
  loginHref,
  registerHref,
}: {
  label: string;
  loginHref: string;
  registerHref: string;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let timeout: NodeJS.Timeout;

  const openMenu = () => {
    clearTimeout(timeout);
    setOpen(true);
  };

  const closeMenu = () => {
    timeout = setTimeout(() => {
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
      <button className="font-medium hover:text-black/70 transition">
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white text-black shadow-lg overflow-hidden z-[100]">
          <Link href={loginHref} className="block px-4 py-2 hover:bg-gray-100">
            Login
          </Link>
          <Link href={registerHref} className="block px-4 py-2 hover:bg-gray-100">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ currentUser }: { currentUser?: CurrentUser }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const userMenuRef = useRef<HTMLDivElement>(null);
  let userTimeout: NodeJS.Timeout;

  const openUserMenu = () => {
    clearTimeout(userTimeout);
    setUserMenuOpen(true);
  };

  const closeUserMenu = () => {
    userTimeout = setTimeout(() => {
      setUserMenuOpen(false);
    }, 120);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLinkClick = () => {
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  // Navigation links based on user role
  const navLinks = currentUser && currentUser.role === "SALON" ? (
    <>
      <Link href="/dashboard" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
        Dashboard
      </Link>
      <Link href="/calendar" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
        Calendar
      </Link>
      <Link href="/services" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
        Services
      </Link>
      {currentUser.salonId && (
        <Link href={`/salons/${currentUser.salonId}`} onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
          My Profile
        </Link>
      )}
    </>
  ) : (
    <>
      <Link href="/" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
        Home
      </Link>
      <Link href="/salons" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
        Salons
      </Link>
      {currentUser && currentUser.role === "CUSTOMER" && (
        <Link href="/user" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-gray-100 text-left w-full">
          My Bookings
        </Link>
      )}
    </>
  );

  return (
    <div className="relative z-50 w-full h-20 px-4 md:px-8 grid grid-cols-3 items-center border-b bg-[#ffb3c6] backdrop-blur text-black">
      {/* Left */}
      <Link 
        href={currentUser && currentUser.role === "SALON" ? "/dashboard" : "/"} 
        className="text-base md:text-xl justify-self-start font-bold tracking-wide"
      >
        schedula
      </Link>

      {/* Center - Hidden on mobile */}
      {currentUser && currentUser.role === "SALON" ? (
        <div className="hidden md:flex gap-8 font-medium justify-self-center">
          <Link href="/dashboard" className="hover:text-black/70 transition flex flex-col items-center gap-1">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/calendar" className="hover:text-black/70 transition flex flex-col items-center gap-1">
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </Link>
          <Link href="/services" className="hover:text-black/70 transition flex flex-col items-center gap-1">
            <Paintbrush className="w-5 h-5" />
            <span>Services</span>
          </Link>
          {currentUser.salonId && (
            <Link href={`/salons/${currentUser.salonId}`} className="hover:text-black/70 transition flex flex-col items-center gap-1">
              <Building2 className="w-5 h-5" />
              <span>My Profile</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="hidden md:flex gap-8 font-medium justify-self-center">
          <Link href="/" className="hover:text-black/70 transition flex flex-col items-center gap-1">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/salons" className="hover:text-black/70 transition flex flex-col items-center gap-1">
            <Paintbrush className="w-5 h-5" />
            <span>Salons</span>
          </Link>
          {currentUser && currentUser.role === "CUSTOMER" && (
            <Link href="/user" className="hover:text-black/70 transition flex flex-col items-center gap-1">
              <Calendar className="w-5 h-5" />
              <span>My Bookings</span>
            </Link>
          )}
        </div>
      )}

      {/* Right */}
      <div className="flex gap-6 items-center justify-self-end">
        {currentUser ? (
          <div
            ref={userMenuRef}
            className="relative"
            onMouseEnter={!isMobile ? openUserMenu : undefined}
            onMouseLeave={!isMobile ? closeUserMenu : undefined}
          >
            <button 
              onClick={isMobile ? toggleUserMenu : undefined}
              className="font-medium flex items-center gap-2 hover:text-black/70 transition"
            >
              <span>{currentUser.name ?? "User"}</span>
              <span className="uppercase text-xs px-2 py-1 rounded-full bg-white/70 text-black">
                {currentUser.role}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white text-black shadow-lg overflow-hidden z-[100]">
                {/* Navigation links - shown on mobile, hidden on desktop */}
                {isMobile && navLinks}
                {isMobile && <div className="border-t border-gray-200 my-1"></div>}
                <Link
                  href="/settings"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                >
                  Settings
                </Link>
                <a
                  href="/logout"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            <Dropdown
              label="Customer"
              loginHref="/login"
              registerHref="/register"
            />
            <Dropdown
              label="Business"
              loginHref="/login"
              registerHref="/salon-register"
            />
          </>
        )}
      </div>
    </div>
  );
}
