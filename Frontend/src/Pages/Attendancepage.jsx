import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = import.meta.env.VITE_API_URL;

function getUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function getAuthConfig() {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function Attendancepage() {
  const [ownerId, setOwnerId] = useState('');
  const [date, setDate] = useState(getUtcDate());
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
      setError(err.response?.data?.message ?? 'Could not load attendance.');
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
        if (!cancelled) setOwnerId(response.data.ownerId);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message ?? 'Could not load gym QR code.');
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
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: '#fff' }}>
      <header style={{ marginBottom: 24 }}>
        <h1>Gym Attendance</h1>
        <p>Manage check-ins for your gym.</p>
      </header>

      <section
        className="attendance-qr"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 24,
          padding: 24,
          marginBottom: 32,
          background: '#1a1a1a',
          borderRadius: 12,
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <h2>Your gym QR code</h2>
          <p>Members scan this code and enter their registered details.</p>
        </div>

        {checkInUrl ? (
          <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
            <QRCodeSVG value={checkInUrl} size={200} />
          </div>
        ) : (
          <p>Loading gym QR code…</p>
        )}

        {checkInUrl && (
          <button type="button" onClick={() => window.print()}>
            Print QR code
          </button>
        )}
      </section>

      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <h2>Attendance history</h2>
          <label>
            Attendance date{' '}
            <input
              type="date"
              value={date}
              max={getUtcDate()}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>

        {error && <p role="alert">{error}</p>}
        {loading ? (
          <p>Loading attendance…</p>
        ) : records.length === 0 ? (
          <p>No attendance records for this date.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 12 }}>Roll number</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Member name</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Check-in time (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td style={{ padding: 12 }}>{record.rollNumber || '—'}</td>
                    <td style={{ padding: 12 }}>{record.memberName}</td>
                    <td style={{ padding: 12 }}>
                      {new Date(record.checkInAt).toLocaleTimeString('en-GB', {
                        timeZone: 'UTC',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
