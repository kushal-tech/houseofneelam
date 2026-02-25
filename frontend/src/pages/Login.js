import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      return;
    }
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Phone login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-alabaster flex items-center justify-center py-24 px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-xl" data-testid="login-container">
        <div className="text-center mb-8">
          <h1 className="font-accent text-3xl text-sapphire-deep mb-2">House of Neelam</h1>
          <p className="text-neutral-stone">Sign in to continue</p>
        </div>

        <div className="space-y-4">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border-2 border-sapphire-deep text-sapphire-deep py-3 font-medium hover:bg-sapphire-deep hover:text-white transition-all flex items-center justify-center space-x-2"
            data-testid="google-login-btn"
          >
            <Mail className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-alabaster"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-stone">or</span>
            </div>
          </div>

          {/* Phone Login Toggle */}
          {!showPhoneLogin ? (
            <button
              onClick={() => setShowPhoneLogin(true)}
              className="w-full border-2 border-gold-metallic text-sapphire-deep py-3 font-medium hover:bg-gold-metallic hover:text-white transition-all"
              data-testid="show-phone-login-btn"
            >
              Guest Checkout with Phone
            </button>
          ) : (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sapphire-deep mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border-b-2 border-neutral-alabaster focus:border-gold-metallic outline-none bg-transparent"
                  required
                  data-testid="phone-input"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold-metallic text-white py-3 font-medium hover:bg-gold-matte transition-all"
                data-testid="phone-login-submit-btn"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => setShowPhoneLogin(false)}
                className="w-full text-neutral-stone text-sm hover:text-sapphire-deep transition-colors"
              >
                Back to login options
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;