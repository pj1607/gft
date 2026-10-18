import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordModal from './ForgotPasswordModal.jsx';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
const API = import.meta.env.VITE_API_URL;

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';



const ProfileModal = ({ open, handleClose }) => {
  const navigate = useNavigate();
  const { username, setUsername } = useAuth(); 
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [gymName, setGymName] = useState('');
  const [upiSaving, setUpiSaving] = useState(false);
  const [feePlans, setFeePlans] = useState([]);

  const [isNameEditable, setIsNameEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  const usernameRef = useRef(null);
  const emailRef = useRef(null);

 useEffect(() => {
  if (open) {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/auth/profile`, {
          headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
  },
        });
        setUserName(data.username || '');
        setEmail(data.email || '');
        setUpiId(data.upiId || '');
        setGymName(data.gymName || '');
        setFeePlans(Array.isArray(data.feePlans) ? data.feePlans.map((plan) => ({
          name: plan.name || '', months: String(plan.months ?? 1), amount: String(plan.amount ?? ''),
        })) : []);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);  
      }
    };

    fetchProfile();
  }
}, [open]);


  useEffect(() => {
    if (isNameEditable && usernameRef.current) usernameRef.current.focus();
  }, [isNameEditable]);

  useEffect(() => {
    if (isEmailEditable && emailRef.current) emailRef.current.focus();
  }, [isEmailEditable]);

  const handleSave = async () => {
    try {
        setLoading(true);
      await axios.put(
        `${API}/auth/profile/update`,
        { username: userName, email },
        { headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  
  } }
      );
      setUsername(userName); 
      localStorage.setItem('username', userName);
    
        setSnackbar({
    open: true,
    message: 'Changes saved!',
    severity: "info",
  });
      setIsNameEditable(false);
      setIsEmailEditable(false);
      handleClose();
    } 
    catch (error) {
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


  const handleSaveUpi = async () => {
    try {
      setUpiSaving(true);
      const { data } = await axios.put(
        `${API}/auth/profile/upi`,
        { upiId, gymName, feePlans: feePlans.map((plan) => ({
          name: plan.name.trim(), months: Number(plan.months), amount: Number(plan.amount),
        })) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUpiId(data.user?.upiId || upiId.trim().toLowerCase());
      setGymName(data.user?.gymName || gymName.trim());
      setFeePlans((data.user?.feePlans || []).map((plan) => ({
        name: plan.name || '', months: String(plan.months), amount: String(plan.amount),
      })));
      setSnackbar({ open: true, message: upiId.trim() ? 'UPI details and fee plans saved.' : 'Gym fee plans saved. Add a UPI ID whenever you want to accept UPI.', severity: 'success' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Unable to save UPI details.',
        severity: 'error',
      });
    } finally {
      setUpiSaving(false);
    }
  };

  const ownerUpiUri = upiId.trim()
    ? 'upi://pay?' + new URLSearchParams({
        pa: upiId.trim().toLowerCase(),
        pn: gymName.trim() || 'Gym Fee Tracker',
        cu: 'INR',
      }).toString()
    : '';
  const ownerQrUrl = ownerUpiUri
    ? 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(ownerUpiUri)
    : '';

  return (
    <>
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '80%', sm: '450px', md: '600px' },
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: '#1a1a1a',
          color: '#fff',
          boxShadow: 24,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#fff',
            '&:hover': {
              color: '#f44336',
              transform: 'scale(1.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" textAlign="center" mb={3}>
          Profile Settings
        </Typography>

        {/* Name Field */}
        <TextField
          fullWidth
          label="Name"
          value={userName}
          inputRef={usernameRef}
          onChange={(e) => setUserName(e.target.value)}
          InputProps={{
            readOnly: !isNameEditable,
            style: { color: '#fff', cursor: isNameEditable ? 'text' : 'default' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setIsNameEditable(true)} sx={{ color: '#f44336' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ style: { color: '#ccc' } }}
          sx={{ mb: 2 }}
        />

        {/* Email Field */}
        <TextField
          fullWidth
          label="Email"
          value={email}
          inputRef={emailRef}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            readOnly: !isEmailEditable,
            style: { color: '#fff', cursor: isEmailEditable ? 'text' : 'default' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setIsEmailEditable(true)} sx={{ color: '#f44336' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ style: { color: '#ccc' } }}
          sx={{ mb: 3 }}
        />


        <Box sx={{ mt: 1, mb: 2, p: 2, border: '1px solid #444', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>Gym UPI & QR Code</Typography>
          <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
            Add your own UPI ID once. GFT saves it for future collections and refreshes your QR whenever you update these details.
          </Typography>
          <TextField
            fullWidth label="UPI ID (e.g. gymname@upi)" value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            InputProps={{ style: { color: '#fff' } }}
            InputLabelProps={{ style: { color: '#ccc' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Gym name (optional)" value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            inputProps={{ maxLength: 80 }}
            InputProps={{ style: { color: '#fff' } }}
            InputLabelProps={{ style: { color: '#ccc' } }}
          />
          {ownerQrUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>Your reusable UPI QR preview</Typography>
              <Box component="img" src={ownerQrUrl} alt="Gym reusable UPI QR code" sx={{
                width: 190, height: 190, objectFit: 'contain', bgcolor: '#fff', p: 1, borderRadius: 1,
              }} />
              <Typography variant="caption" display="block" sx={{ color: '#aaa', mt: 1 }}>
                Payment collection will prefill the amount for each member.
              </Typography>
            </Box>
          )}
          
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>Gym Membership Fee Plans</Typography>
          <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
            Create your prices, for example 1 month ₹600 or 3 months ₹2,000. When you collect a fee, GFT uses the amount to calculate the months covered automatically. Keep one 1-month plan as the base.
          </Typography>
          {feePlans.map((plan, index) => (
            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1.2fr 0.8fr 1fr auto' }, gap: 1, mb: 1.5, alignItems: 'center' }}>
              <TextField fullWidth label="Plan name" placeholder="Monthly" value={plan.name}
                onChange={(e) => setFeePlans((old) => old.map((item, i) => i === index ? { ...item, name: e.target.value } : item))}
                InputProps={{ style: { color: '#fff' } }} InputLabelProps={{ style: { color: '#ccc' } }} />
              <TextField fullWidth label="Months" type="number" value={plan.months}
                inputProps={{ min: 1, max: 36, step: 1 }}
                onChange={(e) => setFeePlans((old) => old.map((item, i) => i === index ? { ...item, months: e.target.value } : item))}
                InputProps={{ style: { color: '#fff' } }} InputLabelProps={{ style: { color: '#ccc' } }} />
              <TextField fullWidth label="Total price (₹)" type="number" value={plan.amount}
                inputProps={{ min: 1, step: '0.01' }}
                onChange={(e) => setFeePlans((old) => old.map((item, i) => i === index ? { ...item, amount: e.target.value } : item))}
                InputProps={{ style: { color: '#fff' } }} InputLabelProps={{ style: { color: '#ccc' } }} />
              <Button color="error" onClick={() => setFeePlans((old) => old.filter((_, i) => i !== index))}
                sx={{ minWidth: { xs: '100%', sm: 0 }, gridColumn: { xs: '1 / -1', sm: 'auto' }, textTransform: 'none' }}>
                Remove
              </Button>
            </Box>
          ))}
          <Button fullWidth variant="outlined" onClick={() => setFeePlans((old) => [...old, {
            name: '', months: old.some((plan) => Number(plan.months) === 1) ? '3' : '1', amount: '',
          }])} disabled={feePlans.length >= 12}
            sx={{ mt: 1, borderColor: '#777', color: '#fff', textTransform: 'none' }}>
            + Add Fee Plan
          </Button>
          {!feePlans.some((plan) => Number(plan.months) === 1) && (
            <Typography variant="caption" sx={{ color: '#ffb74d', display: 'block', mt: 1 }}>
              Add a 1-month plan. GFT uses it to calculate amounts that are not an exact package price.
            </Typography>
          )}

          <Button fullWidth variant="contained" onClick={handleSaveUpi} disabled={upiSaving || feePlans.length === 0 || !feePlans.some((plan) => Number(plan.months) === 1)}
            sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}>
            {upiSaving ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Save UPI & Fee Plans'}
          </Button>
        </Box>

        {/* Save Button */}
        <Button
          fullWidth
          onClick={handleSave}
          disabled={loading}
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #d32f2f, #b71c1c)',
            color: '#fff',
            fontWeight: 'bold',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(45deg, #b71c1c, #7f0000)',
              transform: 'scale(1.03)',
            },
            mb: 1,
          }}
        >
            {loading ?  <CircularProgress size={26}sx={{color: 'white', }}/> : 'Save Changes'}
          
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => setModalOpen(true)}
          sx={{
            borderColor: '#f44336',
            color: '#f44336',
            '&:hover': { backgroundColor: '#2a2a2a' },
          }}
        >
        Forgot or set password?
        </Button>

        <ForgotPasswordModal open={modalOpen} onClose={() => setModalOpen(false)} />
          
      </Box>
     
    </Modal>
     <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            elevation={6}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
        
        </>
  );
};

export default ProfileModal;
