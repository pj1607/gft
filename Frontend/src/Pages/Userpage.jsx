import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Paper ,CircularProgress,IconButton,Tooltip as MuiTooltip, } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GridViewIcon from '@mui/icons-material/GridView';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
const API = import.meta.env.VITE_API_URL;


const Userpage = () => {
  const [summary, setSummary] = useState({ total: 0, paid: 0, unpaid: 0 });
   const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
          setLoading(true);
        const res = await axios.get( `${API}/members/summary`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
  }
});
        setSummary(res.data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      }
       finally {
    setLoading(false); 
  }
    };

    fetchSummary();
  }, []);

  const { total: totalUsers, paid: paidUsers, unpaid: unpaidUsers } = summary;

  const pieData = [
    { name: 'Paid', value: paidUsers },
    { name: 'Unpaid', value: unpaidUsers },
  ];

  const COLORS = ['#4caf50', '#f44336'];
 const { username } = useAuth();
  const AnimatedTypography = motion(Typography);

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
        <Box mb={3}>
  <Paper
    elevation={3}
    sx={{
      p: 2,
      backgroundColor: '#222',
      color: '#ddd',
      borderLeft: '4px solid #E89B4A',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        Auto Membership Status Update
      </Typography>
      <Typography variant="body2">
        Member payment statuses are automatically checked and updated every 30 days.
      </Typography>
      <Typography variant="caption" sx={{ color: '#aaa' }}>
        Next update expected: {/* logic below */}
        {(() => {
          const last = localStorage.getItem('lastUpdate') || new Date();
          const nextDate = new Date(new Date(last).getTime() + 30 * 24 * 60 * 60 * 1000);
          return nextDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
        })()}
      </Typography>
    </Box>
  </Paper>
</Box>

     <Box display="flex" alignItems="center" gap={1}>
  <AnimatedTypography
    variant="h4"
    gutterBottom
    sx={{ color: '#ffffffff' }}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
  >
    Hello{username ? `, ${username}` : ''}!
  </AnimatedTypography>

  <MuiTooltip title="Go to Dashboard">
    <IconButton component={Link} to="/dashboard" sx={{ color: '#ebe0e0ff', mt: '-4px' }}>
      <DashboardIcon  fontSize="large" />
    </IconButton>
  </MuiTooltip>
</Box>

      <Typography variant="subtitle1" gutterBottom sx={{ color: '#d8d8d8ff' }}>
     Here's a quick view of your gym fee stats.
      </Typography>

      <Grid container spacing={3} my={3}>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={4}
            sx={{
              p: 2,
              textAlign: 'center',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              borderTop: '4px solid #736b6bff',
            }}
          >
            <Typography variant="h6">Total Members</Typography>
            <Box display="flex" justifyContent="center" alignItems="center" height={40}>
  {loading ? (
    <CircularProgress size={26} sx={{ color: 'white' }} />
  ) : (
    <Typography variant="h3" sx={{ color: '#B2ACAC' }}>
      {totalUsers}
    </Typography>
  )}
</Box>

          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              borderTop: '4px solid #736b6bff'
            }}
          >
            <Typography variant="h6" mb={2}>
              Payment Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    ` ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    borderColor: '#8B0000',
                    color: '#fff',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    
    </Box>
  );
};

export default Userpage;
