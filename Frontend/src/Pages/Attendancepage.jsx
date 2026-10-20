
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = import.meta.env.VITE_API_URL;
const TIME_ZONE = 'Asia/Kolkata';

const COLORS = {
  background: '#1C1C1E',
  white: '#FFFFFF',
  light: '#E5E5E7',
  red: '#B71C1C',
  slate: '#475156',
  muted: '#A1A1AA',
  border: '#353538',
  surface: '#1a1a1a',
  success: '#183324',
  successText: '#A5D6A7',
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
    maxWidth: 1160,
    margin: '0 auto',
    padding: '32px 20px 48px',
    color: COLORS.white,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  eyebrow: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
  },

  title: {
    fontSize: 'clamp(28px, 4vw, 36px)',
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
    margin: 0,
    color: COLORS.white,
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
    padding: 'clamp(19px, 3vw, 26px)',
  },

  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: '11px 15px',
    background: COLORS.slate,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 650,
    cursor: 'pointer',
    transition:
      'transform 180ms ease, box-shadow 180ms ease, opacity 160ms ease',
  },

  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 8,
    padding: '12px 13px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 9,
    background: COLORS.background,
    color: COLORS.white,
    fontSize: 14,
    colorScheme: 'dark',
    outline: 'none',
  },

  tableCell: {
    textAlign: 'left',
    padding: '16px 18px',
    borderBottom: `1px solid ${COLORS.border}`,
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
    <main
      className="attendance-page"
      style={{
        ...styles.page,
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Page heading */}
      <header
        className="attendance-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 30,
        }}
      >
        <div>
          <p style={styles.eyebrow}>Gym management</p>

          <h1 style={styles.title}>Attendance</h1>

          <p style={{ ...styles.muted, margin: '10px 0 0', maxWidth: 460 }}>
            Every visit counts. Track your members' daily check-ins in one place.
          </p>
        </div>

        <button
          type="button"
          className="attendance-button"
          onClick={loadAttendance}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <span
            aria-hidden="true"
            className={loading ? 'attendance-spin' : ''}
            style={{ fontSize: 17 }}
          >
            {loading ? '◌' : '↻'}
          </span>
          {loading ? 'Refreshing…' : 'Refresh records'}
        </button>
      </header>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          style={{
            padding: '14px 16px',
            marginBottom: 22,
            borderRadius: 10,
            border: '1px solid #6b3030',
            background: '#3B2022',
            color: '#FFB4AB',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {error}
        </div>
      )}

      {/* QR code section */}
      <section
        className="attendance-card attendance-card--qr"
        style={{
          ...styles.card,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
          gap: 28,
          alignItems: 'center',
          marginBottom: 26,
          overflow: 'hidden',
        }}
      >
        <div>
          <div
            style={{
              width: 42,
              height: 42,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              background: 'rgba(183,28,28,0.14)',
              border: '1px solid rgba(183,28,28,0.4)',
              color: '#ef9a9a',
              fontSize: 21,
              marginBottom: 18,
            }}
            aria-hidden="true"
          >
            ▦
          </div>

          <p style={styles.eyebrow}>Quick check-in</p>

          <h2
            style={{
              margin: '0 0 10px',
              color: COLORS.white,
              fontSize: 22,
              letterSpacing: '-0.035em',
            }}
          >
            Your gym QR code
          </h2>

          <p style={{ ...styles.muted, maxWidth: 390, margin: '0 0 20px' }}>
            Let members scan this code to open your gym's check-in page.
            They can verify their registered details and record attendance.
          </p>

          <button
            type="button"
            className="attendance-button"
            onClick={() => window.print()}
            disabled={!checkInUrl}
            style={{
              ...styles.button,
              background: COLORS.red,
              borderColor: COLORS.red,
              opacity: checkInUrl ? 1 : 0.55,
              cursor: checkInUrl ? 'pointer' : 'not-allowed',
            }}
          >
            <span aria-hidden="true">↗</span>
            Print QR code
          </button>
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
                background: COLORS.white,
                padding: 17,
                borderRadius: 15,
                boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
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
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={styles.muted}>Loading gym QR code…</p>
            </div>
          )}
        </div>
      </section>

      {/* Attendance records */}
      <section
        className="attendance-card attendance-card--history"
        style={styles.card}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <div>
            <p style={styles.eyebrow}>Daily overview</p>

            <h2
              style={{
                margin: 0,
                fontSize: 22,
                letterSpacing: '-0.035em',
                color: COLORS.white,
              }}
            >
              Attendance history
            </h2>

            <p style={{ ...styles.muted, margin: '8px 0 0' }}>
              Review member check-ins for a selected day.
            </p>
          </div>

          <div style={{ minWidth: 190 }}>
            <label
              htmlFor="attendance-date"
              style={{
                fontSize: 12,
                fontWeight: 650,
                color: COLORS.light,
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

        {/* Summary strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '15px 16px',
            marginBottom: 18,
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 11,
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: COLORS.muted,
                fontSize: 11,
                fontWeight: 650,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Selected date
            </p>

            <strong style={{ fontSize: 14, color: COLORS.light }}>
              {formatAttendanceDate(date)}
            </strong>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                margin: '0 0 5px',
                color: COLORS.muted,
                fontSize: 11,
                fontWeight: 650,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Total check-ins
            </p>

            <span
              style={{
                color: COLORS.white,
                fontSize: 22,
                fontWeight: 750,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {records.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 11,
            }}
          >
            <p style={{ color: COLORS.light, margin: 0 }}>
              Loading attendance records…
            </p>
          </div>
        ) : records.length === 0 ? (
          <div
            style={{
              padding: '48px 18px',
              textAlign: 'center',
              border: `1px dashed ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.background,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                borderRadius: 14,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.light,
                fontSize: 24,
              }}
            >
              ◷
            </div>

            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 16,
                color: COLORS.white,
              }}
            >
              No check-ins yet
            </h3>

            <p
              style={{
                ...styles.muted,
                margin: 0,
                fontSize: 13,
              }}
            >
              No attendance records were found for {formatAttendanceDate(date)}.
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
                minWidth: 650,
                borderCollapse: 'collapse',
                fontSize: 13,
                background: COLORS.surface,
              }}
            >
              <thead>
                <tr style={{ background: COLORS.background, color: COLORS.muted }}>
                  {[
                    'Roll number',
                    'Member',
                    'Attendance date',
                    'Check-in time (IST)',
                    'Status',
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        ...styles.tableCell,
                        paddingTop: 14,
                        paddingBottom: 14,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.045em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr className="attendance-row" key={record._id}>
                    <td
                      style={{
                        ...styles.tableCell,
                        color: COLORS.light,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {record.rollNumber || '—'}
                    </td>

                    <td style={styles.tableCell}>
                      <span
                        style={{
                          display: 'block',
                          color: COLORS.white,
                          fontWeight: 650,
                        }}
                      >
                        {record.memberName || 'Unknown member'}
                      </span>

                      {record.phone && (
                        <span
                          style={{
                            display: 'block',
                            color: COLORS.muted,
                            marginTop: 5,
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
                        color: COLORS.light,
                      }}
                    >
                      {formatAttendanceDate(record.attendanceDate)}
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
            margin: '16px 0 0',
            lineHeight: 1.6,
          }}
        >
          All check-in times are displayed in Indian Standard Time (IST).
        </p>
      </section>

      <footer
        style={{
          marginTop: 22,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          color: COLORS.muted,
          fontSize: 11,
        }}
      >
        <span>GFT · Gym Fee Tracker</span>
        <span>Built for your daily gym operations</span>
      </footer>

      <style>{`
        /* Page entrance */
        .attendance-page {
          animation: gftFadeIn 450ms ease-out both;
        }

        .attendance-header {
          animation: gftSlideUp 450ms ease-out 60ms both;
        }

        /* Subtle card entrance */
        .attendance-card--qr {
          animation: gftSlideUp 500ms ease-out 120ms both;
        }

        .attendance-card--history {
          animation: gftSlideUp 500ms ease-out 190ms both;
        }

        /* Button hover and press feedback */
        .attendance-button {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            opacity 160ms ease;
        }

        .attendance-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
        }

        .attendance-button:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .attendance-button:focus-visible {
          outline: 2px solid #E5E5E7;
          outline-offset: 3px;
        }

        /* Attendance row hover */
        .attendance-row {
          transition: background-color 180ms ease;
        }

        .attendance-row:hover {
          background-color: rgba(255, 255, 255, 0.045);
        }

        /* Refresh loading indicator */
        .attendance-spin {
          display: inline-block;
          animation: gftSpin 1s linear infinite;
        }

        @keyframes gftFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes gftSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gftSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Print only the QR code */
        @media print {
          body {
            background: #ffffff !important;
          }

          body * {
            visibility: hidden;
          }

          .attendance-qr,
          .attendance-qr * {
            visibility: visible;
          }

          .attendance-qr {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
          }
        }

        /* Mobile QR code sizing */
        @media (max-width: 600px) {
          .attendance-qr svg {
            max-width: 100%;
            height: auto;
          }
        }

        /* Accessibility: reduce motion when requested */
        @media (prefers-reduced-motion: reduce) {
          .attendance-page,
          .attendance-header,
          .attendance-card--qr,
          .attendance-card--history,
          .attendance-spin {
            animation: none !important;
          }

          .attendance-button,
          .attendance-row {
            transition: none !important;
          }

          .attendance-button:hover:not(:disabled),
          .attendance-button:active:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
