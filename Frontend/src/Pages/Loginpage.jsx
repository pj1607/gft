import React from 'react';
import { Box } from '@mui/material';
import Login from '../components/Login/Login.jsx';
import Signup from '../components/Login/Signup.jsx';

const Loginpage= () => {
  return (
     <Box
      sx={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',

          maxWidth: 400,
        }}
      >
        <Login />
      </Box>

      <Box
        sx={{
          width: '2px',
          height: { xs: 0, md: '60%' },
          backgroundColor: '#333',
          display: { xs: 'none', md: 'block' },
        }}
      />
      <Box
        sx={{

          width: '100%',
          maxWidth: 400,
        }}
      >
        <Signup />
      </Box>
    </Box>
  );
};

export default Loginpage;
