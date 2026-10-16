import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  MenuItem,Divider 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DesktopDatePicker , LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


const API = import.meta.env.VITE_API_URL;

const AddMemberModal = ({ open, handleClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Paid');
  const [lastPaidDate, setLastPaidDate] = useState(dayjs());
  const [unpaidFor, setUnpaidFor] = useState('0');
  const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });
  
const handleCloseSnackbar = () => {
  setSnackbar({ ...snackbar, open: false });
};



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/members/add-member`,
        {
          name,
          phone,
          status,
          lastPaidDate: lastPaidDate.toISOString(),
          unpaidFor,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success === 'yes') {
        setName('');
        setPhone('');
        setStatus('Paid');
        setLastPaidDate(dayjs());
        setUnpaidFor('0');
        handleClose();
  
         setSnackbar({
  open: true,
  message: "member added successfully",
  severity: "success",
});

      } else {
       
        setSnackbar({
  open: true,
  message:'Failed to add member.',
  severity: "error",
});
      }
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
          boxShadow: 24,
          borderRadius: 2,
          color: '#fff',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#fff',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.2)',
              color: '#f44336',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" mb={2} textAlign="center">
          Add New Member
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{ style: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            label="Phone"
            variant="outlined"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{ style: { color: '#fff' } }}
          />

<TextField
  fullWidth
  select
  label="Status"
  variant="outlined"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  sx={{ mb: 2 }}
  InputLabelProps={{ style: { color: '#ccc' } }}
  InputProps={{ style: { color: '#fff' } }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        sx: {
          backgroundColor: '#121212',
          color: '#ffffff',
          '& .MuiMenuItem-root': {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: '#1f1f1f',
            },
            '&.Mui-selected': {
              backgroundColor: '#263238',
              '&:hover': {
                backgroundColor: '#37474f',
              },
            },
          },
        },
      },
    },
  }}
>
  <MenuItem value="Paid">Paid</MenuItem>
  <MenuItem value="Unpaid">Unpaid</MenuItem>
</TextField>

<LocalizationProvider dateAdapter={AdapterDayjs}>
  <DesktopDatePicker 
    label="Last Paid Date"
    value={lastPaidDate}
    onChange={(newValue) => setLastPaidDate(newValue)}
    format="DD-MM-YYYY"
    sx={{ mb: 2, width: '100%' }}
    slotProps={{
      textField: {
        variant: 'outlined',
        InputLabelProps: { style: { color: '#ccc' } },
        InputProps: {
          style: { color: '#fff' },
          sx: {
            '& .MuiSvgIcon-root': {
              color: '#ffffff',
            },
          },
        },
      },
      day: {
        sx: {
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1f1f1f',
          },
        },
      },
      popper: {
        sx: {
          '.MuiPaper-root': {
            bgcolor: '#0c0c0cff',
            color: '#ffffffff',
            border: '1px solid #333',
          },
          '.MuiDayCalendar-weekDayLabel': {
            color: '#f9efefff',
            fontWeight: 'bold',
          },
          '.MuiPickersArrowSwitcher-root': {
            color: '#ff5252',
          },
          '.MuiPickersArrowSwitcher-button': {
            color: '#ff5252',
            '&:hover': {
              color: '#ff867c',
              backgroundColor: '#2c0000',
            },
            '& svg': {
              fontSize: '2rem',
            },
          },
          '.MuiPickersDay-today': {
            backgroundColor: '#f60b0bff',
            color: '#ffffff',
          },
          '.MuiPickersCalendarHeader-switchViewIcon': {
  color: '#ffffff',
},

        },
      },
    }}
  />
</LocalizationProvider>


<TextField
  fullWidth
  select
  label="Unpaid For (Months)"
  variant="outlined"
  value={unpaidFor}
  onChange={(e) => setUnpaidFor(e.target.value)}
  sx={{ mb: 3 }}
  InputLabelProps={{ style: { color: '#ccc' } }}
  InputProps={{ style: { color: '#fff' } }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        sx: {
          backgroundColor: '#121212',
          color: '#ffffff',
          '& .MuiMenuItem-root': {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: '#1f1f1f',
            },
            '&.Mui-selected': {
              backgroundColor: '#263238',
              '&:hover': {
                backgroundColor: '#37474f',
              },
            },
          },
        },
      },
    },
  }}
>
  {[...Array(11).keys()].map((num) => (
    <MenuItem key={num} value={String(num)}>
      {num}
    </MenuItem>
  ))}
</TextField>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
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
            {loading ? (
              <CircularProgress size={26} sx={{ color: 'white' }} />
            ) : (
              'Add Member'
            )}
          </Button>
        </form>
   

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

export default AddMemberModal;
