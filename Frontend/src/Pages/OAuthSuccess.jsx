import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');

    if (token ) {
       localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/login'); 
    }
  }, []);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;
