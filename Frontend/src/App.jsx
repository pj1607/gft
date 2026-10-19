import React from 'react';
import { Box } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Homepage.jsx';
import Dashboard from './Pages/Dashboardpage.jsx';
import Login from './Pages/Loginpage.jsx';
import User from './Pages/Userpage.jsx';
import Attendancepage from './Pages/Attendancepage.jsx';
import CheckInpage from './Pages/CheckInpage.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import OAuthSuccess from './Pages/OAuthSuccess.jsx';
import axios from 'axios';
import './style.css';

axios.defaults.withCredentials = true;

export const App = () => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <Navbar />

        <Box
          sx={{
            flex: 1,
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            padding: 0,
          }}
        >
          <Routes>
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Public pages */}
            <Route
              path="/check-in/:ownerId"
              element={<CheckInpage />}
            />
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Owner-only pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendancepage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </>
  );
};

export default App;
