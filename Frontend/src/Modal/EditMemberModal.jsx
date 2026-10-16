import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EditMemberModal = ({ open, handleClose, member, onUpdate,loading }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setPhone(member.phone || '');
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onUpdate({ ...member, name, phone });
  };

  return (
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
          Edit Member
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
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{ style: { color: '#fff' } }}
          />

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
              {loading ?  <CircularProgress size={26}sx={{color: 'white', }}/> : 'Update Member'}
                                         
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default EditMemberModal;
