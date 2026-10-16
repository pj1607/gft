// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  keyframes,
  useTheme,CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ForgotPasswordModal from '../../Modal/ForgotPasswordModal.jsx';
import {toast} from 'react-toastify'
import axios from "axios";
import { useAuth } from '../../context/AuthContext.jsx';
const API = import.meta.env.VITE_API_URL;
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';



// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
   const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [inAppBrowser, setInAppBrowser] = useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInAppBrowser = /FBAN|FBAV|Instagram|LinkedIn|Twitter|Messenger/i.test(ua);
    setInAppBrowser(isInAppBrowser);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    
  };
  

 
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const trimmedEmail = formData.email.trim();
      const trimmedPassword = formData.password.trim();

      
    if (!trimmedEmail || !trimmedPassword) {
       setSnackbar({
    open: true,
    message: 'Please fill in all the required details.',
    severity: "error",
  });
  return;
    }

    setLoading(true);
    const response = await axios.post(
       `${API}/auth/login`,
       {
      email: trimmedEmail,
      password: trimmedPassword,
    },
      { headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  
  } }
    );
    
     const { token, username } = response.data.data;

      login(token, username);
      navigate('/user', { replace: true }); 

  } catch (error) {
   
    const errormessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Something went wrong';


   setSnackbar({
  open: true,
  message: errormessage,
  severity: "error",
});
  }
  finally {
    setLoading(false); 
  }
};

  const handleDemoLogin = async () => {
  try {
     setDemoLoading(true); 
    const res = await axios.post(`${API}/auth/demo-login`, {
      headers: { "Content-Type": "application/json" }
    });

    const { token, username} = res.data.data;

    login(token, username);
    setSnackbar({
    open: true,
    message: 'Welcome as a demo user',
    severity: "success",
  });
    navigate('/user', { replace: true }); 

  

  } catch (error) {
    console.error("Demo login failed", error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Demo login failed.';
      setSnackbar({
    open: true,
    message: 'message',
    severity: "error",
  });
  }
  finally {
    setDemoLoading(false);
  }
};

  return (
     <Box>
      {/* Login */}
      <Paper
        elevation={8}
        sx={{
          p: 4,
          backgroundColor: '#1e1e1e',
          borderRadius: 3,
          color: 'white',
          animation: `${fadeIn} 0.4s ease-out`,
        }}
      >
        <Typography variant="h5" mb={3} align="center" fontWeight="bold">
          Login
        </Typography>
              {inAppBrowser && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: '#2c2c2c',
            borderRadius: 2,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            ⚠️ Continue with Google is not supported in in-app browsers (LinkedIn, Instagram, Facebook, Twitter).
          </Typography>
          <Typography variant="body2">
            You can use email & password below to register or open in Chrome/Safari for Google login.
          </Typography>
        </Box>
      )}
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
             type="email"
  autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            InputProps={{ style: { color: 'white' } }}
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { backgroundColor: '#2c2c2c' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444' },
                 '& input': {
        color: 'white',
        backgroundColor: '#2c2c2c',
      },
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px #2c2c2c inset',
        WebkitTextFillColor: 'white',
        caretColor: 'white',
      },
              },
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              style: { color: 'white' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { backgroundColor: '#2c2c2c' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444' },
              },
            }}
          />
           <Button                 type="submit"
                                  variant="contained"
                                  disabled={loading}
                                  fullWidth
                                  sx={{
                                    background: 'linear-gradient(45deg, #d32f2f, #b71c1c)',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                      background: 'linear-gradient(45deg, #b71c1c, #7f0000)',
                                      transform: 'scale(1.03)',
                                    },
                                  }}
                                >
                                  {loading ?  <CircularProgress size={26}sx={{color: 'white', }}/> : 'LOGIN'}
                                </Button>
                                <Box
  mt={2}
  display="flex"
  alignItems="center"
  justifyContent="center"
>
  <Box
    sx={{
      height: '1px',
      backgroundColor: '#444',
      flex: 1,
      mx: 2,
    }}
  />
  <Typography variant="body2" color="#aaa">or</Typography>
  <Box
    sx={{
      height: '1px',
      backgroundColor: '#444',
      flex: 1,
      mx: 2,
    }}
  />
</Box>

{/* Google Sign In Button */}
<a href={`${API}/auth/google`} style={{ textDecoration: 'none' }}>
  <Box
    mt={3}
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{
      backgroundColor: '#fff',
      color: '#333',
      borderRadius: '6px',
      px: 3,
      py: 1.2,
      width: '100%',
      maxWidth: '320px',
      mx: 'auto',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      border: '1px solid #ccc',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: '#f1f1f1',
      }
    }}
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google"
      style={{ width: 20, marginRight: 12 }}
    />
   Continue with Google
  </Box>
</a>

        </form>

        <Button
          onClick={() => setModalOpen(true)}
          sx={{
            mt: 2,
            textTransform: 'none',
            color: '#1976d2',
            fontSize: '14px',
            display: 'block',
            mx: 'auto',
          }}
        >
          Forgot Password?
        </Button>
        {/* Demo Login Button */}
<Box mt={2} display="flex" justifyContent="center">
<Button
  onClick={handleDemoLogin}
  variant="outlined"
  fullWidth
  disabled={demoLoading}
  sx={{
    maxWidth: '320px',
    borderRadius: '6px',
    fontWeight: 'bold',
    textTransform: 'none',
    borderColor: '#555',
    color: '#fff',
    backgroundColor: '#2c2c2c',
    '&:hover': {
      backgroundColor: '#333',
      borderColor: '#777',
    },
  }}
>
  {demoLoading ? (
    <CircularProgress size={24} sx={{ color: 'white' }} />
  ) : (
    "Try as Demo User"
  )}
</Button>

</Box>

        <ForgotPasswordModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </Paper>
       <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      </Box>
  );
};

export default Login;
