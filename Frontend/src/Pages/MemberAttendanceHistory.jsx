
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const INDIA_TIMEZONE = 'Asia/Kolkata';

function getAuthConfig() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
}

// Format the stored attendance date without changing its calendar day.
function formatAttendanceDate(value) {
  const date = new Date(`${value}T00:00:00Z`);

  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getAttendanceDay(value) {
  const date = new Date(`${value}T00:00:00Z`);

  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    weekday: 'long',
  });
}

// Display the actual check-in timestamp in Indian Standard Time.
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
    <main
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '28px 20px',
        color: '#f5f5f5',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Link
        to="/user"
        style={{
          color: '#90caf9',
          textDecoration: 'none',
          fontSize: 14,
        }}
      >
        ← Back to members
      </Link>

      <header style={{ margin: '24px 0' }}>
        <h1 style={{ marginBottom: 8, fontSize: 30 }}>
          Attendance History
        </h1>
        <p style={{ color: '#a3a3a3', margin: 0 }}>
          Review this member's recorded gym visits.
        </p>
      </header>

      {loading && (
        <p style={{ color: '#bdbdbd' }}>
          Loading attendance history…
        </p>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: 16,
            borderRadius: 10,
            background: '#321d20',
            color: '#ffb4ab',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <section
            style={{
              background: '#171717',
              border: '1px solid #303030',
              borderRadius: 16,
              padding: 24,
              marginBottom: 28,
            }}
          >
            <p
              style={{
                color: '#a3a3a3',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginTop: 0,
              }}
            >
              Member details
            </p>

            <h2 style={{ margin: '0 0 18px', fontSize: 23 }}>
              {data.member.name}
            </h2>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 28,
              }}
            >
              <div>
                <p style={{ color: '#a3a3a3', margin: '0 0 6px' }}>
                  Roll number
                </p>
                <strong>{data.member.rollNumber || '—'}</strong>
              </div>

              <div>
                <p style={{ color: '#a3a3a3', margin: '0 0 6px' }}>
                  Phone
                </p>
                <strong>{data.member.phone || '—'}</strong>
              </div>

              <div>
                <p style={{ color: '#a3a3a3', margin: '0 0 6px' }}>
                  Total present days
                </p>
                <strong
                  style={{ color: '#81c784', fontSize: 22 }}
                >
                  {data.totalPresentDays}
                </strong>
              </div>
            </div>
          </section>

          <section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 20, margin: 0 }}>
                Present Attendance Records
              </h2>

              <span
                style={{
                  background: '#242424',
                  color: '#d4d4d4',
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 13,
                }}
              >
                {data.attendance.length} records
              </span>
            </div>

            {data.attendance.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  background: '#171717',
                  border: '1px solid #303030',
                  borderRadius: 12,
                  color: '#a3a3a3',
                }}
              >
                No attendance records found for this member.
              </div>
            ) : (
              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid #303030',
                  borderRadius: 12,
                }}
              >
                <table
                  style={{
                    width: '100%',
                    minWidth: 560,
                    borderCollapse: 'collapse',
                    background: '#171717',
                  }}
                >
                  <thead>
                    <tr style={{ background: '#222222' }}>
                      {['Date', 'Day', 'Check-in time (IST)', 'Status'].map(
                        (heading) => (
                          <th
                            key={heading}
                            style={{
                              textAlign: 'left',
                              padding: '15px 16px',
                              fontSize: 12,
                              color: '#bdbdbd',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              borderBottom: '1px solid #303030',
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
                            padding: '15px 16px',
                            borderBottom: '1px solid #292929',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatAttendanceDate(record.attendanceDate)}
                        </td>

                        <td
                          style={{
                            padding: '15px 16px',
                            borderBottom: '1px solid #292929',
                            color: '#bdbdbd',
                          }}
                        >
                          {getAttendanceDay(record.attendanceDate)}
                        </td>

                        <td
                          style={{
                            padding: '15px 16px',
                            borderBottom: '1px solid #292929',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatCheckInTime(record.checkInAt)}
                        </td>

                        <td
                          style={{
                            padding: '15px 16px',
                            borderBottom: '1px solid #292929',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              background: '#183324',
                              color: '#81c784',
                              padding: '5px 10px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
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
        </>
      )}
    </main>
  );
}
