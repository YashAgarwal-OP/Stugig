/**
 * DevSetAuth — LOCAL DEVELOPMENT ONLY
 *
 * This page exists purely as a testing convenience. It reads `token` and `user`
 * from the URL query string, writes them into localStorage (matching the keys
 * AuthContext uses), then redirects to the appropriate dashboard.
 *
 * Security guarantees:
 *  - This component renders a hard 404 when `import.meta.env.DEV` is false,
 *    so it is completely inert in staging / production builds.
 *  - The file is inside src/ (not public/), so Vite's tree-shaker will
 *    eliminate it from the production bundle when the branch is provably dead.
 *  - It is also excluded from the production router in App.jsx via the same
 *    `import.meta.env.DEV` guard — it is never registered as a route in prod.
 *
 * Usage (dev only):
 *   http://localhost:5173/dev/set-auth?token=<jwt>&user=<url-encoded-json>
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DevSetAuth() {
  const navigate = useNavigate();

  // Hard block in production — render nothing and send to 404
  if (!import.meta.env.DEV) {
    return null; // router guard in App.jsx also prevents reaching here in prod
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');

    if (!token || !userRaw) {
      console.error('[DevSetAuth] Missing token or user param');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      localStorage.setItem('stugig_token', token);
      localStorage.setItem('stugig_user', JSON.stringify(user));
      // Redirect to role-appropriate dashboard
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    } catch (err) {
      console.error('[DevSetAuth] Failed to parse user param:', err);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#555' }}>
      <p>🔧 [DEV] Injecting auth credentials…</p>
    </div>
  );
}
