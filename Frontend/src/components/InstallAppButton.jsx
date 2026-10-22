import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const InstallAppButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(isInstalled);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setHelpOpen(true);
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (installed) return null;

  return (
    <>
      <Button
        onClick={handleInstall}
        variant="contained"
        size="small"
        startIcon={<DownloadRoundedIcon />}
        sx={{
          bgcolor: '#d32f2f',
          color: '#fff',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: '#b71c1c' },
        }}
      >
        Install GFT
      </Button>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
        <DialogTitle>Install Gym Fee Tracker</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            On Android or desktop Chrome, open the browser menu and choose “Install app” or “Add to Home screen”.
          </Typography>
          <Typography paragraph>
            On iPhone or iPad, open this website in Safari, tap Share, then choose “Add to Home Screen”.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            If the install option is missing, make sure you are visiting the secure HTTPS website and try again after the page finishes loading.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallAppButton;
