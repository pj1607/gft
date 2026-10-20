import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Modal, Box, Typography, IconButton, Button, CircularProgress, Divider, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';

const API = import.meta.env.VITE_API_URL;

const PaymentHistoryModal = ({ open, onClose, member }) => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open || !member?._id) return undefined;
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      setHistory([]);
      try {
        const response = await axios.get(`${API}/members/${member._id}/payment-history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!cancelled) setHistory(response.data.paymentHistory || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load payment history.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => { cancelled = true; };
  }, [open, member?._id]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="payment-history-title">
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '92%', sm: 550 }, maxHeight: '85vh', overflowY: 'auto',
        p: { xs: 2, sm: 3 }, bgcolor: '#1a1a1a', color: '#fff',
        borderRadius: 2, boxShadow: 24, outline: 'none',
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon sx={{ color: '#E89B4A' }} />
            <Typography id="payment-history-title" variant="h6" fontWeight="bold">
              Payment History
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close payment history" sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography sx={{ color: '#bbb', mt: 1 }}>{member?.name}</Typography>
        <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>{member?.phone}</Typography>
        <Divider sx={{ borderColor: '#444', mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress sx={{ color: '#E89B4A' }} />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={3}>
            <Typography color="error" mb={2}>{error}</Typography>
            <Button onClick={onClose} sx={{ color: '#E89B4A' }}>Close</Button>
          </Box>
        ) : history.length === 0 ? (
          <Box textAlign="center" py={5}>
            <HistoryIcon sx={{ fontSize: 42, color: '#777', mb: 1 }} />
            <Typography fontWeight="bold">No Payment History</Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
              New payment records will appear here when payments are recorded.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
              {history.filter((payment) => payment.status === 'Paid').length} successful payment(s)
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {history.map((payment) => (
                <Box key={payment._id} sx={{
                  p: 2, border: '1px solid #383838', borderRadius: 2, backgroundColor: '#242424',
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography fontWeight="bold">
                      Payment #{String(payment._id || '').slice(-6).toUpperCase()}
                    </Typography>
                    <Chip
                      size="small"
                      label={payment.status === 'Reversed' ? 'Reversed' : 'Paid'}
                      sx={{
                        color: '#fff',
                        backgroundColor: payment.status === 'Reversed' ? '#8B0000' : '#2e7d32',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#ccc', mt: 1 }}>
                    Date: {dayjs(payment.paidAt).format('DD MMM YYYY, hh:mm A')}
                  </Typography>
                  {payment.amount != null && (
                    <Typography variant="body2" sx={{ color: '#fff', mt: 0.5, fontWeight: 'bold' }}>
                      Amount: ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </Typography>
                  )}
                  {payment.method && (
                    <Typography variant="body2" sx={{ color: '#ccc', mt: 0.5 }}>
                      Method: {payment.method}
                    </Typography>
                  )}
                  {payment.reference && (
                    <Typography variant="body2" sx={{ color: '#999', mt: 0.5, wordBreak: 'break-word' }}>
                      Reference: {payment.reference}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#ccc', mt: 0.5 }}>
                    Months covered: {payment.monthsCovered || 1}
                  </Typography>
                  {payment.status === 'Reversed' && payment.reversedAt && (
                    <Typography variant="caption" sx={{ color: '#ff8a80', display: 'block', mt: 1 }}>
                      Reversed on {dayjs(payment.reversedAt).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button onClick={onClose} variant="outlined" sx={{
            color: '#fff', borderColor: '#777', textTransform: 'none',
          }}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PaymentHistoryModal;
