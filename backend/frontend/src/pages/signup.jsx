// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', { name, email, password });

      const userData = response.data?.user || response.data?.User || null;
      const authToken = response.data?.token || response.data?.Token || null;

      if (!authToken) {
        throw new Error('No token received');
      }

      localStorage.setItem('cupidToken', authToken);
      if (userData) {
        localStorage.setItem('cupidUser', JSON.stringify(userData));
      }

      navigate('/chat');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.error || error.message || 'Signup failed');
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

        <form onSubmit={handleSignup}>
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
            {loading ? 'Creating account...' : 'Sign Up'}
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