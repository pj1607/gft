import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import MemberTableMobile from '../components/Dashboard/MemberTableMobile.jsx';
import MemberTableDesktop from '../components/Dashboard/MemberTableDesktop.jsx';

const Dashboardpage = () => {
  const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:1100px)');


  return isMobile ? <MemberTableMobile /> : <MemberTableDesktop />;
};

export default Dashboardpage;

