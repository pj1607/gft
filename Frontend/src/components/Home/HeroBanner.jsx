import React from 'react';
import { Box, Typography, Stack,Button } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import { useNavigate } from 'react-router-dom';

const HeroWithSteps = () => {
  const navigate = useNavigate();
  return (

    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', xl: 'row' },
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 6 },
          background: 'linear-gradient(to right, #000, rgb(39, 37, 37))',
          color: '#fff',
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: '28px', sm: '36px', md: '48px'} }}
        >
          Gym Fee Tracker 
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            fontSize: { xs: '14px', sm: '16px' },
            color: '#ccc',
          }}
        >
          Track your gym members and their payment status.
          <br />
          Go digital - skip the register!
        </Typography>
        <Box>
          
       <Button                 type="submit"
                                 onClick={() => navigate('/login')}
                                  variant="contained"
                                  size="large"
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
                                  Login
                                </Button>
        </Box>
      </Box>

      {/* Right Section */}
      <Box sx={{ flex: 1.2, display: 'flex', flexDirection: 'row' }}>
        
        {/* Step 1 */}
        <Box sx={{ flex: 1, backgroundColor: '#8B0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems="center" textAlign="center" spacing={1}
            sx={{
              maxWidth:{ xs:'125px',sm:'250px'},
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}>
            <PersonAddAltIcon fontSize="large" color="error" />
            <Typography fontWeight="600" color='white'>1. Add Members</Typography>
           <Typography
  variant="body2"
  sx={{
    color: '#ccc',
    lineHeight: 1.6,
    display: { xs: 'block', sm: 'none' }
  }}
>
 Create a member profile.
</Typography>
<Typography
  variant="body2"
  sx={{
    color: '#ccc',
    fontSize: '14px',
    lineHeight: 1.6,
    display: { xs: 'none', sm: 'block' }
  }}
>
  Enter member details and start tracking.
</Typography>

          </Stack>
        </Box>

        {/* Step 2 */}
        <Box sx={{ flex: 1, backgroundColor: '#1a1a1a ', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems="center" textAlign="center" spacing={1}
            sx={{
             maxWidth:{ xs:'125px',sm:'250px'},
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}>
            <CheckCircleOutlineIcon fontSize="large" color="error" />
            <Typography fontWeight="600" color='white'>2. Mark Payments</Typography>
            <Typography
  variant="body2"
  sx={{
    color: '#ccc',
    lineHeight: 1.6,
    display: { xs: 'block', sm: 'none' }
  }}
>
 Mark members as paid.
</Typography>
<Typography
  variant="body2"
  sx={{
    color: '#ccc',
    fontSize: '14px',
    lineHeight: 1.6,
    display: { xs: 'none', sm: 'block' }
  }}
>
  Mark who has paid and who hasn't - instantly.
</Typography>

          </Stack>
        </Box>

        {/* Step 3 */}
        <Box sx={{ flex: 1, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems="center" textAlign="center" spacing={1}
            sx={{
           maxWidth:{ xs:'125px',sm:'250px'},
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}>
            <InsightsIcon fontSize="large" color="error" />
            <Typography fontWeight="600" color='white'>3. Stay Informed</Typography>
            <Typography
  variant="body2"
  sx={{
    color: '#ccc',
    lineHeight: 1.6,
    display: { xs: 'block', sm: 'none' }
  }}
>
  	  See who hasn’t paid.&nbsp;
</Typography>
<Typography
  variant="body2"
  sx={{
    color: '#ccc',
    fontSize: '14px',
    lineHeight: 1.6,
    display: { xs: 'none', sm: 'block' }
  }}
>
  Get a clear view of payment status.
</Typography>

          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroWithSteps;
