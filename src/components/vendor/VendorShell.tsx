import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Check,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useAccount } from "../../context/AccountContext";
import LogoMark from "../LogoMark";
import { api, getToken } from "../../api/client";
import type { VendorNotification } from "../../api/client";
import { storefrontUrl } from "../../utils/storefrontUrl";

const links = [
  { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vendor/products", label: "Products", icon: Package, end: true },
  { to: "/vendor/products/new", label: "Add Product", icon: Plus },
  { to: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { to: "/vendor/customers", label: "Customers", icon: Users },
  { to: "/vendor/sales", label: "Sales", icon: TrendingUp },
  { to: "/vendor/reviews", label: "Reviews", icon: Star },
  { to: "/vendor/reports", label: "Reports", icon: BarChart3 },
  { to: "/vendor/profile", label: "Store Profile", icon: Store },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

function VendorShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, loadingSession, user, logout, showToast } = useAccount();
  const bellRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);

  const readStorageKey = `gd_vendor_read_notifications_${(user as any)?.id || user?.email || "vendor"}`;
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(readStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;
    if (isLoggedIn && user.role === "vendor") {
      api.vendorNotifications()
        .then((res) => {
          if (active && Array.isArray(res)) {
            setNotifications(res);
            // Sync any backend-marked read IDs
            const backendRead = res.filter((n) => n.read).map((n) => n.id);
            if (backendRead.length > 0) {
              setReadIds((prev) => {
                const merged = Array.from(new Set([...prev, ...backendRead]));
                try {
                  localStorage.setItem(readStorageKey, JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          }
        })
        .catch(() => {
          if (active) setNotifications([]);
        });
    }
    return () => {
      active = false;
    };
  }, [isLoggedIn, user.role, readStorageKey]);

  // Mark specific notification IDs or all as read
  const markAsRead = useCallback(
    (idsToMark?: string[]) => {
      setReadIds((prev) => {
        const targetIds = idsToMark || notifications.map((n) => n.id);
        const merged = Array.from(new Set([...prev, ...targetIds]));
        try {
          localStorage.setItem(readStorageKey, JSON.stringify(merged));
        } catch {}
        return merged;
      });

      if (api.vendorMarkNotificationsRead) {
        api.vendorMarkNotificationsRead(idsToMark).catch(() => {});
      }
    },
    [notifications, readStorageKey]
  );

  const markAllAsRead = useCallback(() => {
    markAsRead(notifications.map((n) => n.id));
  }, [markAsRead, notifications]);

  // Handle outside click: when closing after viewing, mark current notifications as read
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        if (notesOpen) {
          // Viewing finished - mark notifications as read so notification number does not show
          markAllAsRead();
          setNotesOpen(false);
        }
      }
    }
    if (notesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notesOpen, markAllAsRead]);

  const unreadNotifications = notifications.filter(
    (n) => !n.read && !readIds.includes(n.id)
  );
  const unreadCount = unreadNotifications.length;
  const vendorName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.vendor?.businessName ||
    "Vendor";
  const farm = user.vendor?.businessName || vendorName;
  const avatarLetter = (vendorName || farm || "V").slice(0, 1).toUpperCase();

  const statusLabel =
    user.vendor?.status === "approved"
      ? "Verified Seller"
      : user.vendor?.status === "under_review"
      ? "Under Review"
      : user.vendor?.status === "on_hold"
      ? "On Hold"
      : user.vendor?.status === "rejected"
      ? "Suspended"
      : "Verified Seller";

  if (loadingSession) {
    return <main className="auth-gate-page" role="status">Checking your vendor session…</main>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login?role=vendor" replace state={{ from: `${location.pathname}${location.search}`, role: "vendor" }} />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role !== "vendor") {
    const token = getToken();
    const target = storefrontUrl(token ? `/account?auth_token=${encodeURIComponent(token)}` : "/login");
    window.location.replace(target);
    return null;
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const nav = (
    <nav className="vd-nav">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <Icon size={18} strokeWidth={1.9} />
            {link.label}
          </NavLink>
        );
      })}
      <button
        type="button"
        className="vd-logout"
        onClick={() => {
          closeMenu();
          logout();
          navigate("/login", { state: { role: "vendor", from: "/vendor" } });
        }}
      >
        <LogOut size={18} strokeWidth={1.9} />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="vd-app">
      <aside className={`vd-sidebar${menuOpen ? " open" : ""}`}>
        <div className="vd-brand">
          <LogoMark className="vd-logo" decorative />
          <div>
            <strong>GoogleDoko</strong>
            <span>VENDOR</span>
          </div>
          <button
            type="button"
            className="vd-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X size={18} />
          </button>
        </div>
        {nav}
        <div className="vd-help">
          <Headphones size={18} />
          <strong>Need Assistance?</strong>
          <p>Our vendor support team is ready to assist Himalayan farms.</p>
          <a href="mailto:support@googledoko.com">Contact Support</a>
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="vd-overlay"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <div className="vd-main">
        <header className="vd-top">
          <button
            type="button"
            className="vd-menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <form
            className="vd-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const q = search.trim();
              if (!q) {
                showToast("Type something to search");
                return;
              }
              if (location.pathname.startsWith("/vendor/customers")) {
                navigate(`/vendor/customers?q=${encodeURIComponent(q)}`);
              } else if (location.pathname.startsWith("/vendor/sales")) {
                navigate(`/vendor/sales?q=${encodeURIComponent(q)}`);
              } else if (location.pathname.startsWith("/vendor/reviews")) {
                navigate(`/vendor/reviews?q=${encodeURIComponent(q)}`);
              } else if (location.pathname.startsWith("/vendor/settings")) {
                showToast(`Looking up “${q}” in store settings`);
              } else if (location.pathname.startsWith("/vendor/orders")) {
                showToast(`Searching orders for “${q}”`);
              } else if (location.pathname.startsWith("/vendor/reports")) {
                showToast(`Searching reports for “${q}”`);
              } else {
                navigate(`/vendor/products?q=${encodeURIComponent(q)}`);
              }
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                location.pathname === "/vendor/products/new"
                  ? "Creating a new fresh product entry..."
                  : location.pathname.startsWith("/vendor/products")
                    ? "Search your product list..."
                    : location.pathname.startsWith("/vendor/orders")
                      ? "Search your customer orders..."
                      : location.pathname.startsWith("/vendor/customers")
                        ? "Search your customer list..."
                      : location.pathname.startsWith("/vendor/sales")
                        ? "Search sales, payouts, or order IDs..."
                        : location.pathname.startsWith("/vendor/reviews")
                          ? "Search reviews, products, or customers..."
                        : location.pathname.startsWith("/vendor/settings")
                          ? "Search alerts, payments, or account settings..."
                        : location.pathname.startsWith("/vendor/profile")
                        ? "Editing your public farm storefront profile..."
                        : location.pathname.startsWith("/vendor/reports") ||
                            location.pathname.startsWith("/vendor/analytics")
                          ? "Search reports, revenue, or transactions..."
                          : "Search orders, clients, or produce..."
              }
              aria-label="Search vendor dashboard"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} />
            </button>
          </form>
          <div className="vd-top-right">
            <div className="vd-bell-wrap" ref={bellRef}>
              <button
                type="button"
                className="vd-bell"
                aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
                aria-expanded={notesOpen}
                onClick={() => {
                  setNotesOpen((open) => {
                    if (open && unreadCount > 0) {
                      markAllAsRead();
                    }
                    return !open;
                  });
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 ? <span className="vd-bell-count">{unreadCount}</span> : null}
              </button>
              {notesOpen ? (
                <div className="vd-notes" role="menu">
                  <div className="vd-notes-head">
                    <strong>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}</strong>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        className="vd-notes-mark-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                      >
                        Mark all as read
                      </button>
                    ) : null}
                  </div>
                  {unreadNotifications.length === 0 ? (
                    <div className="vd-notes-empty">
                      <Check size={16} color="#176136" />
                      <span>No new notifications</span>
                      <small>All caught up!</small>
                    </div>
                  ) : (
                    unreadNotifications.map((note) => (
                      <div className="vd-note-row" key={note.id}>
                        <button
                          type="button"
                          className="vd-note-item"
                          onClick={() => {
                            markAsRead([note.id]);
                            setNotesOpen(false);
                            navigate(note.to);
                          }}
                        >
                          {note.text}
                        </button>
                        <button
                          type="button"
                          className="vd-note-dismiss"
                          aria-label={`Mark as read: ${note.text}`}
                          title="Mark as read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([note.id]);
                          }}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <div className="vd-user">
              <span className="vd-avatar" aria-hidden="true">
                {user.photo ? (
                  <img src={user.photo} alt="" />
                ) : (
                  avatarLetter
                )}
              </span>
              <div>
                <strong>{vendorName}</strong>
                <small>{farm && farm.toLowerCase() !== vendorName.toLowerCase() ? `${farm} · ${statusLabel}` : statusLabel}</small>
              </div>
            </div>
          </div>
        </header>
        <div className="vd-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default VendorShell;
