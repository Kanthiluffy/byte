import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      loginWithToken(token);
      navigate('/dashboard');
    } else if (error) {
      console.error('Authentication error:', error);
      navigate('/login');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="loading-container">
      <div className="loading-spinner">
        Authenticating...
      </div>
    </div>
  );
};

export default AuthCallback;
