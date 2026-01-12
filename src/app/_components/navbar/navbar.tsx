"use client";

import Link from "next/link";
import { useState } from "react";

type CurrentUser = {
  name: string | null;
  role: "CUSTOMER" | "SALON";
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

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button className="font-medium hover:text-black/70 transition">
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white text-black shadow-lg overflow-hidden">
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
  return (
    <nav className="w-full h-16 px-8 flex items-center justify-between border-b bg-[#ffb3c6] backdrop-blur text-black">
      {/* Left */}
      <Link 
        href={currentUser && currentUser.role === "SALON" ? "/dashboard" : "/"} 
        className="text-xl font-bold tracking-wide"
      >
        schedula
      </Link>

      {/* Center – hidden for logged-in salon users */}
      {!(currentUser && currentUser.role === "SALON") && (
        <div className="flex gap-8 font-medium">
          <Link href="/" className="hover:text-black/70 transition">
            Home
          </Link>
          <Link href="/salons" className="hover:text-black/70 transition">
            Salons
          </Link>
          <Link href="/contact" className="hover:text-black/70 transition">
            Contact
          </Link>
        </div>
      )}

      {/* Right */}
      <div className="flex gap-6 items-center">
        {currentUser ? (
          <div
            className="relative"
            onMouseEnter={openUserMenu}
            onMouseLeave={closeUserMenu}
          >
            <button className="font-medium flex items-center gap-2 hover:text-black/70 transition">
              <span>{currentUser.name ?? "User"}</span>
              <span className="uppercase text-xs px-2 py-1 rounded-full bg-white/70 text-black">
                {currentUser.role}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white text-black shadow-lg overflow-hidden">
                {currentUser.role === "CUSTOMER" && (
                  <Link
                    href="/user"
                    className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                  >
                    My Bookings
                  </Link>
                )}
                {currentUser.role === "SALON" && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                  >
                    Dashboard
                  </Link>
                )}
                {currentUser.role === "SALON" && (
                  <Link
                    href="/calendar"
                    className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                  >
                    Calendar
                  </Link>
                )}
                {currentUser.role === "SALON" && (
                  <Link
                    href="/services"
                    className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                  >
                    Services
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
                >
                  Settings
                </Link>
                <a
                  href="/logout"
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
    </nav>
  );
}
