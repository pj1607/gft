import React, { useState } from 'react';
import {
  Modal, Box, Typography, TextField, Button, IconButton, CircularProgress,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const API = import.meta.env.VITE_API_URL;

const AddMemberModal = ({ open, handleClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [status, setStatus] = useState('Paid');
  const [lastPaidDate, setLastPaidDate] = useState(dayjs());
  const [unpaidFor, setUnpaidFor] = useState('0');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(
        API + '/members/add-member',
        {
          name,
          phone,
          monthlyFee: Number(monthlyFee),
          status,
          lastPaidDate: lastPaidDate.toISOString(),
          unpaidFor,
        },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );

      if (res.data.success === 'yes') {
        setName('');
        setPhone('');
        setMonthlyFee('');
        setStatus('Paid');
        setLastPaidDate(dayjs());
        setUnpaidFor('0');
        handleClose();
        setSnackbar({ open: true, message: 'Member added successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to add member.', severity: 'error' });
      }
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Something went wrong';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { mb: 2 };
  const fieldProps = {
    InputLabelProps: { style: { color: '#ccc' } },
    InputProps: { style: { color: '#fff' } },
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: { xs: '88%', sm: '450px', md: '600px' }, maxHeight: '90vh', overflowY: 'auto',
          p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#1a1a1a', boxShadow: 24,
          borderRadius: 2, color: '#fff',
        }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" mb={2} textAlign="center">Add New Member</Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" value={name} required onChange={(e) => setName(e.target.value)} sx={fieldSx} {...fieldProps} />
            <TextField fullWidth label="Phone" value={phone} required inputProps={{ maxLength: 10 }} onChange={(e) => setPhone(e.target.value)} sx={fieldSx} {...fieldProps} />
            <TextField
              fullWidth label="Monthly Fee (₹)" type="number" value={monthlyFee} required
              inputProps={{ min: 1, step: '0.01' }}
              onChange={(e) => setMonthlyFee(e.target.value)} sx={fieldSx} {...fieldProps}
              helperText="Used to calculate how many months a payment covers."
              FormHelperTextProps={{ sx: { color: '#aaa' } }}
            />
            <TextField
              fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}
              sx={fieldSx} {...fieldProps}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#121212', color: '#fff' } } } }}
            >
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Last Paid Date" value={lastPaidDate}
                onChange={(newValue) => setLastPaidDate(newValue)} format="DD-MM-YYYY"
                sx={{ mb: 2, width: '100%' }}
                slotProps={{
                  textField: { ...fieldProps, fullWidth: true },
                  popper: { sx: { '.MuiPaper-root': { bgcolor: '#0c0c0c', color: '#fff' } } },
                }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth select label="Unpaid For (Months)" value={unpaidFor}
              onChange={(e) => setUnpaidFor(e.target.value)} sx={{ mb: 3 }} {...fieldProps}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#121212', color: '#fff' } } } }}
            >
              {[...Array(11).keys()].map((num) => (
                <MenuItem key={num} value={String(num)}>{num}</MenuItem>
              ))}
            </TextField>
            <Button type="submit" fullWidth disabled={loading || !monthlyFee || Number(monthlyFee) <= 0} sx={{
              background: 'linear-gradient(45deg, #d32f2f, #b71c1c)', color: '#fff', fontWeight: 'bold',
              '&:hover': { background: 'linear-gradient(45deg, #b71c1c, #7f0000)' },
            }}>
              {loading ? <CircularProgress size={26} sx={{ color: 'white' }} /> : 'Add Member'}
            </Button>
          </form>
        </Box>
      </Modal>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} elevation={6} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default AddMemberModal;
