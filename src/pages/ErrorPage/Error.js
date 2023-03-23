
import { useLocation } from "react-router-dom"
import TopAppBar from "../../components/TopAppBar"
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AppTitle } from "../../config";
import Grid from '@material-ui/core/Grid';
import { Navigate } from "react-router-dom";
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { useTheme } from '@mui/material/styles';

export default function Error() {
    const {state, state : {status,severity,message}} = useLocation()
    const theme = useTheme()
    console.log(state)
    document.title = `Error Occured` + AppTitle

    return !state ? <Navigate to="/" replace /> :
        <>
        <Box height='100vh' width='100%' display='flex' flexDirection={'column'}>
        <TopAppBar />
            <Box  height='100%' width='100%' justify='center' sx={{paddingTop:{xs:15,sm:15,md:20,lg:25,xl:30}}}>
                <Grid container justify='center'>
                    <Grid item  style={{textAlign:'center',paddingTop:'2rem'}}>
                        <ReportProblemOutlinedIcon sx={{ color: theme.palette.primary.main, fontSize: '3rem' }}></ReportProblemOutlinedIcon>
                    </Grid>
                    <Grid item style={{padding:'2rem'}}>
                        <Typography sx={{color:theme.palette.error.main}} variant="h4" padding='2' >{status} {severity && severity.toUpperCase()}</Typography>
                        <Typography sx={{color:theme.palette.error.light}} variant="h6" padding='2'>{message}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
        </>
}

