import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';

const ValueProposition = () => {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4 },
        py: { xs: 4, sm: 6 },
        color: 'white',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        mb={4}
        sx={{ fontSize: { xs: '24px', sm: '30px', md: '36px' }, color: '#fff' }}
      >
        Why Choose Gym Fee Tracker?
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 3, sm: 4 }}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        {/* Card 1 */}
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={1}
          sx={{
            maxWidth: '220px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            p: 3,
            boxShadow: '0 6px 12px rgba(255, 0, 0, 0.05)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 8px 16px rgba(255, 0, 0, 0.15)',
            },
          }}
        >
          <FitnessCenterIcon fontSize="large" color="error" />
          <Typography fontWeight="600" color="white">No More Paper Mess</Typography>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
          No more searching registers for fees.
          </Typography>
        </Stack>

        {/* Card 2 */}
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={1}
          sx={{
            maxWidth: '220px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            p: 3,
            boxShadow: '0 6px 12px rgba(255, 0, 0, 0.05)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 8px 16px rgba(255, 0, 0, 0.15)',
            },
          }}
        >
          <NotificationsActiveIcon fontSize="large" color="error" />
          <Typography fontWeight="600" color="white">Smart Fee Reminders</Typography>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            Know instantly who hasn't paid - no need to ask!
          </Typography>
        </Stack>

        {/* Card 3 */}
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={1}
          sx={{
            maxWidth: '220px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            p: 3,
            boxShadow: '0 6px 12px rgba(255, 0, 0, 0.05)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 8px 16px rgba(255, 0, 0, 0.15)',
            },
          }}
        >
          <AccessTimeIcon fontSize="large" color="error" />
          <Typography fontWeight="600" color="white">Save Time</Typography>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            Add, check, and update members in seconds.
          </Typography>
        </Stack>

        {/* Card 4 */}
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={1}
          sx={{
            maxWidth: '220px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            p: 3,
            boxShadow: '0 6px 12px rgba(255, 0, 0, 0.05)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 8px 16px rgba(255, 0, 0, 0.15)',
            },
          }}
        >
          <MobileFriendlyIcon fontSize="large" color="error" />
          <Typography fontWeight="600" color="white">Access Anywhere</Typography>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            Use it on mobile, tablet, or computer anytime.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ValueProposition;
