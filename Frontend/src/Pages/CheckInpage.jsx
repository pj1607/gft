import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckInpage() {
  const { ownerId } = useParams();
  const [method, setMethod] = useState('roll');
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setResult(null);

    if (method === 'roll' && !rollNumber.trim()) {
      setError('Please enter your roll number.');
      return;
    }

    if (method === 'details' && (!name.trim() || !phone.trim())) {
      setError('Please enter your registered name and phone number.');
      return;
    }

    setLoading(true);

    try {
      const payload =
        method === 'roll'
          ? { rollNumber: rollNumber.trim().toUpperCase() }
          : { name: name.trim(), phone: phone.trim() };

      const response = await axios.post(
        `${API_URL}/attendance/check-in/${ownerId}`,
        payload
      );
      setResult(response.data);
    } catch (err) {
      const data = err.response?.data;

      if (err.response?.status === 409) {
        setResult(data);
      } else {
        setError(data?.message ?? 'Unable to mark attendance.');
      }
    } finally {
      setLoading(false);
    }
  }

  function formatTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleTimeString('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24, color: '#fff' }}>
      <section style={{ background: '#1a1a1a', borderRadius: 12, padding: 24 }}>
        <h1>Gym Attendance</h1>
        <p style={{ margin: '8px 0 24px' }}>
          Enter your registered details to mark attendance.
        </p>

        {result ? (
          <div role="status" style={{ padding: 16, borderRadius: 8, background: '#102b1a' }}>
            <h2>{result.message}</h2>
            <p>Member: {result.memberName}</p>
            {result.rollNumber && <p>Roll number: {result.rollNumber}</p>}
            <p>Date: {result.attendanceDate}</p>
            <p>Check-in time: {formatTime(result.checkInAt)}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <fieldset
              disabled={loading}
              style={{ border: 0, padding: 0, display: 'grid', gap: 16 }}
            >
              <legend style={{ marginBottom: 12 }}>Identify yourself</legend>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="method"
                  value="roll"
                  checked={method === 'roll'}
                  onChange={() => setMethod('roll')}
                />
                I know my roll number
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="method"
                  value="details"
                  checked={method === 'details'}
                  onChange={() => setMethod('details')}
                />
                I forgot my roll number
              </label>

              {method === 'roll' ? (
                <label style={{ display: 'grid', gap: 6 }}>
                  Roll number
                  <input
                    value={rollNumber}
                    onChange={(event) => setRollNumber(event.target.value)}
                    placeholder="e.g. G001"
                    autoComplete="off"
                  />
                </label>
              ) : (
                <>
                  <label style={{ display: 'grid', gap: 6 }}>
                    Registered full name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    Registered phone number
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                    />
                  </label>
                </>
              )}

              {error && <p role="alert">{error}</p>}

              <button type="submit" style={{ padding: 12, cursor: 'pointer' }}>
                {loading ? 'Marking attendance…' : 'Mark attendance'}
              </button>
            </fieldset>
          </form>
        )}
      </section>
    </main>
  );
}
