import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function getAuthConfig() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
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

        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ??
              'Could not load attendance history.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
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
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
        color: '#fff',
      }}
    >
      <Link to="/user" style={{ color: '#90caf9' }}>
        ← Back to members
      </Link>

      <h1>Member Attendance</h1>

      {loading && <p>Loading attendance history…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && data && (
        <>
          <section
            style={{
              background: '#1a1a1a',
              padding: 20,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <h2>{data.member.name}</h2>
            <p>Roll number: {data.member.rollNumber || '—'}</p>
            <p>Phone: {data.member.phone}</p>
            <p>
              Total recorded present days:{' '}
              <strong>{data.totalPresentDays}</strong>
            </p>
          </section>

          <h2>Present Attendance Records</h2>

          {data.attendance.length === 0 ? (
            <p>No attendance records found for this member.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#1a1a1a',
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 12 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Day</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Check-in time (UTC)</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.map((record) => {
                    const date = new Date(`${record.attendanceDate}T00:00:00Z`);

                    return (
                      <tr key={record._id}>
                        <td style={{ padding: 12 }}>
                          {date.toLocaleDateString('en-IN', {
                            timeZone: 'UTC',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: 12 }}>
                          {date.toLocaleDateString('en-IN', {
                            timeZone: 'UTC',
                            weekday: 'long',
                          })}
                        </td>
                        <td style={{ padding: 12 }}>
                          {new Date(record.checkInAt).toLocaleTimeString('en-IN', {
                            timeZone: 'UTC',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: 12, color: '#81c784', fontWeight: 600 }}>
                          Present
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
