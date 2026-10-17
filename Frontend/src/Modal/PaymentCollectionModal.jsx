import React from 'react';
import axios from 'axios';
import {
  Modal, Box, Typography, TextField, Button, IconButton, CircularProgress,
  RadioGroup, FormControlLabel, Radio, Divider, Alert, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API = import.meta.env.VITE_API_URL;

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

const PaymentCollectionModal = ({ open, onClose, member, onPaymentSuccess }) => {
  const [method, setMethod] = React.useState('Cash');
  const [monthlyFee, setMonthlyFee] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [reference, setReference] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [paymentIntent, setPaymentIntent] = React.useState(null);
  const notifiedPaid = React.useRef(false);
  const onPaymentSuccessRef = React.useRef(onPaymentSuccess);
  onPaymentSuccessRef.current = onPaymentSuccess;

  React.useEffect(() => {
    if (!member?._id) return undefined;
    let cancelled = false;

    const fee = Number(member.monthlyFee) || 0;
    const monthsDue = Math.max(Number(member.unpaidFor) || 1, 1);
    setMonthlyFee(fee > 0 ? String(fee) : '');
    setAmount(fee > 0 ? String(fee * monthsDue) : '');
    setMethod('Cash');
    setReference('');
    setError('');
    setPaymentIntent(null);
    notifiedPaid.current = false;

    const loadPendingPayment = async () => {
      try {
        const response = await axios.get(API + '/payments/members/' + member._id + '/pending', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        });
        if (cancelled || !response.data.paymentIntent) return;
        const pending = response.data.paymentIntent;
        setPaymentIntent(pending);
        setMethod('UPI');
        setMonthlyFee(String(pending.monthlyFee));
        setAmount(String(pending.amount));
      } catch (err) {
        // If there is no previous request, the owner can start a new payment.
      }
    };

    loadPendingPayment();
    return () => { cancelled = true; };
  }, [member?._id, member?.monthlyFee, member?.unpaidFor]);

  const amountPaise = Math.round(Number(amount) * 100);
  const feePaise = Math.round(Number(monthlyFee) * 100);
  const validValues = Number.isSafeInteger(amountPaise) && amountPaise >= 100
    && Number.isSafeInteger(feePaise) && feePaise >= 100;
  const hasRemainder = validValues && amountPaise % feePaise !== 0;
  const monthsCovered = validValues && !hasRemainder ? amountPaise / feePaise : 0;

  const handleCashPayment = async () => {
    setBusy(true);
    setError('');
    try {
      await axios.post(API + '/payments/members/' + member._id + '/cash', {
        amount: Number(amount),
        monthlyFee: Number(monthlyFee),
        reference: reference.trim() || undefined,
      }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      onPaymentSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record the cash payment.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateQr = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await axios.post(API + '/payments/members/' + member._id + '/qr', {
        amount: Number(amount),
        monthlyFee: Number(monthlyFee),
      }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      setPaymentIntent(response.data.paymentIntent);
      notifiedPaid.current = false;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create a dynamic UPI QR.');
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    if (!open || !paymentIntent?.id || paymentIntent.status !== 'Pending') return undefined;

    const checkStatus = async () => {
      try {
        const response = await axios.get(API + '/payments/payment-intents/' + paymentIntent.id, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
        const latest = response.data;
        setPaymentIntent((current) => current ? { ...current, ...latest } : current);
        if (latest.status === 'Paid' && !notifiedPaid.current) {
          notifiedPaid.current = true;
          onPaymentSuccessRef.current?.();
        }
      } catch (err) {
        // A temporary network failure should not change the payment state.
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 3000);
    return () => clearInterval(timer);
  }, [open, paymentIntent?.id, paymentIntent?.status]);

  const handleResolveNoPayment = async () => {
    if (!paymentIntent?.id) return;
    setBusy(true);
    setError('');
    try {
      await axios.post(
        API + '/payments/payment-intents/' + paymentIntent.id + '/resolve-no-payment',
        { confirmedNoPayment: true },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      setPaymentIntent(null);
      setMethod('UPI');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve the previous QR request.');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const showQr = method === 'UPI' && paymentIntent?.qrImageUrl;
  const status = paymentIntent?.status;

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="collect-fee-title">
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '92%', sm: 520 }, maxHeight: '90vh', overflowY: 'auto',
        p: { xs: 2, sm: 3 }, bgcolor: '#1a1a1a', color: '#fff',
        borderRadius: 2, boxShadow: 24, outline: 'none',
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography id="collect-fee-title" variant="h6" fontWeight="bold">Collect Fee</Typography>
          <IconButton onClick={handleClose} aria-label="Close payment modal" sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography sx={{ color: '#bbb', mt: 0.5 }}>{member?.name} · {member?.phone}</Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: '#242424', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#aaa' }}>Current status</Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mt={0.5}>
            <Typography fontWeight="bold">{member?.status || 'Unpaid'}</Typography>
            <Chip size="small" label={(Number(member?.unpaidFor) || 0) + ' month(s) unpaid'} sx={{ color: '#fff', bgcolor: '#454545' }} />
          </Box>
        </Box>

        {!showQr && status !== 'Paid' && (
          <>
            <TextField
              fullWidth label="Monthly fee (₹)" type="number" value={monthlyFee}
              onChange={(e) => { setMonthlyFee(e.target.value); setPaymentIntent(null); }}
              inputProps={{ min: 1, step: '0.01' }}
              sx={{ mt: 2, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' } }}
              helperText="Saved to this member after a successful payment."
              FormHelperTextProps={{ sx: { color: '#aaa' } }}
            />
            <TextField
              fullWidth label="Amount to collect (₹)" type="number" value={amount}
              onChange={(e) => { setAmount(e.target.value); setPaymentIntent(null); }}
              inputProps={{ min: 1, step: '0.01' }}
              sx={{ mt: 2, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' } }}
            />

            <Box sx={{ mt: 2, p: 2, border: '1px solid #444', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>Automatic calculation</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>{money(amount)}</Typography>
              {monthsCovered > 0 && !hasRemainder ? (
                <Typography variant="body2" sx={{ color: '#81c784', mt: 0.5 }}>
                  Covers {monthsCovered} complete {monthsCovered === 1 ? 'month' : 'months'}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: '#ffb74d', mt: 0.5 }}>
                  Enter an amount that is an exact multiple of the monthly fee. Partial months are not supported yet.
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: '#444', my: 2 }} />
            <Typography fontWeight="bold" mb={1}>Payment method</Typography>
            <RadioGroup row value={method} onChange={(e) => { setMethod(e.target.value); setPaymentIntent(null); setError(''); }}>
              <FormControlLabel value="Cash" control={<Radio sx={{ color: '#aaa', '&.Mui-checked': { color: '#81c784' } }} />} label="Cash" />
              <FormControlLabel value="UPI" control={<Radio sx={{ color: '#aaa', '&.Mui-checked': { color: '#81c784' } }} />} label="Dynamic UPI QR" />
            </RadioGroup>

            {method === 'Cash' && (
              <TextField
                fullWidth label="Receipt / reference (optional)" value={reference}
                onChange={(e) => setReference(e.target.value)} sx={{ mt: 1 }}
                InputProps={{ sx: { color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            )}
          </>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {showQr && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
              Ask the member to scan this QR in a UPI app and authorize the exact amount shown there. Gym Fee Tracker will mark the fee paid only after Razorpay confirms the payment.
            </Alert>
            <Typography variant="h4" fontWeight="bold">{money(paymentIntent.amount)}</Typography>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
              {paymentIntent.monthsCovered} month(s) · QR expires at {new Date(paymentIntent.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Box component="img" src={paymentIntent.qrImageUrl} alt="Fixed amount UPI payment QR code" sx={{
              display: 'block', width: 240, height: 240, objectFit: 'contain',
              bgcolor: '#fff', p: 1, borderRadius: 2, mx: 'auto',
            }} />
            <Button component="a" href={paymentIntent.qrImageUrl} target="_blank" rel="noreferrer" sx={{ mt: 1, color: '#90caf9', textTransform: 'none' }}>
              Open QR image separately
            </Button>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={2}>
              {status === 'Pending' && <><CircularProgress size={18} sx={{ color: '#90caf9' }} /><Typography variant="body2">Waiting for payment confirmation…</Typography></>}
              {status === 'Paid' && <><CheckCircleIcon sx={{ color: '#81c784' }} /><Typography sx={{ color: '#81c784' }} fontWeight="bold">Payment confirmed</Typography></>}
              {status === 'Expired' && <Typography color="warning.main">This QR expired. Check Razorpay before retrying.</Typography>}
              {status === 'NeedsReview' && <Typography color="warning.main">This payment could not be automatically reconciled. Check Razorpay before taking action.</Typography>}
              {status === 'Failed' && <Typography color="error.main">Payment failed. Create a new request if needed.</Typography>}
            </Box>
            {(status === 'Expired' || status === 'NeedsReview') && (
              <Button disabled={busy} onClick={handleResolveNoPayment} sx={{ mt: 1, color: '#90caf9' }}>
                I checked Razorpay: no payment was received
              </Button>
            )}
            {status === 'Failed' && (
              <Button onClick={() => setPaymentIntent(null)} sx={{ mt: 1, color: '#90caf9' }}>
                Back to payment details
              </Button>
            )}
          </Box>
        )}

        {!showQr && status !== 'Paid' && (
          <Button
            fullWidth variant="contained" disabled={busy || !validValues || hasRemainder || monthsCovered < 1}
            onClick={method === 'Cash' ? handleCashPayment : handleCreateQr}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : (method === 'Cash' ? <PaymentsIcon /> : <QrCode2Icon />)}
            sx={{ mt: 2, py: 1.2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, textTransform: 'none', fontWeight: 'bold' }}
          >
            {busy ? 'Processing…' : method === 'Cash' ? 'Confirm Cash Received' : 'Generate Fixed-Amount QR'}
          </Button>
        )}

        {status === 'Paid' && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">Payment verified and saved in the member's payment history.</Alert>
            <Button fullWidth onClick={onClose} variant="contained" sx={{ mt: 2, textTransform: 'none' }}>Done</Button>
          </Box>
        )}

        <Typography variant="caption" sx={{ display: 'block', color: '#888', mt: 2 }}>
          Never mark a UPI payment as paid based only on a screenshot or the QR being scanned. Confirmation comes from the payment provider webhook.
        </Typography>
      </Box>
    </Modal>
  );
};

export default PaymentCollectionModal;
