import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog(props) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        props.closeAlert();
    };

    return (
        <React.Fragment>
            <Dialog
                open={props.openAlert}
                onClose={handleClose}
                maxWidth="sm"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" style={{ fontWeight: 'bold' }}>
                    {props.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {props.contentText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            backgroundColor: '#F0F3F5',
                            color: 'black',
                            '&:hover': {
                                backgroundColor: '#F0F3F5',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            props.onProceed(props.publishAll);
                            handleClose()
                        }}
                        sx={{
                            color: 'white`'
                        }}
                    >
                        Proceed
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}