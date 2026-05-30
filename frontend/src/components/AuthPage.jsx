import { useState } from 'react';

export default function AuthPage({ onLogin, onRegister, loading, error }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (mode === 'login') {
      onLogin(email, password);
    } else {
      onRegister(email, password);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <div>
            <p className="eyebrow">Private task access</p>
            <h1>{mode === 'login' ? 'Sign in to your dashboard' : 'Create a new account'}</h1>
            <p className="auth-description">Securely manage only your tasks with a personal account.</p>
          </div>
        </div>

        <div className="auth-form">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="auth-error">{error}</div>}
          <button className="primary-button auth-submit" onClick={handleSubmit} disabled={loading || !email || !password}>
            {loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <button className="secondary-button auth-switch" onClick={toggleMode}>
            {mode === 'login' ? 'Create a new account' : 'Already have an account? Sign in'}
          </button>
        </div>

        <p className="auth-note">Only your tasks are visible after signing in. Your data stays private to your account.</p>
      </div>
    </div>
  );
}
