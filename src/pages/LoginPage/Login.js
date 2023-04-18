import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ThreeDots } from 'react-loading-icons'
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { Link as RouterLink } from "react-router-dom";
import { useAppStateContext, useAppStateDispatch } from '../../ApplicationContextProvider'
import { ACTION_TYPES } from '../../mainreducer'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SERVER_URL, AppTitle } from '../../config'
import { useNavigate } from 'react-router-dom'
import LoadingPage from '../LoadingPage/Loading';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://quickblox.com/">
                QuickBlox
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}
const theme = createTheme();

export default function LoginPage() {

    const [pageLoading, setpageLoading] = useState(true);
    const dispatch = useAppStateDispatch()
    const appState = useAppStateContext()
    document.title = 'Login' + AppTitle
    const [useremail, setUseremail] = useState('')
    const [signinIn, setSigninIn] = useState(false)
    const [password, setPassword] = useState('')
    const [loginResponse, setLoginResponse] = useState(null)
    const [isLoggedIn,setIsLoggedIn] = useState(false)
    const [isProjectDataLoaded,setIsProjectDataLoaded]=useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setpageLoading(false)
    }, [])
    
    //function to login
    async function login() {

        return await fetch(SERVER_URL + '/login', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({ useremail: useremail, password: password }),
            credentials:'include'
        }).then(async (response) => {
            var json = await response.json()
            return { status: response.status, ...json }
        })
            .then(response => {

                if (response.status === 200) {
                    setLoginResponse({ code: response.severity, message: response.message })
                    dispatch({ type: ACTION_TYPES.USER_LOGIN })
                    return true
                }
                else {
                    setLoginResponse({ code: response.severity, message: response.message })
                    return false
                }
            })
            .catch(error => {
                if (error) {
                    setLoginResponse({ code: "error", message: 'Client Side error has occured' })
                    return false
                }
            });
    }


    async function loadProjectData() {
        return await fetch(SERVER_URL + '/get-project-data', {
          method: "GET",
          redirect: 'follow',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'charset': 'UTF-8'
          },
          credentials:'include'
        }).then(async (response) => {
          var json = await response.json()
          return { status: response.status, ...json }
        }).then((jsondata) => {
          console.log(jsondata)
          if (jsondata.status === 200) {
            console.log(jsondata)
            dispatch({ type: ACTION_TYPES.SET_SELECTED_LANGUAGE, payload: { selectedLanguage: jsondata.selectedLanguage } })
            dispatch({ type: ACTION_TYPES.SET_PROJECT, payload: { projectName: jsondata.projectName } })
            dispatch({ type: ACTION_TYPES.SET_SETTINGS, payload: { settings: jsondata.settings } })
            dispatch({ type: ACTION_TYPES.SET_MODEL_TRAINABLE, payload: { modelTrainable: jsondata.modelTrainable } })
            dispatch({ type: ACTION_TYPES.SET_PROJECT_DATA_EDITABLE, payload: { projectSettingsEditable: jsondata.projectSettingsEditable } })
            return true
          }
          else {
            navigate('/error', { state: { ...jsondata } })
            return false
          }
        })
          .catch(error => {
  
            navigate('/error', {
              state: {
                status: '',
                severity: 'error',
                message: 'Connection error occured while obtaining the Project details'
              }
            }
            )
            return false
          }
          );
      }


    const handleSubmit = async (event) => {
        event.preventDefault();
        setSigninIn(true)

        //returns boolean response
        const loginResponse = await login()
        if(!loginResponse){
            setSigninIn(false)
            return
        }
        const loadProjectDataResponse = await loadProjectData()
        setIsLoggedIn(loginResponse)
        setIsProjectDataLoaded(loadProjectDataResponse)
        console.log('Login response ', loginResponse)
        console.log('PageLoad response ', loadProjectDataResponse)

        setSigninIn(false)
    };

    if (isLoggedIn && isProjectDataLoaded) {
        return <Navigate to="/" replace />;
    }
    else if (pageLoading) {
        return (<LoadingPage></LoadingPage>)
    }
    else
        return (
            <ThemeProvider theme={theme}>
                <Grid container component="main" sx={{ height: '100vh' }}>
                    <CssBaseline />
                    <Grid
                        item
                        xs={false}
                        sm={8}
                        md={8}
                        sx={{
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: (t) =>
                                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <Grid item xs={12} sm={4} md={4} component={Paper} elevation={6} square>
                        <Box
                            sx={{
                                my: 8,
                                mx: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Member sign in
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                <TextField
                                    size='small'
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    value={useremail}
                                    onChange={(e) => setUseremail(e.target.value)}
                                    autoFocus
                                    autoComplete="off"
                                />
                                <TextField
                                    size='small'
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="off"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Remember me"
                                />
                                {loginResponse &&
                                    <Alert severity={loginResponse.code}>
                                        {loginResponse.message}
                                    </Alert>
                                }
                                <Button
                                    size='small'
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {signinIn && <ThreeDots speed={.5} style={{ padding: '.60rem' }} />}
                                    {!signinIn && "Sign In"}
                                </Button>
                                <Grid container>
                                    <Grid item>
                                        <RouterLink to='/create-chatbot-project' style={{ textDecoration: 'none', color: 'inherit' }} >
                                            {"Don't have an account? Sign Up"}
                                        </RouterLink>
                                    </Grid>
                                </Grid>
                                <Copyright sx={{ mt: 5 }} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </ThemeProvider>
        );
}