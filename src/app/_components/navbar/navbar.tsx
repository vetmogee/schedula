"use client"

import { useEffect, useRef, useState } from "react"

export default function Navbar() {
  const lastScrollYRef = useRef(0)
  const [hiddenOnDown, setHiddenOnDown] = useState(false)
  const [isBusinessOpen, setIsBusinessOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const businessRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)
  const businessHideTimeoutRef = useRef<number | null>(null)
  const userHideTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0
      // Hide when scrolling down, show when scrolling up
      if (currentY > lastScrollYRef.current) {
        setHiddenOnDown(true)
      } else if (currentY < lastScrollYRef.current) {
        setHiddenOnDown(false)
      }
      lastScrollYRef.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        businessRef.current && !businessRef.current.contains(target) &&
        userRef.current && !userRef.current.contains(target)
      ) {
        setIsBusinessOpen(false)
        setIsUserOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openBusiness = () => {
    if (businessHideTimeoutRef.current) {
      clearTimeout(businessHideTimeoutRef.current)
      businessHideTimeoutRef.current = null
    }
    setIsBusinessOpen(true)
    setIsUserOpen(false)
  }

  const closeBusinessWithDelay = () => {
    if (businessHideTimeoutRef.current) return
    businessHideTimeoutRef.current = window.setTimeout(() => {
      setIsBusinessOpen(false)
      businessHideTimeoutRef.current = null
    }, 250)
  }

  const openUser = () => {
    if (userHideTimeoutRef.current) {
      clearTimeout(userHideTimeoutRef.current)
      userHideTimeoutRef.current = null
    }
    setIsUserOpen(true)
    setIsBusinessOpen(false)
  }

  const closeUserWithDelay = () => {
    if (userHideTimeoutRef.current) return
    userHideTimeoutRef.current = window.setTimeout(() => {
      setIsUserOpen(false)
      userHideTimeoutRef.current = null
    }, 250)
  }

  return (
    <div
      className={
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-200 will-change-transform " +
        (hiddenOnDown ? "-translate-y-full" : "translate-y-0")
      }
    >
      <div className="grid grid-cols-3 items-center text-center w-full gap-4 *:p-5 *:px-10 bg-[#ffb3c6] backdrop-blur ">
        {/* left side */}
        <div className="justify-self-start font-bold">
          Schedula
        </div>

        {/* center buttons */}
        <div className="w-full flex flex-row justify-center gap-10">
          <div>Home</div>
          <div>Studios</div>
          <div>Contact</div>
        </div>

         {/* RIGHT SIDE */}
        <div className="flex flex-row  justify-self-end relative">
          {/* login */}
          <div className="relative px-10">
            <div className="cursor-pointer">
              <a href="/login">Log in</a>
            </div>
          </div>

          {/* register */}
          <div
            className="relative px-10"
            ref={userRef}
            onMouseEnter={openUser}
            onMouseLeave={closeUserWithDelay}
          >
            <div
              className="cursor-pointer"
              role="button"
              aria-haspopup="menu"
              aria-expanded={isUserOpen}
              onClick={() => {
                if (isUserOpen) {
                  setIsUserOpen(false)
                } else {
                  openUser()
                }
              }}
            >
              Register
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className={
                "absolute right-0 mt-2 w-30 bg-white text-black rounded-lg shadow-lg z-50 transition-all duration-200 -translate-x-2 translate-y-0 " +
                (isUserOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none")
              }
            >
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer"><a href="/login">User</a></div>
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer"><a href="/register">Business</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}