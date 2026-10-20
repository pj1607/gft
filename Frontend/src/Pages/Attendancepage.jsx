
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = import.meta.env.VITE_API_URL;
const TIME_ZONE = 'Asia/Kolkata';

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

  // Treat YYYY-MM-DD as a calendar date, not a UTC timestamp.
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
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getAuthConfig() {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

const styles = {
  page: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '32px 20px 48px',
    color: '#2c2e30',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  eyebrow: {
    color: '#8b9bb4',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
  },
  title: {
    fontSize: 'clamp(27px, 4vw, 36px)',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
    margin: 0,
    color: '#f8fafc',
  },
  muted: {
    color: '#91a0b5',
    fontSize: 14,
    lineHeight: 1.7,
  },
  card: {
    background: '#171717',
    border: '1px solid #263142',
    borderRadius: 16,
    padding: 24,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '1px solid #344258',
    borderRadius: 9,
    padding: '10px 14px',
    background: '#080808',
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 8,
    padding: '11px 12px',
    border: '1px solid #344258',
    borderRadius: 9,
    background: '#1d1e1f',
    color: '#f1f5f9',
    fontSize: 14,
    colorScheme: 'dark',
  },
  tableCell: {
    textAlign: 'left',
    padding: '15px 18px',
    borderBottom: '1px solid #263142',
    whiteSpace: 'nowrap',
  },
};

export default function Attendancepage() {
  const [ownerId, setOwnerId] = useState('');
  const [date, setDate] = useState(getIndiaDate);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      setRecords(response.data.attendance ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'Could not load attendance.'
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    let cancelled = false;

    async function loadGym() {
      try {
        const response = await axios.get(
          `${API_URL}/attendance/gym-info`,
          getAuthConfig()
        );

        if (!cancelled) {
          setOwnerId(response.data.ownerId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ?? 'Could not load gym QR code.'
          );
        }
      }
    }

    loadGym();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  return (
    <main style={styles.page}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div>
          <p style={styles.eyebrow}>Gym management</p>
          <h1 style={styles.title}>Attendance</h1>
          <p style={{ ...styles.muted, margin: '10px 0 0' }}>
            Track member check-ins and manage your gym's daily attendance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAttendance}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <span aria-hidden="true">{loading ? '◌' : '↻'}</span>
          {loading ? 'Refreshing…' : 'Refresh records'}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: '13px 16px',
            marginBottom: 22,
            borderRadius: 10,
            border: '1px solid #4a393b',
            background: '#534b4e',
            color: '#ffb4bc',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          ...styles.card,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
          gap: 28,
          alignItems: 'center',
          marginBottom: 28,
        }}
      >
        <div>
          <p style={styles.eyebrow}>Quick check-in</p>
          <h2
            style={{
              margin: '0 0 10px',
              color: '#f8fafc',
              fontSize: 21,
              letterSpacing: '-0.025em',
            }}
          >
            Your gym QR code
          </h2>

          <p style={{ ...styles.muted, maxWidth: 400, margin: '0 0 18px' }}>
            Members can scan this code to open the check-in page and enter
            their registered details. Each member can check in once per day.
          </p>

          {checkInUrl && (
            <button
              type="button"
              onClick={() => window.print()}
              style={styles.button}
            >
              Print QR code
            </button>
          )}
        </div>

        <div
          className="attendance-qr"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 220,
          }}
        >
          {checkInUrl ? (
            <div
              style={{
                background: '#ffffff',
                padding: 16,
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              }}
            >
              <QRCodeSVG
                value={checkInUrl}
                size={184}
                level="M"
                includeMargin
              />
            </div>
          ) : (
            <p style={styles.muted}>Loading gym QR code…</p>
          )}
        </div>
      </section>

      <section style={styles.card}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 22,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 21,
                letterSpacing: '-0.025em',
                color: '#f8fafc',
              }}
            >
              Attendance history
            </h2>

            <p style={{ ...styles.muted, margin: '7px 0 0' }}>
              Check-in times are displayed in Indian Standard Time (IST).
            </p>
          </div>

          <div style={{ minWidth: 190 }}>
            <label
              htmlFor="attendance-date"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#b6c2d2',
              }}
            >
              Filter by date
            </label>

            <input
              id="attendance-date"
              type="date"
              value={date}
              max={getIndiaDate()}
              onChange={(event) => setDate(event.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              background: '#192a25',
              border: '1px solid #285344',
              color: '#8de0b8',
              padding: '5px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {records.length} {records.length === 1 ? 'check-in' : 'check-ins'}
          </span>

          <span style={{ color: '#8290a4', fontSize: 12 }}>
            {formatAttendanceDate(date)}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '42px 16px', textAlign: 'center' }}>
            <p style={{ color: '#cbd5e1', margin: 0 }}>
              Loading attendance records…
            </p>
          </div>
        ) : records.length === 0 ? (
          <div
            style={{
              padding: '44px 18px',
              textAlign: 'center',
              border: '1px dashed #344258',
              borderRadius: 12,
              background: '#0d131d',
            }}
          >
            <div
              aria-hidden="true"
              style={{ fontSize: 28, marginBottom: 12, color: '#7f8da3' }}
            >
              ◷
            </div>

            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 16,
                color: '#e2e8f0',
              }}
            >
              No check-ins found
            </h3>

            <p style={{ ...styles.muted, margin: 0 }}>
              There are no attendance records for {formatAttendanceDate(date)}.
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              border: '1px solid #263142',
              borderRadius: 11,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: '#171f2c', color: '#aab7c9' }}>
                  <th style={styles.tableCell}>Roll number</th>
                  <th style={styles.tableCell}>Member</th>
                  <th style={styles.tableCell}>Attendance date</th>
                  <th style={styles.tableCell}>Check-in time (IST)</th>
                  <th style={styles.tableCell}>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td
                      style={{
                        ...styles.tableCell,
                        color: '#aebbd0',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {record.rollNumber || '—'}
                    </td>

                    <td style={styles.tableCell}>
                      <span
                        style={{
                          display: 'block',
                          color: '#f1f5f9',
                          fontWeight: 600,
                        }}
                      >
                        {record.memberName || 'Unknown member'}
                      </span>

                      {record.phone && (
                        <span
                          style={{
                            display: 'block',
                            color: '#8190a5',
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          {record.phone}
                        </span>
                      )}
                    </td>

                    <td
                      style={{
                        ...styles.tableCell,
                        color: '#b7c3d4',
                      }}
                    >
                      {formatAttendanceDate(record.attendanceDate)}
                    </td>

                    <td
                      style={{
                        ...styles.tableCell,
                        color: '#e2e8f0',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCheckInTime(record.checkInAt)}
                    </td>

                    <td style={styles.tableCell}>
                      <span
                        style={{
                          display: 'inline-block',
                          border: '1px solid #285344',
                          background: '#192a25',
                          color: '#8de0b8',
                          padding: '5px 9px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer
        style={{
          marginTop: 18,
          textAlign: 'right',
          color: '#748197',
          fontSize: 11,
        }}
      >
        All attendance times are shown in IST (UTC+05:30).
      </footer>

      <style>{`
        @media print {
          body {
            background: white !important;
          }

          .attendance-qr {
            break-inside: avoid;
          }

          button,
          input,
          footer {
            display: none !important;
          }

          main {
            color: black !important;
          }
        }

        @media (max-width: 600px) {
          .attendance-qr svg {
            max-width: 100%;
            height: auto;
          }
        }
      `}</style>
    </main>
  );
}
