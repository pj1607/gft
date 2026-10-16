import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  MenuItem,
  Select,
  InputBase,
  Card,
  CardContent,
  Divider,CircularProgress,Tooltip as MuiTooltip,
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { useNavigate ,Link} from 'react-router-dom';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import ClearIcon from '@mui/icons-material/Clear';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UndoIcon from '@mui/icons-material/Undo';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';
import AddMemberModal from '../../Modal/AddmemberModal';
import EditMemberModal from '../../Modal/EditMemberModal';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import { toast } from 'react-toastify';
const API = import.meta.env.VITE_API_URL;
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import ConfirmModal from '../../Modal/ConfirmModal';

const MemberTableMobile = () => {
  const [data, setData] = React.useState([]);
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState(null);
const [loadingType, setLoadingType] = React.useState('');

  const [snackbar, setSnackbar] = React.useState({
  open: false,
  message: '',
  severity: 'success', 
});
const handleCloseSnackbar = () => {
  setSnackbar({ ...snackbar, open: false });
};



const [confirmAction, setConfirmAction] = 
React.useState({ open: false, title: '', description: '', onConfirm: null });


  const fetchMembers = async () => {
    try {
       setLoading(true);
      const res = await axios.get(`${API}/members/all-members`, {
        headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Send token from localStorage
  },
      });
      setData(
        res.data.members.map((m) => ({
          ...m,
          id: m._id,
           lastPaidDate:  dayjs(m.lastPaidDate).format('DD MMMM YYYY')
        }))
      );

    } catch (error) {
    const errormessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Failed to get members';

   
     setSnackbar({
  open: true,
  message: errormessage,
  severity: "error",
});
  }
   finally {
    setLoading(false);
  }

  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const markAsPaid = async (id) => {
    try {
    setLoadingId(id);
    setLoadingType('pay');
      const res = await axios.put(
        `${API}/members/${id}/pay`,
        {},
        { headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  
  } }
      );
      setData((prev) =>
        prev.map((m) =>
          m._id === id
            ? {
                ...m,
                status: 'Paid',
                unpaidFor: 0,
                lastPaidDate: dayjs(res.data.lastPaidDate).format('DD-MM-YYYY'),
              }
            : m
        )
      );
    } catch (error) {
    const errormessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Failed to mark member';

   
     setSnackbar({
  open: true,
  message: errormessage,
  severity: "error",
});
  }
 finally {
    setLoadingId(null);
    setLoadingType('');
  }

  };

  const handleUndoMarkAsPaid= async (id) => {
    try {
       setLoadingId(id);
    setLoadingType('undo');
      const res = await axios.put(
        `${API}/members/${id}/undo`,
        {},
        { headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  
  } }
      );
      setData((prev) =>
        prev.map((m) =>
          m._id === id
            ? {
                ...m,
                status: 'Unpaid',
                unpaidFor: res.data.unpaidFor,
                lastPaidDate: res.data.lastPaidDate
                  ? dayjs(res.data.lastPaidDate).format('DD-MM-YYYY')
                  : '',
              }
            : m
        )
      );
    } catch (error) {
    const errormessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Failed to undo member';

   
     setSnackbar({
  open: true,
  message: errormessage,
  severity: "error",
});
  }
   finally {
    setLoadingId(null);
    setLoadingType('');
  }
  };

  const handleDeleteMember = async (id) => {
    try {
    setLoadingId(id);
    setLoadingType('delete');
      await axios.delete( `${API}/members/${id}`, {
        headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  
  },
      });
      setData((prev) => prev.filter((m) => m._id !== id));
    }catch (error) {
    const errormessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Failed to delete member';

   
     setSnackbar({
  open: true,
  message: errormessage,
  severity: "error",
});
  }
   finally {
    setLoadingId(null);
    setLoadingType('');
  }

  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedMember(null);
    setEditModalOpen(false);
  };

  const handleUpdateMember = async (updatedData) => {
    try {
       setLoading(true)
      const res = await axios.put(
         `${API}/members/${updatedData.id}`,
        updatedData,
        { headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
  } }
      );

      setData((prev) =>
        prev.map((m) =>
          m.id === updatedData.id ? { ...m, ...updatedData } : m
        )
      );
          setSnackbar({
  open: true,
  message:'Member updated successfully!',
  severity: "success",
});
      handleCloseEditModal();
    } catch (error) {
      const errormessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to update member';
    
     setSnackbar({
  open: true,
  message: errormessage,
  severity: "error",
});
    }
    finally {
    setLoading(false);
  }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchMembers();
  };

  const filteredRows = data
    .filter((m) => (filterStatus === 'All' ? true : m.status === filterStatus))
    .filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Box p={2}>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Typography color="white">Filter by Status:</Typography>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ backgroundColor: '#b8aeae', minWidth: 120 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
          </Select>

          <Box
            display="flex"
            backgroundColor="#b8aeae"
            borderRadius="3px"
            px={1}
            alignItems="center"
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="button">
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            backgroundColor: '#2196f3',
            color: 'white',
            textTransform: 'none',
            fontWeight: 'bold',
            mt: { xs: 1, sm: 0 },
            whiteSpace: 'nowrap',
          }}
        >
          + Add Member
        </Button>
        
    <IconButton component={Link} to="/user" sx={{ color: '#ebe0e0ff', mt: '-4px' }}>
      <HomeFilledIcon  />
    </IconButton>
      </Box>

        {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="400px"
        >
          <CircularProgress sx={{ color: 'white' }} size={40} />
        </Box>
      ) :(<Box display="flex" flexDirection="column" gap={2}>
  {filteredRows.length === 0 ? (
    <Box
      textAlign="center"
      py={6}
      color="#ccc"
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        No Members Found
      </Typography>
      <Typography variant="body2">
        Try adding a member or adjust your filters.
      </Typography>
    </Box>
  ) : (
    filteredRows.map((row) => (
      <Card key={row._id} sx={{ backgroundColor: '#1e1e1e', color: 'white' }}>
        <CardContent>
          <Typography fontWeight="bold">{row.name}</Typography>
          <Typography variant="body2"><PhoneAndroidIcon fontSize="small" sx={{ position: 'relative', top: '6px' }}/> {row.phone}</Typography>
          <Typography variant="body2">
           <PaymentIcon fontSize="small" sx={{ position: 'relative', top: '6px' }}/> Status:{' '}
            {row.status === 'Paid' ? (
              <DoneIcon fontSize="small" sx={{ color: 'green' }} />
            ) : (
              <ClearIcon fontSize="small" sx={{ color: 'red' }} />
            )}{' '}
            {row.status}
          </Typography>
          <Typography variant="body2">
            <CalendarMonthIcon fontSize="small" sx={{ position: 'relative', top: '6px' }}/> Last Paid: {row.lastPaidDate || 'N/A'}
          </Typography>
          <Typography variant="body2">
            <CancelIcon fontSize="small" sx={{ position: 'relative', top: '6px' }}/> Unpaid For: {row.unpaidFor} month(s)
          </Typography>

          <Divider sx={{ my: 1, backgroundColor: '#555' }} />

          <Box display="flex" gap={1} flexWrap="wrap">
         {row.status === 'Unpaid' ? (
  <Button
    variant="contained"
    size="small"
    onClick={() =>
  setConfirmAction({
    open: true,
    title: 'Confirm Payment',
    description: 'Are you sure you want to mark this member as paid?',
    onConfirm: () => markAsPaid(row.id)
  })
}
    startIcon={
      loadingId === row._id && loadingType === 'pay' ? (
        <CircularProgress size={20} sx={{ color: 'white' }} />
      ) : (
        <CurrencyRupeeIcon />
      )
    }
    sx={{ backgroundColor: '#4caf50', color: '#fff' }}
  >
    {loadingId === row._id && loadingType === 'pay' ? 'Processing' : 'Mark as Paid'}
  </Button>
) : (
  <Button
    size="small"
   onClick={() =>
  setConfirmAction({
    open: true,
    title: 'Undo Payment',
    description: (
      <>
        Are you sure you want to undo this payment?
        <br />
        <span style={{ display: 'block', marginTop: '8px', color: '#aaa' }}>
          (This option is only for cases where the member was marked as paid accidentally)
        </span>
      </>
    ),
    onConfirm: () => handleUndoMarkAsPaid(row.id)
  })
}
    startIcon={
      loadingId === row._id && loadingType === 'undo' ? (
        <CircularProgress size={20} sx={{ color: 'white' }} />
      ) : (
        <UndoIcon />
      )
    }
    sx={{ color: 'white' }}
  >
    {loadingId === row._id && loadingType === 'undo' ? 'Reverting' : 'Undo'}
  </Button>
)}


           <Button
  size="small"
 onClick={() =>
  setConfirmAction({
    open: true,
    title: 'Delete Member',
    description: 'This action is irreversible. Are you sure you want to delete this member?',
    onConfirm: () => handleDeleteMember(row.id)
  })
}
  startIcon={
    loadingId === row._id && loadingType === 'delete' ? (
      <CircularProgress size={20} sx={{ color: 'white' }} />
    ) : (
      <DeleteForeverIcon />
    )
  }
  sx={{ color: 'white' }}
>
  {loadingId === row._id && loadingType === 'delete' ? 'Deleting' : ''}
</Button>


            <Button
              size="small"
              onClick={() => handleEditMember(row)}
              startIcon={<EditIcon />}
              sx={{ color: '#2196f3' }}
            >
              Edit
            </Button>
          </Box>
        </CardContent>
      </Card>
    ))
  )}
</Box>

      )}

      {/* Add Member Modal */}
      <AddMemberModal open={isModalOpen} handleClose={handleCloseModal} />

      {/* Edit Member Modal */}
      <EditMemberModal
       loading={loading}
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        member={selectedMember}
        onUpdate={handleUpdateMember}
      />
      <ConfirmModal
        open={confirmAction.open}
        title={confirmAction.title}
        description={confirmAction.description}
        onConfirm={() => {
          confirmAction.onConfirm?.();
          setConfirmAction({ ...confirmAction, open: false });
        }}
        onCancel={() => setConfirmAction({ ...confirmAction, open: false })}
      />
       <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      
    </Box>
  );
};

export default MemberTableMobile;
