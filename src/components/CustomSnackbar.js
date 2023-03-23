import { useState, forwardRef } from 'react'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomSnackbar({ snackBarPayload, closeSnackbar }) {
  return (
    <Snackbar
      open={snackBarPayload.open}
      autoHideDuration={4000}
      onClose={closeSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert severity={snackBarPayload.severity} sx={{ width: '100%' }}>
        {snackBarPayload.message}
      </Alert>
    </Snackbar>
  );
}


