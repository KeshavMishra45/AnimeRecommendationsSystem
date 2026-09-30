import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

function AuthDialog({ initialTab = "signin", onClose }) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setNotice("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (tab === "signin") {
        const { error: err } = await signIn({ email, password });
        if (err) {
          setError(err);
        } else {
          onClose();
        }
      } else {
        if (!username.trim()) {
          setError("Pick a username.");
          setBusy(false);
          return;
        }
        const { error: err } = await signUp({ email, password, username: username.trim() });
        if (err) {
          setError(err);
        } else {
          setNotice("Account created! Check your email if confirmation is required, or you're already signed in.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return <div
    className="modal-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
      <div className="modal-box">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-tabs">
          <button
    type="button"
    className={`modal-tab${tab === "signin" ? " active" : ""}`}
    onClick={() => switchTab("signin")}
  >
            Sign In
          </button>
          <button
    type="button"
    className={`modal-tab${tab === "signup" ? " active" : ""}`}
    onClick={() => switchTab("signup")}
  >
            Sign Up
          </button>
        </div>

        <form className="modal-form" onSubmit={onSubmit}>
          {tab === "signup" ? <label>
              Username
              <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="e.g. thorfinn"
    autoComplete="username"
    required
  />
            </label> : null}
          <label>
            Email
            <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    autoComplete="email"
    required
  />
          </label>
          <label>
            Password
            <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    autoComplete={tab === "signin" ? "current-password" : "new-password"}
    minLength={6}
    required
  />
          </label>
          <p className="modal-error">{error}</p>
          {notice ? <p className="side-note">{notice}</p> : null}
          <button className="modal-submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="modal-note">
          {tab === "signin" ? <>
              New here? <button type="button" className="auth-link-btn" onClick={() => switchTab("signup")}>Create an account</button>
            </> : <>
              Already have one? <button type="button" className="auth-link-btn" onClick={() => switchTab("signin")}>Sign in</button>
            </>}
        </p>
      </div>
    </div>;
}

export {
  AuthDialog
};
