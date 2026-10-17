import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, IconButton, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EditMemberModal = ({ open, handleClose, member, onUpdate, loading }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setPhone(member.phone || '');
      setMonthlyFee(member.monthlyFee ? String(member.monthlyFee) : '');
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !monthlyFee || Number(monthlyFee) <= 0) return;
    onUpdate({ ...member, name, phone, monthlyFee: Number(monthlyFee) });
  };

  const fieldProps = {
    InputLabelProps: { style: { color: '#ccc' } },
    InputProps: { style: { color: '#fff' } },
    sx: { mb: 2 },
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '88%', sm: '450px', md: '600px' }, p: { xs: 2, sm: 3, md: 4 },
        bgcolor: '#1a1a1a', boxShadow: 24, borderRadius: 2, color: '#fff',
      }}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" mb={2} textAlign="center">Edit Member</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Name" value={name} required onChange={(e) => setName(e.target.value)} {...fieldProps} />
          <TextField fullWidth label="Phone" value={phone} required inputProps={{ maxLength: 10 }} onChange={(e) => setPhone(e.target.value)} {...fieldProps} />
          <TextField
            fullWidth label="Monthly Fee (₹)" type="number" value={monthlyFee} required
            inputProps={{ min: 1, step: '0.01' }}
            onChange={(e) => setMonthlyFee(e.target.value)} {...fieldProps}
            helperText="The fee is used to auto-calculate months covered by payments."
            FormHelperTextProps={{ sx: { color: '#aaa' } }}
          />
          <Button type="submit" fullWidth disabled={loading || !monthlyFee || Number(monthlyFee) <= 0} sx={{
            background: 'linear-gradient(45deg, #d32f2f, #b71c1c)', color: '#fff', fontWeight: 'bold',
            '&:hover': { background: 'linear-gradient(45deg, #b71c1c, #7f0000)' },
          }}>
            {loading ? <CircularProgress size={26} sx={{ color: 'white' }} /> : 'Update Member'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default EditMemberModal;
