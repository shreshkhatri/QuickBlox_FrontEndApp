import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog({title,displayMessage,openDialog,setOpenDialog,onConfirm}) {

  return (
    <div>
      <Dialog
        open={openDialog}
        onClose={()=>setOpenDialog(false)}
        aria-labelledby="common-alert-dialog-title"
        aria-describedby="common-alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="common-alert-dialog-description">
            {displayMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Cancel</Button>
          <Button onClick={onConfirm} autoFocus>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}