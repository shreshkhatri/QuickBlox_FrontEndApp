import {useState} from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function EntityPopOver({anchoredElement}) {
  const [anchorEl, setAnchorEl] = useState(anchoredElement);
  const [open,setOpenState]= useState(Boolean(anchoredElement))

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
      <Popover
        id='popover'
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
      </Popover>
  );
}