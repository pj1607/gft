import React from 'react';
import { Box } from '@mui/material';
import ValueProposition from '../components/Home/ValueProposition.jsx';
import ScreenShots from '../components/Home/ScreenShots.jsx';
import HeroBanner from '../components/Home/HeroBanner.jsx';



const Homepage = () => {
  return (
    <Box 
    >
      <HeroBanner />
      <ValueProposition />
      <ScreenShots />
    </Box>
  );
};

export default Homepage;
