"use client";

import { authClient } from "@/lib/auth/auth-client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import CartIcon from "@/components/icons/cart-icon";
import type { AnimatedIconHandle } from "@/components/icons/types";
import UserPlusIcon from "@/components/icons/user-plus-icon";
import UserIcon from "@/components/icons/user-icon";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Main navigation links
const LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/services", label: "Services" },
  { href: "/showcase", label: "Showcase" },
];

function getInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ponytail: badge count via a lightweight /api/cart/count (1 aggregate +
  // auth) instead of the full cart — the full getCartWithItems path cost ~10
  // sequential DB round trips on every navigation just to render a badge.
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/cart/count")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive && d && typeof d.count === "number") {
            setCartCount(d.count);
          }
        })
        .catch(() => {});
    load();
    window.addEventListener("kf-cart-changed", load);
    return () => {
      alive = false;
      window.removeEventListener("kf-cart-changed", load);
    };
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    closeMenu();
    setProfileOpen(false);
  };

  const userInitials = session?.user
    ? getInitials(session.user.name, session.user.email)
    : "U";
  const userName = session?.user?.name ?? "Account";

  // Animated nav icons play when the pointer is anywhere over the parent
  // link/button, not only over the icon glyph itself.
  const cartIconRef = useRef<AnimatedIconHandle>(null);
  const signInIconRef = useRef<AnimatedIconHandle>(null);
  const userIconRef = useRef<AnimatedIconHandle>(null);

  return (
    <>
      <nav
        className={`nav${scrolled ? " scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
              {menuOpen ? (
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2 4h12M2 8h12M2 12h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
          <Link href="/" className="nav-logo" aria-label="TableTopLabs Home">
            <span className="logo-mark" aria-hidden="true">
              TL
            </span>
            <span>TableTopLabs</span>
          </Link>
          <div className="nav-links">
            {LINKS.map((l) => {
              const isActiveLink = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link${isActiveLink ? " active" : ""}`}
                  aria-current={isActiveLink ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="nav-actions">
            <Link
              href="/collection/cart"
              className="nav-icon nav-cart"
              onMouseEnter={() => cartIconRef.current?.startAnimation()}
              onMouseLeave={() => cartIconRef.current?.stopAnimation()}
              aria-label={
                cartCount > 0
                  ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                  : "Cart"
              }
            >
              <CartIcon ref={cartIconRef} size={22} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="nav-cart-badge" aria-hidden="true">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            {session ? (
              <div className="nav-profile" ref={profileRef}>
                <button
                  type="button"
                  className="nav-profile-trigger"
                  onMouseEnter={() => userIconRef.current?.startAnimation()}
                  onMouseLeave={() => userIconRef.current?.stopAnimation()}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <UserIcon ref={userIconRef} size={22} strokeWidth={1.6} />
                </button>
                {profileOpen && (
                  <div className="nav-profile-dropdown" role="menu">
                    <div className="nav-profile-header">
                      <span className="nav-avatar nav-avatar-lg">
                        {userInitials}
                      </span>
                      <div>
                        <p className="nav-profile-name">{userName}</p>
                      </div>
                    </div>
                    <div className="nav-profile-divider" />
                    <Link
                      href="/account/profile"
                      className="nav-profile-item"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="nav-profile-item"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      My Orders
                    </Link>
                    <Link
                      href="/account/settings"
                      className="nav-profile-item"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </Link>
                    <div className="nav-profile-divider" />
                    <button
                      className="nav-profile-item nav-profile-signout"
                      role="menuitem"
                      onClick={handleSignOut}
                      type="button"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="nav-icon"
                aria-label="Sign in"
                title="Sign in"
                onMouseEnter={() => signInIconRef.current?.startAnimation()}
                onMouseLeave={() => signInIconRef.current?.stopAnimation()}
              >
                <UserPlusIcon ref={signInIconRef} size={22} strokeWidth={1.6} />
              </Link>
            )}
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu open">
          {LINKS.map((l) => {
            const isActiveLink = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`mobile-section-link${isActiveLink ? " active" : ""}`}
                aria-current={isActiveLink ? "page" : undefined}
                onClick={closeMenu}
              >
                {l.label}
              </Link>
            );
          })}
          {!session && (
            <Link
              href="/auth/login"
              className="nav-cta mobile-menu-extra"
              onClick={closeMenu}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </>
  );
}