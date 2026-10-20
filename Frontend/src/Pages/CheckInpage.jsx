
import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = {
  background: '#1C1C1E',
  white: '#FFFFFF',
  light: '#E5E5E7',
  red: '#B71C1C',
  slate: '#37474F',
  muted: '#A1A1AA',
  border: '#353538',
  success: '#183324',
  successText: '#A5D6A7',
  error: '#3B2022',
  errorText: '#FFB4AB',
};

function getIndiaDate(value) {
  if (!value) return '—';

  // Keep YYYY-MM-DD values as calendar dates without timezone shifting.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match) {
    return new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    ).toLocaleDateString('en-IN', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  borderRadius: 9,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.background,
  color: COLORS.white,
  fontSize: 15,
  outline: 'none',
};

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

  function resetForm() {
    setResult(null);
    setError('');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: COLORS.background,
        color: COLORS.white,
        padding: '32px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* GFT brand */}
        <header style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
              margin: '0 auto 14px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 15,
              background: COLORS.red,
              color: COLORS.white,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            GFT
          </div>

          <p
            style={{
              margin: '0 0 8px',
              color: COLORS.muted,
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: 700,
            }}
          >
            GYM FEE TRACKER
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(27px, 6vw, 34px)',
              fontWeight: 750,
              letterSpacing: -1,
            }}
          >
            Your daily check-in
          </h1>

          <p
            style={{
              color: COLORS.light,
              opacity: 0.72,
              fontSize: 14,
              lineHeight: 1.6,
              margin: '10px 0 0',
            }}
          >
            Show up for yourself. We’ll take care of the rest.
          </p>
        </header>

        <section
          style={{
            background: '#242426',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 'clamp(20px, 5vw, 28px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          }}
        >
          {result ? (
            <div role="status" aria-live="polite">
              <div
                style={{
                  width: 56,
                  height: 56,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background:
                    result.alreadyCheckedIn
                      ? '#303033'
                      : COLORS.success,
                  color: result.alreadyCheckedIn
                    ? COLORS.light
                    : COLORS.successText,
                  fontSize: 27,
                  marginBottom: 20,
                }}
              >
                ✓
              </div>

              <p
                style={{
                  color: COLORS.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  margin: '0 0 8px',
                }}
              >
                ATTENDANCE UPDATE
              </p>

              <h2
                style={{
                  fontSize: 25,
                  letterSpacing: -0.5,
                  margin: '0 0 10px',
                }}
              >
                {result.message}
              </h2>

              <p
                style={{
                  color: COLORS.light,
                  opacity: 0.75,
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                {result.alreadyCheckedIn
                  ? 'Your attendance has already been recorded for today.'
                  : 'You’re checked in. Have a great workout!'}
              </p>

              <div
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 22,
                }}
              >
                {[
                  ['Member', result.memberName],
                  ['Roll number', result.rollNumber || '—'],
                  ['Date', getIndiaDate(result.attendanceDate)],
                  ['Check-in time (IST)', formatTime(result.checkInAt)],
                ].map(([label, value], index, items) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 13px',
                      borderBottom:
                        index < items.length - 1
                          ? `1px solid ${COLORS.border}`
                          : 'none',
                    }}
                  >
                    <span
                      style={{
                        color: COLORS.muted,
                        fontSize: 13,
                      }}
                    >
                      {label}
                    </span>

                    <strong
                      style={{
                        color: COLORS.white,
                        fontSize: 13,
                        textAlign: 'right',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {value || '—'}
                    </strong>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  width: '100%',
                  padding: 14,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  background: COLORS.slate,
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: 650,
                  cursor: 'pointer',
                }}
              >
                Back to check-in
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 22 }}>
                <h2 style={{ fontSize: 19, margin: '0 0 7px' }}>
                  Mark attendance
                </h2>
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Use your registered roll number or member details.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <fieldset
                  disabled={loading}
                  style={{
                    border: 0,
                    padding: 0,
                    margin: 0,
                    minWidth: 0,
                  }}
                >
                  <legend
                    style={{
                      color: COLORS.light,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 11,
                    }}
                  >
                    Choose a check-in method
                  </legend>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 9,
                      marginBottom: 23,
                    }}
                  >
                    {[
                      {
                        value: 'roll',
                        title: 'Roll number',
                        subtitle: 'Quick check-in',
                      },
                      {
                        value: 'details',
                        title: 'Member details',
                        subtitle: 'Forgot your roll no.?',
                      },
                    ].map((option) => {
                      const selected = method === option.value;

                      return (
                        <label
                          key={option.value}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 9,
                            padding: '13px 11px',
                            border: `1px solid ${
                              selected ? COLORS.red : COLORS.border
                            }`,
                            borderRadius: 11,
                            background: selected
                              ? 'rgba(183,28,28,0.10)'
                              : COLORS.background,
                            cursor: 'pointer',
                            minWidth: 0,
                          }}
                        >
                          <input
                            type="radio"
                            name="method"
                            value={option.value}
                            checked={selected}
                            onChange={() => {
                              setMethod(option.value);
                              setError('');
                            }}
                            style={{
                              accentColor: COLORS.red,
                              marginTop: 3,
                            }}
                          />

                          <span style={{ minWidth: 0 }}>
                            <span
                              style={{
                                display: 'block',
                                color: COLORS.white,
                                fontSize: 12,
                                fontWeight: 650,
                                lineHeight: 1.5,
                              }}
                            >
                              {option.title}
                            </span>

                            <span
                              style={{
                                display: 'block',
                                color: COLORS.muted,
                                fontSize: 10,
                                lineHeight: 1.6,
                                marginTop: 3,
                              }}
                            >
                              {option.subtitle}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {method === 'roll' ? (
                    <label
                      style={{
                        display: 'grid',
                        gap: 9,
                        color: COLORS.light,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Roll number
                      <input
                        value={rollNumber}
                        onChange={(event) =>
                          setRollNumber(event.target.value)
                        }
                        placeholder="e.g. G001"
                        autoComplete="off"
                        autoCapitalize="characters"
                        style={inputStyle}
                      />
                    </label>
                  ) : (
                    <div style={{ display: 'grid', gap: 17 }}>
                      <label
                        style={{
                          display: 'grid',
                          gap: 9,
                          color: COLORS.light,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Registered full name
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Enter your full name"
                          autoComplete="name"
                          style={inputStyle}
                        />
                      </label>

                      <label
                        style={{
                          display: 'grid',
                          gap: 9,
                          color: COLORS.light,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Registered phone number
                        <input
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="Enter your phone number"
                          autoComplete="tel"
                          style={inputStyle}
                        />
                      </label>
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      style={{
                        marginTop: 17,
                        padding: '12px 13px',
                        borderRadius: 9,
                        background: COLORS.error,
                        color: COLORS.errorText,
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      marginTop: 23,
                      padding: 15,
                      border: 'none',
                      borderRadius: 10,
                      background: loading ? '#772020' : COLORS.red,
                      color: COLORS.white,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: loading ? 'wait' : 'pointer',
                      transition: 'background 160ms ease',
                    }}
                  >
                    {loading ? 'Marking attendance…' : 'Confirm check-in →'}
                  </button>
                </fieldset>
              </form>

              <p
                style={{
                  color: COLORS.muted,
                  fontSize: 11,
                  textAlign: 'center',
                  lineHeight: 1.7,
                  margin: '19px 0 0',
                }}
              >
                Use the details registered with your gym.
                <br />
                Your attendance will be recorded securely.
              </p>
            </>
          )}
        </section>

        <footer
          style={{
            textAlign: 'center',
            color: COLORS.muted,
            fontSize: 11,
            marginTop: 22,
          }}
        >
          GFT · Gym Fee Tracker
        </footer>
      </div>
    </main>
  );
}
