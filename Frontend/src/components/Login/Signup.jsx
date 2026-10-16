import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Box,
  keyframes,
  useTheme,
  CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


const API = import.meta.env.VITE_API_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success', 
});

const handleCloseSnackbar = () => {
  setSnackbar({ ...snackbar, open: false });
};


  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const trimmedEmail = formData.email.trim();
      const trimmedUsername = formData.username.trim();
      const trimmedPassword = formData.password.trim();
      const trimmedConfirmPassword = formData.confirmPassword.trim();

        if (!trimmedEmail || !trimmedUsername || !trimmedPassword || !trimmedConfirmPassword ){
       setSnackbar({
    open: true,
    message: 'Please fill in all the required details.',
    severity: "error",
  });
  return;
    }

if (trimmedPassword !== trimmedConfirmPassword) {
  setSnackbar({
    open: true,
    message: "Passwords do not match.",
    severity: "error",
  });
  return;
}

      setLoading(true);
      const response = await axios.post(`${API}/auth/signup`, {
        email: trimmedEmail,
        username: trimmedUsername,
        password: trimmedPassword,
        confirmpassword: trimmedConfirmPassword,
      });

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

    } finally {
      setLoading(false);
    }
  };

  return (
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
      <Typography variant="h5" fontWeight="bold" align="center" mb={3}>
        Register
      </Typography>

      <form onSubmit={handleSignup}>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="username"
          type="name"
          autoComplete="name"
          value={formData.username}
          onChange={handleChange}
          variant="outlined"
          sx={fieldStyle}
        />
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
          sx={fieldStyle}
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
          sx={fieldStyle}
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
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          variant="outlined"
          sx={fieldStyle}
          InputProps={{
            style: { color: 'white' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirm(!showConfirm)}
                  edge="end"
                  sx={{ color: 'white' }}
                >
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ style: { color: '#aaa' } }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          sx={{
            background: 'linear-gradient(45deg, #d32f2f, #b71c1c)',
            color: '#fff',
            fontWeight: 'bold',
            transition: 'all 0.3s ease-in-out',
            mt: 2,
            '&:hover': {
              background: 'linear-gradient(45deg, #b71c1c, #7f0000)',
              transform: 'scale(1.03)',
            },
          }}
        >
          {loading ? <CircularProgress size={26} sx={{ color: 'white' }} /> : 'REGISTER'}
        </Button>
      </form>
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

    </Paper>
    
  );
};

const fieldStyle = {
  input: { color: 'white', backgroundColor: '#2c2c2c' },
  label: { color: '#aaa' },
   '& label.Mui-focused': { color: '#d8c7b2' }, 
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
};

export default Signup;
