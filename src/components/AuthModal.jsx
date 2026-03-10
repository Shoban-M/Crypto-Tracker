// src/components/AuthModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sign-in / sign-up modal.
// Supports Google popup auth and email+password auth.
// Shows clear, actionable error messages for the three common failure modes:
//   • NEEDS_SERVER   — opened as file:// instead of http://
//   • POPUP_BLOCKED  — browser blocked the popup window
//   • UNAUTHORIZED_DOMAIN — domain not whitelisted in Firebase Console
// ─────────────────────────────────────────────────────────────────────────────

function AuthModal({ onClose, onAuth }) {
  const [mode,          setMode]          = useState('login');
  const [email,         setEmail]         = useState('');
  const [pass,          setPass]          = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getOrCreateUser = async (fb, user) => {
    const ref  = fb.doc(fb.db, 'users', user.uid);
    const snap = await fb.getDoc(ref);
    if (!snap.exists()) {
      await fb.setDoc(ref, { email: user.email, watchlist: [] });
    }
  };

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    setError(''); setGoogleLoading(true);
    const fb = getFirebase();
    if (!fb) {
      setGoogleLoading(false);
      onAuth({ uid: 'demo-google-' + Date.now(), email: 'google@demo.com', displayName: 'Google User' });
      onClose(); return;
    }
    if (window.location.protocol === 'file:') {
      setGoogleLoading(false); setError('NEEDS_SERVER'); return;
    }
    try {
      const provider = new fb.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await fb.signInWithPopup(fb.auth, provider);
      await getOrCreateUser(fb, cred.user);
      onAuth(cred.user); onClose();
    } catch (e) {
      setGoogleLoading(false);
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
      else if (e.code === 'auth/popup-blocked')        setError('POPUP_BLOCKED');
      else if (e.code === 'auth/unauthorized-domain')  setError('UNAUTHORIZED_DOMAIN');
      else setError(e.message.replace('Firebase: ', '').replace(/\s*\(auth\/.*?\)\.?/, ''));
      return;
    }
    setGoogleLoading(false);
  };

  // ── Email / password ───────────────────────────────────────────────────────
  const submit = async () => {
    setError(''); setLoading(true);
    const fb = getFirebase();
    if (!fb) {
      setLoading(false);
      onAuth({ uid: 'demo-' + Date.now(), email, displayName: email.split('@')[0] });
      onClose(); return;
    }
    try {
      let cred;
      if (mode === 'login') {
        cred = await fb.signInWithEmailAndPassword(fb.auth, email, pass);
      } else {
        cred = await fb.createUserWithEmailAndPassword(fb.auth, email, pass);
        await fb.setDoc(fb.doc(fb.db, 'users', cred.user.uid), { email, watchlist: [] });
      }
      onAuth(cred.user); onClose();
    } catch (e) {
      setError(e.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  // ── Error box ─────────────────────────────────────────────────────────────
  const isWarn = ['NEEDS_SERVER', 'POPUP_BLOCKED', 'UNAUTHORIZED_DOMAIN'].includes(error);
  const errStyle = {
    marginBottom: 12, padding: '12px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
    background: isWarn ? 'rgba(245,200,66,0.08)' : 'rgba(255,77,106,0.08)',
    border: `1px solid ${isWarn ? 'rgba(245,200,66,0.3)' : 'rgba(255,77,106,0.3)'}`,
    color: isWarn ? '#f5c842' : 'var(--red)',
  };
  const codeStyle = { background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 };
  const subStyle  = { fontSize: 12, color: 'rgba(245,200,66,0.8)' };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <div className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
        <div className="auth-sub">{mode === 'login' ? 'Sign in to access your watchlist' : 'Start tracking your favorite coins'}</div>

        {/* Google button */}
        <button className="btn-google" onClick={signInWithGoogle} disabled={googleLoading}>
          {googleLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
              Signing in...
            </span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.1-17.7 10.3z"/>
                <path fill="#FBBC05" d="M24 46c5.9 0 11-2 14.7-5.4l-6.8-5.6C29.9 36.7 27.1 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.9 41.8 15.4 46 24 46z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.3-2.3 4.2-4.3 5.5l6.8 5.6C42.1 36.2 45 30.6 45 24c0-1.3-.2-2.7-.5-4z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="divider">or</div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        {error && (
          <div style={errStyle}>
            {error === 'NEEDS_SERVER' && (
              <>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠ Google Sign-in needs a local server</div>
                <div style={subStyle}>
                  You're opening the file directly. To fix:<br/><br/>
                  <strong>VS Code:</strong> Install "Live Server" → right-click <code style={codeStyle}>index.html</code> → "Open with Live Server"<br/><br/>
                  <strong>Terminal:</strong> <code style={codeStyle}>npx serve .</code> → open <code style={codeStyle}>http://localhost:3000</code><br/><br/>
                  <strong>💡 Email/password sign-in works without a server!</strong>
                </div>
              </>
            )}
            {error === 'POPUP_BLOCKED' && (
              <>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠ Popup was blocked</div>
                <div style={subStyle}>Allow popups for this site in your browser settings, then try again.</div>
              </>
            )}
            {error === 'UNAUTHORIZED_DOMAIN' && (
              <>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠ Domain not authorized in Firebase</div>
                <div style={subStyle}>Go to <strong>Firebase Console → Authentication → Settings → Authorized domains</strong> and add <code style={codeStyle}>localhost</code>.</div>
              </>
            )}
            {!isWarn && <><span style={{ fontWeight: 700 }}>⚠ Error: </span>{error}</>}
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: 8 }} onClick={submit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Sign In with Email' : 'Create Account'}
        </button>

        <div className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,245,160,0.05)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', border: '1px solid rgba(0,245,160,0.15)' }}>
          🔒 Your data is securely stored with Firebase. Watchlists sync across all your devices.
        </div>
      </div>
    </div>
  );
}
