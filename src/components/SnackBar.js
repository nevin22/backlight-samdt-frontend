import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbar(props) {
  const handleClose = (event, reason) => {
    props.close();
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar open={props.open} autoHideDuration={3500} onClose={handleClose}>
        <Alert onClose={handleClose} severity={props.success ? "success" : "error"} sx={{ width: '100%' }}>
          {props.success ? 'Action Success' : 'Action Failed'}
        </Alert>
      </Snackbar>
    </Stack>
  );
}