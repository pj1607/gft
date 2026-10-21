
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Chip,
  Divider,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_URL = import.meta.env.VITE_API_URL;
const INDIA_TIMEZONE = 'Asia/Kolkata';

const COLORS = {
  background: '#121212',
  white: '#FFFFFF',
  light: '#E5E5E7',
  muted: '#A1A1AA',
  surface: '#1a1a1a',
  accent: '#858080',
  red: '#B71C1C',
  success: '#183324',
  successText: '#A5D6A7',
};

function getAuthConfig() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
}

// Preserve the stored calendar date.
function formatAttendanceDate(value) {
  if (!value) return '—';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  const [, year, month, day] = match;

  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12)
  );

  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getAttendanceDay(value) {
  if (!value) return '—';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return '—';

  const [, year, month, day] = match;

  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12)
  );

  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    weekday: 'long',
  });
}

// Display check-in timestamps in Indian Standard Time.
function formatCheckInTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('en-IN', {
    timeZone: INDIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const cardStyle = {
  p: { xs: 2.5, sm: 3 },
  backgroundColor: COLORS.surface,
  color: COLORS.white,
  borderRadius: 3,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
};

const headingStyle = {
  color: COLORS.white,
  fontWeight: 700,
  letterSpacing: '-0.3px',
};

const mutedStyle = {
  color: COLORS.muted,
  fontSize: '0.875rem',
  lineHeight: 1.7,
};

function SummaryCard({ title, value, icon, accent = false }) {
  return (
    <Paper
      elevation={3}
      sx={{
        ...cardStyle,
        height: '100%',
        borderTop: accent
          ? `3px solid ${COLORS.accent}`
          : `1px solid ${COLORS.border}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: COLORS.muted,
              fontWeight: 600,
              mb: 1.5,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: COLORS.light,
              fontWeight: 750,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              overflowWrap: 'anywhere',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.055)',
            color: COLORS.light,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

export default function MemberAttendanceHistory() {
  const { memberId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get(
          `${API_URL}/attendance/member/${memberId}/history`,
          getAuthConfig()
        );

        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              'Could not load attendance history. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const member = data?.member;
  const attendance = Array.isArray(data?.attendance)
    ? data.attendance
    : [];

  const totalPresentDays = data?.totalPresentDays ?? attendance.length;

  return (
    <Box
      component="main"
      className="member-attendance-page"
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1440,
        mx: 'auto',
        minHeight: '100vh',
        boxSizing: 'border-box',
        color: COLORS.white,
        animation: 'memberHistoryFadeIn 350ms ease-out',
        '@keyframes memberHistoryFadeIn': {
          from: { opacity: 0, transform: 'translateY(5px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Navigation */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        <Button
          component={Link}
          to="/dashboard"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: COLORS.light,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.055)',
            },
          }}
        >
          Back to members
        </Button>

        <Button
          component={Link}
          to="/dashboard"
          startIcon={<DashboardIcon />}
          sx={{
            color: COLORS.muted,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              color: COLORS.white,
              backgroundColor: 'rgba(255,255,255,0.055)',
            },
          }}
        >
          Dashboard
        </Button>
      </Box>

      {/* Page heading */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            ...headingStyle,
            fontSize: { xs: '1.8rem', sm: '2.125rem' },
            mb: 1,
          }}
        >
          Attendance History
        </Typography>

        <Typography sx={mutedStyle}>
          Track gym visits and review an individual member's attendance.
        </Typography>
      </Box>

      {/* Loading state */}
      {loading && (
        <Paper
          elevation={3}
          sx={{
            ...cardStyle,
            minHeight: 250,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: COLORS.light }} />

          <Typography sx={mutedStyle}>
            Loading attendance history...
          </Typography>
        </Paper>
      )}

      {/* Error state */}
      {!loading && error && (
        <Paper
          role="alert"
          sx={{
            p: 3,
            color: '#FFB4AB',
            backgroundColor: '#351F20',
            border: '1px solid #693737',
            borderRadius: 3,
          }}
        >
          <Typography fontWeight={650} sx={{ mb: 1 }}>
            Unable to load attendance history
          </Typography>

          <Typography variant="body2">{error}</Typography>

          <Button
            onClick={() => {
              setData(null);
              setLoading(true);
              setError('');

              axios
                .get(
                  `${API_URL}/attendance/member/${memberId}/history`,
                  getAuthConfig()
                )
                .then((response) => setData(response.data))
                .catch((err) =>
                  setError(
                    err.response?.data?.message ||
                      'Could not load attendance history.'
                  )
                )
                .finally(() => setLoading(false));
            }}
            sx={{
              mt: 2,
              color: '#FFB4AB',
              textTransform: 'none',
            }}
          >
            Try again
          </Button>
        </Paper>
      )}

      {/* Member details and attendance */}
      {!loading && !error && data && member && (
        <>
          {/* Member profile */}
          <Paper elevation={3} sx={{ ...cardStyle, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.white,
                  fontSize: 25,
                  fontWeight: 750,
                }}
              >
                {(member.name || 'M').trim().charAt(0).toUpperCase()}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: COLORS.muted,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Member overview
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    ...headingStyle,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    mt: 0.5,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {member.name || 'Unnamed member'}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: COLORS.muted, mt: 0.5 }}
                >
                  Member attendance summary
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border, mb: 3 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Roll Number"
                  value={member.rollNumber || '—'}
                  icon={<BadgeIcon />}
                  accent
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Phone Number"
                  value={member.phone || '—'}
                  icon={<PhoneIcon />}
                  accent
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Total Present Days"
                  value={totalPresentDays}
                  icon={<EventAvailableIcon />}
                  accent
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Attendance history */}
          <Paper elevation={3} sx={cardStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6" sx={headingStyle}>
                  Attendance Records
                </Typography>

                <Typography sx={{ ...mutedStyle, mt: 0.5 }}>
                  Recorded visits for this member.
                </Typography>
              </Box>

              <Chip
                icon={<CheckCircleIcon />}
                label={`${attendance.length} ${
                  attendance.length === 1 ? 'record' : 'records'
                }`}
                sx={{
                  color: COLORS.light,
                  backgroundColor: 'rgba(255,255,255,0.055)',
                  border: `1px solid ${COLORS.border}`,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: COLORS.light,
                  },
                }}
              />
            </Box>

            {/* Empty state */}
            {attendance.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  px: 2,
                  textAlign: 'center',
                  backgroundColor: COLORS.background,
                  border: `1px dashed ${COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <CalendarMonthIcon
                  sx={{
                    color: COLORS.muted,
                    fontSize: 44,
                    mb: 1.5,
                  }}
                />

                <Typography
                  sx={{
                    color: COLORS.white,
                    fontWeight: 650,
                    mb: 1,
                  }}
                >
                  No attendance records yet
                </Typography>

                <Typography sx={mutedStyle}>
                  This member has no recorded visits to display.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  overflowX: 'auto',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    minWidth: 570,
                    borderCollapse: 'collapse',
                    backgroundColor: COLORS.surface,
                    '& th': {
                      textAlign: 'left',
                      px: 2,
                      py: 1.8,
                      backgroundColor: COLORS.background,
                      color: COLORS.muted,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      borderBottom: `1px solid ${COLORS.border}`,
                    },
                    '& td': {
                      px: 2,
                      py: 1.8,
                      color: COLORS.light,
                      fontSize: '0.85rem',
                      borderBottom: `1px solid ${COLORS.border}`,
                    },
                    '& tbody tr:last-child td': {
                      borderBottom: 'none',
                    },
                    '& tbody tr:hover': {
                      backgroundColor: 'rgba(255,255,255,0.035)',
                    },
                  }}
                >
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Check-in Time (IST)</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record._id}>
                        <td>{formatAttendanceDate(record.attendanceDate)}</td>

                        <td style={{ color: COLORS.muted }}>
                          {getAttendanceDay(record.attendanceDate)}
                        </td>

                        <td>{formatCheckInTime(record.checkInAt)}</td>

                        <td>
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon />}
                            label="Present"
                            sx={{
                              backgroundColor: COLORS.success,
                              color: COLORS.successText,
                              fontWeight: 650,
                              fontSize: '0.72rem',
                              '& .MuiChip-icon': {
                                color: COLORS.successText,
                                fontSize: 16,
                              },
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Box>
              </Box>
            )}

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: COLORS.muted,
                mt: 2,
                lineHeight: 1.7,
              }}
            >
              Attendance dates retain their stored calendar day. Check-in
              timestamps are displayed in Indian Standard Time (IST).
            </Typography>
          </Paper>
        </>
      )}

      {/* Consistent page footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mt: 3,
          pb: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: COLORS.muted }}>
          GFT · Gym Fee Tracker
        </Typography>

        <Typography variant="caption" sx={{ color: COLORS.muted }}>
          Member attendance
        </Typography>
      </Box>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .member-attendance-page {
            animation: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
