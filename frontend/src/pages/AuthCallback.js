import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        const hash = location.hash;
        const sessionId = hash.split('session_id=')[1]?.split('&')[0];

        if (!sessionId) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API}/auth/session?session_id=${sessionId}`, {
          withCredentials: true,
        });

        setUser(response.data);
        navigate('/', { replace: true, state: { user: response.data } });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    processSession();
  }, [location, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic mx-auto"></div>
        <p className="mt-4 text-sapphire-deep">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;