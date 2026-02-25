import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        `${API}/admin/login`,
        { email, password },
        { withCredentials: true }
      );
      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-admin-card p-8 border border-admin-text-secondary/20" data-testid="admin-login-container">
        <div className="text-center mb-8">
          <h1 className="font-accent text-3xl text-gold-metallic mb-2">House of Neelam</h1>
          <p className="text-admin-text-secondary">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@houseofneelam.com"
              className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
              required
              data-testid="admin-email-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
              required
              data-testid="admin-password-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-metallic text-white py-3 font-medium hover:bg-gold-matte transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            data-testid="admin-login-btn"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-admin-text-secondary mt-6 text-center">
          Default: admin@houseofneelam.com / admin123
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;