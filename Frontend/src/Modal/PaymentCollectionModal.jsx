import React from 'react';
import axios from 'axios';
import {
  Modal, Box, Typography, TextField, Button, IconButton, CircularProgress,
  RadioGroup, FormControlLabel, Radio, Divider, Alert, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PaymentsIcon from '@mui/icons-material/Payments';

const API = import.meta.env.VITE_API_URL;
const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value) || 0);

const PaymentCollectionModal = ({ open, onClose, member, onPaymentSuccess }) => {
  const [method, setMethod] = React.useState('Cash');
  const [monthlyFee, setMonthlyFee] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [reference, setReference] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [upiSettings, setUpiSettings] = React.useState({ upiId: '', gymName: '' });
  const [qrVisible, setQrVisible] = React.useState(false);

  React.useEffect(() => {
    if (!open || !member?._id) return undefined;
    let cancelled = false;
    const fee = Number(member.monthlyFee) || 0;
    const monthsDue = Math.max(Number(member.unpaidFor) || 1, 1);
    setMonthlyFee(fee > 0 ? String(fee) : '');
    setAmount(fee > 0 ? String(fee * monthsDue) : '');
    setMethod('Cash');
    setReference('');
    setError('');
    setQrVisible(false);

    axios.get(API + '/auth/profile', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    }).then(({ data }) => {
      if (!cancelled) setUpiSettings({ upiId: data.upiId || '', gymName: data.gymName || '' });
    }).catch(() => {
      if (!cancelled) setUpiSettings({ upiId: '', gymName: '' });
    });
    return () => { cancelled = true; };
  }, [open, member?._id, member?.monthlyFee, member?.unpaidFor]);

  const amountPaise = Math.round(Number(amount) * 100);
  const feePaise = Math.round(Number(monthlyFee) * 100);
  const validValues = Number.isSafeInteger(amountPaise) && amountPaise >= 100
    && Number.isSafeInteger(feePaise) && feePaise >= 100;
  const hasRemainder = validValues && amountPaise % feePaise !== 0;
  const monthsCovered = validValues && !hasRemainder ? amountPaise / feePaise : 0;

  const upiUri = React.useMemo(() => {
    if (!upiSettings.upiId || !validValues || hasRemainder || monthsCovered < 1) return '';
    const params = new URLSearchParams({
      pa: upiSettings.upiId,
      pn: upiSettings.gymName || 'Gym Fee Tracker',
      am: (amountPaise / 100).toFixed(2),
      cu: 'INR',
      tn: 'Gym fee - ' + (member?.name || 'Member'),
    });
    return 'upi://pay?' + params.toString();
  }, [upiSettings, validValues, hasRemainder, monthsCovered, amountPaise, member?.name]);

  const qrImageUrl = upiUri
    ? 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=' + encodeURIComponent(upiUri)
    : '';

  const handleCashPayment = async () => {
    setBusy(true); setError('');
    try {
      await axios.post(API + '/payments/members/' + member._id + '/cash', {
        amount: Number(amount), monthlyFee: Number(monthlyFee), reference: reference.trim() || undefined,
      }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      onPaymentSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record the cash payment.');
    } finally { setBusy(false); }
  };

  const handleUpiPayment = async () => {
    setBusy(true); setError('');
    try {
      await axios.post(API + '/payments/members/' + member._id + '/upi', {
        amount: Number(amount),
        monthlyFee: Number(monthlyFee),
        reference: reference.trim() || undefined,
        confirmedReceived: true,
      }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      onPaymentSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record the UPI payment.');
    } finally { setBusy(false); }
  };

  const handleClose = () => { if (!busy) onClose(); };
  const showQr = method === 'UPI' && qrVisible && Boolean(qrImageUrl);

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
          <IconButton onClick={handleClose} aria-label="Close payment modal" sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </Box>
        <Typography sx={{ color: '#bbb', mt: 0.5 }}>{member?.name} · {member?.phone}</Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: '#242424', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#aaa' }}>Current status</Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mt={0.5}>
            <Typography fontWeight="bold">{member?.status || 'Unpaid'}</Typography>
            <Chip size="small" label={(Number(member?.unpaidFor) || 0) + ' month(s) unpaid'} sx={{ color: '#fff', bgcolor: '#454545' }} />
          </Box>
        </Box>

        {!showQr && (
          <>
            <TextField fullWidth label="Monthly fee (₹)" type="number" value={monthlyFee}
              onChange={(e) => { setMonthlyFee(e.target.value); setQrVisible(false); }}
              inputProps={{ min: 1, step: '0.01' }}
              sx={{ mt: 2, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' } }}
              helperText="Saved to this member after a successful payment."
              FormHelperTextProps={{ sx: { color: '#aaa' } }} />
            <TextField fullWidth label="Amount to collect (₹)" type="number" value={amount}
              onChange={(e) => { setAmount(e.target.value); setQrVisible(false); }}
              inputProps={{ min: 1, step: '0.01' }}
              sx={{ mt: 2, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' } }} />
            <Box sx={{ mt: 2, p: 2, border: '1px solid #444', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>Payment amount</Typography>
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
            <RadioGroup row value={method} onChange={(e) => { setMethod(e.target.value); setQrVisible(false); setError(''); }}>
              <FormControlLabel value="Cash" control={<Radio sx={{ color: '#aaa', '&.Mui-checked': { color: '#81c784' } }} />} label="Cash" />
              <FormControlLabel value="UPI" control={<Radio sx={{ color: '#aaa', '&.Mui-checked': { color: '#81c784' } }} />} label="UPI QR" />
            </RadioGroup>
            {method === 'Cash' && (
              <TextField fullWidth label="Receipt / reference (optional)" value={reference}
                onChange={(e) => setReference(e.target.value)} sx={{ mt: 1 }}
                InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#bbb' } }} />
            )}
            {method === 'UPI' && !upiSettings.upiId && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Set up your gym UPI ID in Profile Settings before collecting UPI payments.
              </Alert>
            )}
          </>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {showQr && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
              This QR has the amount prefilled. Ask the member to complete the payment, then verify the actual credit in your UPI app or bank account before confirming below.
            </Alert>
            <Typography variant="h4" fontWeight="bold">{money(amount)}</Typography>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
              {monthsCovered} month(s) · Pay to {upiSettings.upiId}
            </Typography>
            <Box component="img" src={qrImageUrl} alt="UPI payment QR with amount prefilled" sx={{
              display: 'block', width: 260, height: 260, objectFit: 'contain',
              bgcolor: '#fff', p: 1, borderRadius: 2, mx: 'auto',
            }} />
            <Button onClick={() => setQrVisible(false)} sx={{ mt: 1, color: '#90caf9', textTransform: 'none' }}>
              Back to payment details
            </Button>
            <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
              Gym Fee Tracker cannot automatically verify this static QR payment. Do not confirm based only on a screenshot or the member saying they paid.
            </Alert>
          </Box>
        )}

        {!showQr && (
          <Button fullWidth variant="contained"
            disabled={busy || !validValues || hasRemainder || monthsCovered < 1 || (method === 'UPI' && !upiSettings.upiId)}
            onClick={method === 'Cash' ? handleCashPayment : () => setQrVisible(true)}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : (method === 'Cash' ? <PaymentsIcon /> : <QrCode2Icon />)}
            sx={{ mt: 2, py: 1.2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, textTransform: 'none', fontWeight: 'bold' }}>
            {busy ? 'Processing…' : method === 'Cash' ? 'Confirm Cash Received' : 'Show Prefilled UPI QR'}
          </Button>
        )}

        {showQr && (
          <Button fullWidth variant="contained" disabled={busy}
            onClick={handleUpiPayment}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <PaymentsIcon />}
            sx={{ mt: 2, py: 1.2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, textTransform: 'none', fontWeight: 'bold' }}>
            {busy ? 'Saving…' : 'Confirm UPI Payment Received'}
          </Button>
        )}

        <Typography variant="caption" sx={{ display: 'block', color: '#888', mt: 2 }}>
          Static UPI QR payments require manual verification. Only confirm after checking your actual bank or UPI transaction history.
        </Typography>
      </Box>
    </Modal>
  );
};

export default PaymentCollectionModal;
