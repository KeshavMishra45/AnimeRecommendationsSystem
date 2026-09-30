import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TYPES, TYPE_META } from "@/lib/kkmanime";
import { getCatalog } from "@/lib/catalog-store";
import { useAuth } from "@/lib/auth-context";
import { listFollows } from "@/lib/follows.functions";
import { AuthDialog } from "./AuthDialog";
import { useOpenTitle } from "./dialog-context";
import { CutButton, KatanaIcon } from "./CutButton";
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "#website",
      name: "KKMANIME",
      alternateName: "KKM ANIME",
      description:
        "Genre and character based anime, manga, manhwa and movie recommendations.",
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "/search?q={search_term_string}&type=anime"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "#organization",
      name: "KKMANIME",
      logo: { "@type": "ImageObject", url: "/logo/kkmanime-logo.png" }
    }
  ]
};
const TYPE_PATH = {
  anime: "/anime",
  manga: "/manga",
  manhwa: "/manhwa",
  movie: "/movies"
};
const Logo = () => <picture>
    <source srcSet="/logo/kkmanime-logo.webp" type="image/webp" />
    <img
    src="/logo/kkmanime-logo.png"
    alt="KKMANIME"
    className="logo-image"
    width="900"
    height="182"
    decoding="async"
  />
  </picture>;
function NavSearch({ type, open, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate({ to: "/search", search: { q: term, type } });
    onClose();
  };
  const cut = () => {
    setQ("");
    inputRef.current?.focus();
  };
  return <form className={`nav-search${open ? " open" : ""}`} onSubmit={onSubmit} role="search" autoComplete="off">
      <input
    ref={inputRef}
    type="text"
    aria-label="Search"
    placeholder="Search"
    value={q}
    onChange={(e) => setQ(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Escape" && q) {
        e.preventDefault();
        cut();
      }
    }}
  />
      <CutButton visible={q.length > 0} onCut={cut} />
      <button type="submit" aria-label="Run search" className="nav-search-go">
        <KatanaIcon size={26} />
      </button>
    </form>;
}
function NavAuth({ onOpenAuth }) {
  const { user, profile, loading, signOut } = useAuth();
  if (loading) return null;
  if (!user) {
    return <>
        <button type="button" className="auth-btn auth-btn-login" onClick={() => onOpenAuth("signin")}>
          Login
        </button>
        <button type="button" className="auth-btn auth-btn-signup" onClick={() => onOpenAuth("signup")}>
          Sign Up
        </button>
      </>;
  }
  return <>
      <span className="nav-user">★ {profile?.display_name || profile?.username || user.email}</span>
      <button type="button" className="auth-btn auth-btn-login" onClick={() => signOut()}>
        Logout
      </button>
    </>;
}
function FollowingList() {
  const { user } = useAuth();
  const openTitle = useOpenTitle();
  const [follows, setFollows] = useState(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setFollows(null);
      return;
    }
    listFollows()
      .then((rows) => {
        if (active) setFollows(rows);
      })
      .catch((err) => {
        console.error("[following] failed to load:", err);
        if (active) setFollows([]);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const openFollow = (row) => {
    const entry = getCatalog()[row.titleType]?.find((e) => e.id === row.titleId);
    if (entry) openTitle(entry);
  };

  if (!user) {
    return <p className="side-note">Sign in to follow anime, manga, manhwa and movies you love.</p>;
  }
  if (follows === null) {
    return <p className="side-note">Loading your following…</p>;
  }
  if (follows.length === 0) {
    return <p className="side-note">Nothing followed yet — open a title and tap Follow.</p>;
  }
  return <ul className="following-list">
      {follows.map((row) => <li key={row.id}>
          <button type="button" onClick={() => openFollow(row)}>
            {row.titleName}
            <small>{TYPE_META[row.titleType]?.label ?? row.titleType}</small>
          </button>
        </li>)}
    </ul>;
}
function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const [authTab, setAuthTab] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useRouterState({ select: (s) => s.location });
  const activeType = location.search.type;
  const searchType = TYPES.find((t) => TYPE_PATH[t] === location.pathname) ?? (TYPES.includes(activeType) ? activeType : "anime");
  const isActive = (t) => location.pathname === TYPE_PATH[t] || activeType === t && location.pathname !== "/";
  return <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
  />
      <header className="navbar">
        <div className="nav-left">
          <button
    className="hamburger"
    aria-label="Toggle menu"
    type="button"
    onClick={() => setOpen((o) => !o)}
  >
            <span />
            <span />
            <span />
          </button>
          <Link to="/anime" className="nav-logo brand-logo">
            <Logo />
          </Link>
        </div>
        <nav className="nav-links" aria-label="Main sections">
          {TYPES.map((t) => <Link
    key={t}
    to={TYPE_PATH[t]}
    className={`nav-link${isActive(t) ? " active" : ""}`}
  >
              {TYPE_META[t].label}
            </Link>)}
          <Link
    to="/catalog"
    search={{ type: activeType ?? "anime", letter: "A" }}
    className={`nav-link${location.pathname === "/catalog" ? " active" : ""}`}
  >
            A-Z List
          </Link>
        </nav>
        <NavSearch type={searchType} open={searchOpen} onClose={() => setSearchOpen(false)} />
        <div className="nav-auth" aria-label="Account">
          <button
    type="button"
    className="nav-search-toggle"
    aria-label="Toggle search"
    aria-expanded={searchOpen}
    onClick={() => setSearchOpen((o) => !o)}
  >
            <KatanaIcon size={24} />
          </button>
          <NavAuth onOpenAuth={setAuthTab} />
        </div>
      </header>

      <div className="layout">
        <div className={`sidebar-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
        <aside className={`sidebar${open ? " open" : ""}`}>
          <nav className="side-nav" aria-label="Browse categories">
            {TYPES.map((t) => <Link
    key={t}
    to={TYPE_PATH[t]}
    className={`side-link${isActive(t) ? " active" : ""}`}
    onClick={() => setOpen(false)}
  >
                <span className="icon">{TYPE_META[t].icon}</span> {TYPE_META[t].label}
              </Link>)}
            <Link
    to="/catalog"
    search={{ type: activeType ?? "anime", letter: "A" }}
    className={`side-link${location.pathname === "/catalog" ? " active" : ""}`}
    onClick={() => setOpen(false)}
  >
              <span className="icon">🔠</span> Catalog A-Z
            </Link>
          </nav>
          <div className="side-following">
            <p className="side-heading">★ My Following</p>
            <FollowingList />
          </div>
          <div className="sidebar-note">KKMANIME · genre &amp; character based recommendations</div>
        </aside>

        <main className="main-content" id="main-content">
          {children}
          <footer className="site-footer">
            <div className="brand-logo">
              <Logo />
            </div>
            <p>Built for people who fall too hard for fictional characters. 一期一会</p>
          </footer>
        </main>
      </div>
      {authTab ? <AuthDialog initialTab={authTab} onClose={() => setAuthTab(null)} /> : null}
    </>;
}
export {
  Shell,
  TYPE_PATH
};
