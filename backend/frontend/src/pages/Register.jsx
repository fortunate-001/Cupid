// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', { name, email, password });

      // ✅ SAFETY CHECK
      const userData = response.data?.user || response.data?.User || null;
      const authToken = response.data?.token || response.data?.Token || null;

      if (!authToken) {
        throw new Error('No token received');
      }

      localStorage.setItem('token', authToken);
      if (userData) {
        localStorage.setItem('cupidUser', JSON.stringify(userData));
      }

      navigate('/chat');
    } catch (error) {
      console.error('Register error:', error);
      setError(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>✦ Cupid AI</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>

        <div className="guest-divider">
          <span>or</span>
        </div>

        <button className="guest-btn" onClick={() => navigate('/chat')}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}