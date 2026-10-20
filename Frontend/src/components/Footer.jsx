import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import Logo from '../assets/images/logo.png';


const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        color: '#ccc',
        py: 2,
        textAlign: 'center',
          fontSize: { xs: '7px', sm: '10px' },
        mt: 5,
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
        <img src={Logo} alt="Logo" width="18" height="18" style={{ borderRadius: '10px' }} />
      </Box>
    </Box>
  );
};

export default Footer;
