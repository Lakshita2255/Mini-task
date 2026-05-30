import { useState } from 'react';

export default function AuthModal({ open, onClose, onLogin, onRegister, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');

  if (!open) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>×</button>
        <div className="auth-brand">Mini Task</div>
        <h3>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
        <p className="muted">{mode === 'login' ? 'Sign in to manage your tasks.' : 'Register to get started.'}</p>

        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {mode === 'login' ? (
            <button
              className="primary-button"
              onClick={() => onLogin(email, password)}
              disabled={loading}
            >
              Sign in
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={() => onRegister(email, password)}
              disabled={loading}
            >
              Create account
            </button>
          )}

          <button
            className="secondary-button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create account' : 'Have an account?'}
          </button>
        </div>

        <p className="auth-note muted">Your data is private to your account.</p>
      </div>
    </div>
  );
}
