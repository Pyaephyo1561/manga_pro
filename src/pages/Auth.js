import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginWithGoogle, registerWithEmail, loginWithEmail } from '../services/authService';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (e) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-dark-900 mb-4 text-center">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-dark-700 mb-1">Display name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="search-input" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="block text-sm text-dark-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="search-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-dark-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="search-input" placeholder="********" />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Register')}</button>
        </form>

        <div className="mt-4">
          <button onClick={handleGoogle} disabled={loading} className="w-full bg-dark-900 hover:bg-dark-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            {loading ? 'Please wait…' : 'Continue with Google'}
          </button>
        </div>

        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <button onClick={() => setMode('register')} className="text-primary-600 hover:text-primary-700">No account? Register</button>
          ) : (
            <button onClick={() => setMode('login')} className="text-primary-600 hover:text-primary-700">Have an account? Login</button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;


