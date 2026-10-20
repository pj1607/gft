
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const INDIA_TIMEZONE = 'Asia/Kolkata';

const COLORS = {
  background: '#1C1C1E',
  white: '#FFFFFF',
  light: '#E5E5E7',
  red: '#B71C1C',
  slate: '#37474F',
  muted: '#A1A1AA',
  border: '#353538',
  surface: '#242426',
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

const styles = {
  page: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '32px 20px 48px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    color: COLORS.white,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  eyebrow: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
  },

  title: {
    color: COLORS.white,
    fontSize: 'clamp(28px, 4vw, 36px)',
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
    margin: 0,
    fontWeight: 750,
  },

  muted: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 1.7,
  },

  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 'clamp(20px, 3vw, 27px)',
  },

  tableCell: {
    textAlign: 'left',
    padding: '16px 18px',
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: 'nowrap',
    fontSize: 13,
  },
};

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
            err.response?.data?.message ??
              'Could not load attendance history.'
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

  return (
    <main style={styles.page}>
      {/* Back navigation */}
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: COLORS.light,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 28,
        }}
      >
        <span style={{ color: '#ef9a9a', fontSize: 17 }}>←</span>
        Back to members
      </Link>

      {/* Page heading */}
      <header style={{ marginBottom: 28 }}>
        <p style={styles.eyebrow}>Member overview</p>

        <h1 style={styles.title}>Attendance history</h1>

        <p style={{ ...styles.muted, margin: '10px 0 0' }}>
          Track gym visits and review this member's attendance records.
        </p>
      </header>

      {/* Loading state */}
      {loading && (
        <section
          style={{
            ...styles.card,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <p style={{ ...styles.muted, margin: 0 }}>
            Loading attendance history…
          </p>
        </section>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          style={{
            padding: '16px 18px',
            borderRadius: 12,
            background: '#3B2022',
            border: '1px solid #6b3030',
            color: '#FFB4AB',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {error}
        </div>
      )}

      {/* Member details and attendance */}
      {!loading && !error && data && (
        <>
          <section
            style={{
              ...styles.card,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                marginBottom: 25,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 54,
                  height: 54,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 15,
                  background: 'rgba(183,28,28,0.15)',
                  border: '1px solid rgba(183,28,28,0.45)',
                  color: COLORS.white,
                  fontSize: 23,
                  fontWeight: 750,
                }}
              >
                {(data.member.name || 'M').trim().charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <p style={styles.eyebrow}>Member details</p>

                <h2
                  style={{
                    color: COLORS.white,
                    fontSize: 23,
                    letterSpacing: '-0.035em',
                    margin: 0,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {data.member.name}
                </h2>

                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: 13,
                    margin: '7px 0 0',
                  }}
                >
                  Your member attendance summary
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: 16,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  background: COLORS.background,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: 11,
                    fontWeight: 650,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 10px',
                  }}
                >
                  Roll number
                </p>

                <strong
                  style={{
                    color: COLORS.light,
                    fontSize: 16,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {data.member.rollNumber || '—'}
                </strong>
              </div>

              <div
                style={{
                  padding: 16,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  background: COLORS.background,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: 11,
                    fontWeight: 650,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 10px',
                  }}
                >
                  Phone number
                </p>

                <strong
                  style={{
                    color: COLORS.light,
                    fontSize: 15,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {data.member.phone || '—'}
                </strong>
              </div>

              <div
                style={{
                  padding: 16,
                  border: '1px solid rgba(183,28,28,0.45)',
                  borderRadius: 12,
                  background: 'rgba(183,28,28,0.09)',
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    color: '#d9a0a0',
                    fontSize: 11,
                    fontWeight: 650,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 7px',
                  }}
                >
                  Total present days
                </p>

                <strong
                  style={{
                    color: COLORS.white,
                    fontSize: 29,
                    letterSpacing: '-0.04em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {data.totalPresentDays}
                </strong>
              </div>
            </div>
          </section>

          {/* Attendance table */}
          <section style={styles.card}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 22,
              }}
            >
              <div>
                <p style={styles.eyebrow}>Visit records</p>

                <h2
                  style={{
                    fontSize: 21,
                    letterSpacing: '-0.035em',
                    color: COLORS.white,
                    margin: 0,
                  }}
                >
                  Present attendance
                </h2>

                <p style={{ ...styles.muted, margin: '7px 0 0', fontSize: 13 }}>
                  All check-in times are displayed in IST.
                </p>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  background: COLORS.background,
                  color: COLORS.light,
                  fontSize: 12,
                  fontWeight: 650,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: COLORS.red,
                  }}
                />
                {data.attendance.length}{' '}
                {data.attendance.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {data.attendance.length === 0 ? (
              <div
                style={{
                  padding: '44px 18px',
                  textAlign: 'center',
                  background: COLORS.background,
                  border: `1px dashed ${COLORS.border}`,
                  borderRadius: 12,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 48,
                    height: 48,
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 15px',
                    borderRadius: 14,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surface,
                    color: COLORS.light,
                    fontSize: 24,
                  }}
                >
                  ◷
                </div>

                <h3
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    margin: '0 0 8px',
                  }}
                >
                  No attendance records yet
                </h3>

                <p
                  style={{
                    ...styles.muted,
                    margin: 0,
                    fontSize: 13,
                  }}
                >
                  This member has no recorded attendance to display.
                </p>
              </div>
            ) : (
              <div
                style={{
                  overflowX: 'auto',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                }}
              >
                <table
                  style={{
                    width: '100%',
                    minWidth: 570,
                    borderCollapse: 'collapse',
                    background: COLORS.surface,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: COLORS.background,
                        color: COLORS.muted,
                      }}
                    >
                      {['Date', 'Day', 'Check-in time (IST)', 'Status'].map(
                        (heading) => (
                          <th
                            key={heading}
                            style={{
                              ...styles.tableCell,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {data.attendance.map((record) => (
                      <tr key={record._id}>
                        <td
                          style={{
                            ...styles.tableCell,
                            color: COLORS.light,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatAttendanceDate(record.attendanceDate)}
                        </td>

                        <td
                          style={{
                            ...styles.tableCell,
                            color: COLORS.muted,
                          }}
                        >
                          {getAttendanceDay(record.attendanceDate)}
                        </td>

                        <td
                          style={{
                            ...styles.tableCell,
                            color: COLORS.light,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatCheckInTime(record.checkInAt)}
                        </td>

                        <td style={styles.tableCell}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '6px 10px',
                              borderRadius: 20,
                              background: COLORS.success,
                              color: COLORS.successText,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: COLORS.successText,
                              }}
                            />
                            Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p
              style={{
                color: COLORS.muted,
                fontSize: 11,
                lineHeight: 1.6,
                margin: '17px 0 0',
              }}
            >
              Attendance dates retain their recorded calendar day. Check-in
              timestamps are formatted for Indian Standard Time (IST).
            </p>
          </section>
        </>
      )}

      <footer
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          color: COLORS.muted,
          fontSize: 11,
        }}
      >
        <span>GFT · Gym Fee Tracker</span>
        <span>Member attendance</span>
      </footer>
    </main>
  );
}
