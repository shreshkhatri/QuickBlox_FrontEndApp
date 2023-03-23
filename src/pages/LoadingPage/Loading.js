import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function LoadingPage({hidden}) {
    return (
        <Box display={hidden?"none":"flex"} sx={{ width: '100%', height: '100vh', flexDirection: 'column',justifyContent:'center',alignItems: 'center' }} >
            <CssBaseline />
            <CircularProgress />
            <br/>
            <Typography component='h6' variant='h6'>
                Loading
            </Typography>
        </Box>
    )
}