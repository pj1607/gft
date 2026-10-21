
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Chip,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';

import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const TIME_ZONE = 'Asia/Kolkata';

const COLORS = {
  background: '#121212',
  card: '#1a1a1a',
  white: '#FFFFFF',
  light: '#E5E5E7',
  muted: '#A1A1AA',
  accent: '#8B8585',
  green: '#4caf50',
  greenSoft: 'rgba(76, 175, 80, 0.13)',
  red: '#f44336',
  redSoft: 'rgba(244, 67, 54, 0.13)',
  chart: ['#8E8888', '#B7B1B1', '#666060', '#D5D0D0'],
};

function getIndiaDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function formatCheckInTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('en-IN', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatAttendanceDate(value) {
  if (!value) return '—';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  const [, year, month, day] = match;

  const calendarDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    12
  );

  return calendarDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getAuthConfig() {
  const token = localStorage.getItem('token');

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function getIndiaHour(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hourPart = parts.find((part) => part.type === 'hour');

  if (!hourPart) return null;

  return Number(hourPart.value) % 24;
}

function getTimePeriod(hour) {
  if (hour === null) return null;
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';

  return 'Night';
}

const cardStyle = {
  height: '100%',
  p: { xs: 2.5, sm: 3 },
  backgroundColor: COLORS.card,
  color: COLORS.white,
  borderRadius: 3,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  transition: 'border-color 180ms ease, transform 180ms ease',
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

const inputStyle = {
  minWidth: { xs: '100%', sm: 190 },
  '& .MuiInputLabel-root': {
    color: COLORS.muted,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: COLORS.light,
  },
  '& .MuiOutlinedInput-root': {
    color: COLORS.white,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    '& fieldset': {
      borderColor: COLORS.border,
    },
    '&:hover fieldset': {
      borderColor: '#777777',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#858080',
    },
  },
  '& input': {
    colorScheme: 'dark',
  },
};

function StatCard({ title, value, subtitle, icon, loading }) {
  return (
    <Paper elevation={3} sx={cardStyle}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ color: COLORS.muted, fontWeight: 600, mb: 1.5 }}
          >
            {title}
          </Typography>

          {loading ? (
            <CircularProgress
              size={28}
              sx={{ color: COLORS.light, my: 0.5 }}
            />
          ) : (
            <Typography
              variant="h3"
              sx={{
                color: COLORS.light,
                fontWeight: 750,
                fontSize: { xs: '2rem', sm: '2.35rem' },
                lineHeight: 1.2,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </Typography>
          )}

          <Typography
            variant="caption"
            sx={{ display: 'block', color: COLORS.muted, mt: 1.5 }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
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

export default function Attendancepage() {
  const [ownerId, setOwnerId] = useState('');
  const [date, setDate] = useState(getIndiaDate);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gymLoading, setGymLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrError, setQrError] = useState('');

  const checkInUrl = ownerId
    ? `${window.location.origin}/check-in/${ownerId}`
    : '';

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_URL}/attendance?date=${encodeURIComponent(date)}`,
        getAuthConfig()
      );

      setRecords(
        Array.isArray(response.data.attendance)
          ? response.data.attendance
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load attendance records. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    let cancelled = false;

    async function loadGymInfo() {
      setGymLoading(true);
      setQrError('');

      try {
        const response = await axios.get(
          `${API_URL}/attendance/gym-info`,
          getAuthConfig()
        );

        if (!cancelled) {
          setOwnerId(response.data.ownerId || '');
        }
      } catch (err) {
        if (!cancelled) {
          setQrError(
            err.response?.data?.message ||
              'Could not load your gym QR code.'
          );
        }
      } finally {
        if (!cancelled) {
          setGymLoading(false);
        }
      }
    }

    loadGymInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Build the chart from real check-in times returned by the API.
  const timeDistribution = useMemo(() => {
    const periods = [
      { name: 'Morning', value: 0 },
      { name: 'Afternoon', value: 0 },
      { name: 'Evening', value: 0 },
      { name: 'Night', value: 0 },
    ];

    records.forEach((record) => {
      const hour = getIndiaHour(record.checkInAt);
      const period = getTimePeriod(hour);

      if (period) {
        const item = periods.find((entry) => entry.name === period);

        if (item) item.value += 1;
      }
    });

    return periods;
  }, [records]);

  const chartHasData = timeDistribution.some((item) => item.value > 0);

  const firstCheckIn = useMemo(() => {
    const times = records
      .map((record) => new Date(record.checkInAt).getTime())
      .filter((time) => Number.isFinite(time));

    if (times.length === 0) return '—';

    return formatCheckInTime(Math.min(...times));
  }, [records]);

  const latestCheckIn = useMemo(() => {
    const times = records
      .map((record) => new Date(record.checkInAt).getTime())
      .filter((time) => Number.isFinite(time));

    if (times.length === 0) return '—';

    return formatCheckInTime(Math.max(...times));
  }, [records]);

  const handlePrint = () => {
    if (checkInUrl) {
      window.print();
    }
  };

  return (
    <Box
      className="attendance-page"
      component="main"
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1440,
        mx: 'auto',
        minHeight: '100vh',
        boxSizing: 'border-box',
        color: COLORS.white,
        animation: 'attendanceFadeIn 350ms ease-out',
        '@keyframes attendanceFadeIn': {
          from: { opacity: 0, transform: 'translateY(5px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Page heading */}
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
          <Typography
            variant="h4"
            sx={{
              ...headingStyle,
              fontSize: { xs: '1.8rem', sm: '2.125rem' },
              mb: 1,
            }}
          >
            Attendance
          </Typography>

          <Typography sx={mutedStyle}>
            Monitor daily member check-ins and manage your gym's QR check-in.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Go to Dashboard">
            <IconButton
              component={Link}
              to="/dashboard"
              aria-label="Go to dashboard"
              sx={{
                color: COLORS.light,
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 2,
                '&:hover': { backgroundColor: '#292929' },
              }}
            >
              <DashboardIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={loadAttendance}
            disabled={loading}
            sx={{
              backgroundColor: '#353535',
              color: COLORS.white,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#454545',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* Error state */}
      {error && (
        <Paper
          role="alert"
          sx={{
            p: 2,
            mb: 3,
            color: '#FFB4AB',
            backgroundColor: '#351F20',
            border: '1px solid #693737',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">{error}</Typography>
          <Button
            size="small"
            onClick={loadAttendance}
            sx={{ mt: 1, color: '#FFB4AB', textTransform: 'none' }}
          >
            Try again
          </Button>
        </Paper>
      )}

      {/* Daily overview cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Check-ins"
            value={records.length}
            subtitle={formatAttendanceDate(date)}
            icon={<GroupsIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="First Check-in"
            value={firstCheckIn}
            subtitle="Earliest recorded check-in · IST"
            icon={<AccessTimeIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Latest Check-in"
            value={latestCheckIn}
            subtitle="Most recent recorded check-in · IST"
            icon={<TrendingUpIcon />}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* QR code and check-in distribution */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* QR code */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            className="attendance-print-card"
            sx={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: COLORS.light,
                }}
              >
                <QrCode2Icon />
              </Box>

              <Box>
                <Typography variant="h6" sx={headingStyle}>
                  Gym Check-in QR
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.muted }}>
                  Scan to open the check-in page
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

            <Typography sx={{ ...mutedStyle, mb: 2 }}>
              Display this code at your gym so members can scan it and open
              your gym's check-in page.
            </Typography>

            <Box
              className="attendance-qr"
              sx={{
                flex: 1,
                minHeight: 235,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.background,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              {gymLoading ? (
                <CircularProgress sx={{ color: COLORS.light }} />
              ) : checkInUrl ? (
                <Box
                  sx={{
                    backgroundColor: '#FFFFFF',
                    p: 1.5,
                    borderRadius: 2,
                    lineHeight: 0,
                  }}
                >
                  <QRCodeSVG
                    value={checkInUrl}
                    size={180}
                    level="M"
                    includeMargin
                  />
                </Box>
              ) : (
                <Typography
                  sx={{ color: qrError ? '#FFB4AB' : COLORS.muted }}
                  variant="body2"
                  textAlign="center"
                >
                  {qrError || 'Gym QR code is not available.'}
                </Typography>
              )}
            </Box>

            {qrError && !gymLoading && (
              <Typography
                variant="caption"
                sx={{ color: '#FFB4AB', mb: 1.5 }}
              >
                {qrError}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={!checkInUrl || gymLoading}
              sx={{
                py: 1.2,
                backgroundColor: '#444040',
                color: COLORS.white,
                textTransform: 'none',
                fontWeight: 650,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#575151',
                  boxShadow: 'none',
                },
              }}
            >
              Print QR Code
            </Button>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={cardStyle}>
            <Typography variant="h6" sx={headingStyle}>
              Check-in Time Distribution
            </Typography>

            <Typography sx={{ ...mutedStyle, mt: 0.5, mb: 1 }}>
              See when members checked in on {formatAttendanceDate(date)}.
            </Typography>

            {loading ? (
              <Box
                sx={{
                  height: 300,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <CircularProgress sx={{ color: COLORS.light }} />
              </Box>
            ) : !chartHasData ? (
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 1.5,
                }}
              >
                <EventAvailableIcon
                  sx={{ fontSize: 42, color: COLORS.muted }}
                />

                <Typography sx={{ color: COLORS.light, fontWeight: 600 }}>
                  No check-in times available
                </Typography>

                <Typography sx={mutedStyle}>
                  The chart will show time distribution when records with
                  check-in times are available for this date.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 310, pt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {timeDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS.chart[index]}
                        />
                      ))}
                    </Pie>

                    <RechartsTooltip
                      formatter={(value, name) => [
                        `${value} check-in${value === 1 ? '' : 's'}`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 8,
                        color: COLORS.white,
                      }}
                      itemStyle={{ color: COLORS.light }}
                      labelStyle={{ color: COLORS.white }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span
                          style={{
                            color: COLORS.light,
                            fontSize: 12,
                            paddingLeft: 3,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}

            <Divider sx={{ borderColor: COLORS.border, my: 1.5 }} />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="caption" sx={{ color: COLORS.muted }}>
                All times use Indian Standard Time (IST).
              </Typography>

              <Chip
                size="small"
                icon={<CheckCircleIcon />}
                label="Live records"
                sx={{
                  color: COLORS.light,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  '& .MuiChip-icon': { color: COLORS.light },
                  border: `1px solid ${COLORS.border}`,
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Attendance history */}
      <Paper elevation={3} sx={{ ...cardStyle, mb: 3 }}>
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
              Attendance History
            </Typography>

            <Typography sx={{ ...mutedStyle, mt: 0.5 }}>
              Review member check-ins for a selected date.
            </Typography>
          </Box>

          <TextField
            label="Filter by date"
            type="date"
            size="small"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { max: getIndiaDate() },
            }}
            sx={inputStyle}
          />
        </Box>

        {/* Table summary */}
        <Box
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            backgroundColor: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: COLORS.muted }}>
              SELECTED DATE
            </Typography>

            <Typography
              sx={{ color: COLORS.light, fontWeight: 650, mt: 0.3 }}
            >
              {formatAttendanceDate(date)}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" sx={{ color: COLORS.muted }}>
              TOTAL CHECK-INS
            </Typography>

            <Typography
              sx={{
                color: COLORS.white,
                fontWeight: 750,
                fontSize: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              {loading ? '—' : records.length}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: COLORS.light }} />

            <Typography sx={mutedStyle}>
              Loading attendance records...
            </Typography>
          </Box>
        ) : records.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 2,
              textAlign: 'center',
              border: `1px dashed ${COLORS.border}`,
              borderRadius: 2,
              backgroundColor: COLORS.background,
            }}
          >
            <EventAvailableIcon
              sx={{ fontSize: 42, color: COLORS.muted, mb: 1.5 }}
            />

            <Typography
              sx={{ color: COLORS.white, fontWeight: 650, mb: 1 }}
            >
              No attendance records found
            </Typography>

            <Typography sx={mutedStyle}>
              There are no check-ins recorded for {formatAttendanceDate(date)}.
              Try selecting another date.
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
                minWidth: 720,
                borderCollapse: 'collapse',
                backgroundColor: COLORS.card,
                '& th': {
                  textAlign: 'left',
                  px: 2,
                  py: 1.8,
                  backgroundColor: COLORS.background,
                  color: COLORS.muted,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
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
                  <th>Roll Number</th>
                  <th>Member</th>
                  <th>Attendance Date</th>
                  <th>Check-in Time (IST)</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 650,
                          color: COLORS.light,
                        }}
                      >
                        {record.rollNumber || '—'}
                      </Typography>
                    </td>

                    <td>
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 650,
                          color: COLORS.white,
                        }}
                      >
                        {record.memberName || 'Unknown member'}
                      </Typography>

                      {record.phone && (
                        <Typography
                          sx={{
                            mt: 0.4,
                            fontSize: '0.75rem',
                            color: COLORS.muted,
                          }}
                        >
                          {record.phone}
                        </Typography>
                      )}
                    </td>

                    <td>{formatAttendanceDate(record.attendanceDate)}</td>

                    <td>{formatCheckInTime(record.checkInAt)}</td>

                    <td>
                      <Chip
                        size="small"
                        icon={<CheckCircleIcon />}
                        label="Present"
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 650,
                          backgroundColor: COLORS.greenSoft,
                          color: '#A5D6A7',
                          '& .MuiChip-icon': {
                            color: COLORS.green,
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
          sx={{ display: 'block', mt: 2, color: COLORS.muted }}
        >
          Check-in times are displayed in Indian Standard Time (IST).
        </Typography>
      </Paper>

      {/* Minimal page footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          pt: 1,
          pb: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: COLORS.muted }}>
          GFT · Gym Fee Tracker
        </Typography>

        <Typography variant="caption" sx={{ color: COLORS.muted }}>
          Your gym, better organized.
        </Typography>
      </Box>

      {/* Print only the QR code */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .attendance-qr,
          .attendance-qr * {
            visibility: visible !important;
          }

          .attendance-qr {
            position: absolute !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            border: none !important;
            background: #ffffff !important;
          }

          .attendance-qr svg {
            width: 250px !important;
            height: 250px !important;
          }

          .attendance-print-card {
            border: none !important;
            box-shadow: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .attendance-page {
            animation: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
