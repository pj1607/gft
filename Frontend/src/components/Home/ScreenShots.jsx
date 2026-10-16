import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import Screenshot1 from '../../assets/images/responsiveinterface.png';
import Screenshot2 from '../../assets/images/dashboard.png';
import Screenshot3 from '../../assets/images/addmember.png';

const ScreenShots = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 6, px: 3 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        color="#fff"
        mb={4}
      >
        Simplify Gym Fee Tracking with Smart UI
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* Card 1 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              maxWidth:{ xs:'250px',sm:'300px'},
              background: 'linear-gradient(to right, #000000, #1a1a1a )',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
              color: '#fff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardMedia
              component="img"
              image={Screenshot1}
              alt="Mobile-Friendly Cards"
              sx={{
                objectFit: 'contain',
                maxHeight: { xs: 250, sm: 300, md: 320 },
                width: '100%',
                backgroundColor: '#000',

              }}
            />
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Mobile-Friendly Interface
              </Typography>
              <Typography variant="body2" color="#ccc">
              Manage members on any device with a fully responsive design. Track and update payments directly from your phone.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
               maxWidth:{ xs:'400px',sm:'500px'},
              background: 'linear-gradient(to right, #000000, #1a1a1a )',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
              color: '#fff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardMedia
              component="img"
              image={Screenshot2}
              alt="Admin Dashboard View"
              sx={{
                objectFit: 'contain',
                maxHeight: { xs: 250, sm: 300, md: 320 },
                width: '100%',
                 background: 'linear-gradient(to right, #000000, #1a1a1a )',
              }}
            />
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Admin Dashboard View
              </Typography>
              <Typography variant="body2" color="#ccc">
                Track all members in a powerful table layout with filters,
                actions, mark payments, delete or undo actions, and auto-update unpaid status monthly. Easily search and filter by name or payment status.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
               maxWidth:{ xs:'400px',sm:'500px'},
              background: 'linear-gradient(to right, #000000, #1a1a1a )',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
              color: '#fff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardMedia
              component="img"
              image={Screenshot3}
              alt="Add Member Instantly"
              sx={{
                objectFit: 'contain',
                maxHeight: { xs: 250, sm: 300, md: 320 },
                width: '100%',
                backgroundColor: '#000',
              }}
            />
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Add Member Instantly
              </Typography>
              <Typography variant="body2" color="#ccc">
                Add new members quickly with our modern modal form. Auto-update
                all data fields seamlessly.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box textAlign="center" mt={6}>
        <Button
          onClick={() => navigate('/login')}
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
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Box>
  );
};

export default ScreenShots;
