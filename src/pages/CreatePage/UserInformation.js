import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { validateEmail } from '../../Objects/CommonFunctions'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PasswordStrengthBar from 'react-password-strength-bar'
import Stack from '@mui/material/Stack'
import { SERVER_URL, AppTitle } from '../../config'
import { TailSpin } from 'react-loading-icons'
import CustomSnackbar from '../../components/CustomSnackbar';

export default function UserInformation({
    useremail, setUseremail, password, setPassword, confirmPassword, setConfirmPassword, checkingEmailAvailability, setCheckingEmailAvailability,
    emailAvailabilityResponse, setEmailAvailabilityResponse, isPasswordMatched, setIsPasswordMatched, setValidEmail
}) {

    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }



    useEffect(() => {
        if (password.length !== 0 && confirmPassword.length !== 0 && password === confirmPassword) {
            setIsPasswordMatched(true)
        }
        else {
            setIsPasswordMatched(false)
        }
    }, [password, confirmPassword])


    //useeffect for triggerig if the entered email is valid and if valid it will check
    //for their availability in the database
    useEffect(async () => {
        setEmailAvailabilityResponse(null)
        if (!validateEmail(useremail)) return
        setCheckingEmailAvailability(true)
        const response = await checkIfEmailCanBeUsed()
        if (response) {
            
            if (response.status === 200 ) {
                setEmailAvailabilityResponse(response)
                if (response.severity==='success') {
                    setValidEmail(true)
                }
                else if (response.severity==='error'){
                    setValidEmail(false)
                }
            }
            else
            setSnackBarPayload({
                open: true,
                severity: "error",
                message: response.message
            })
    
        }

        setCheckingEmailAvailability(false)

    }, [useremail])


    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
    async function checkIfEmailCanBeUsed() {

        const response = await fetch(SERVER_URL + '/check-email-usability', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({ useremail }),
            credentials: 'include'
        }).then(async (response) => {
            var json = await response.json()
            return { status: response.status, ...json }
        }).then((response) => {
            return response
        })
            .catch(error => {

                return { status:400,severity: 'error', message: 'Could not connect to server' }

            });
        return response
    }
    return (<>
        <Grid container >
            <CssBaseline />

            <Grid item xs={12} sm={12} md={12} >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                    }}
                >
                    <Box sx={{
                        mt: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                    }}>
                        <TextField
                            size='small'
                            margin="normal"
                            required
                            id="email"
                            label="Email Address"
                            name="email"
                            value={useremail}
                            type="email"
                            onChange={(e) => setUseremail(e.target.value)}
                            autoFocus
                            autoComplete="off"
                        />

                        {checkingEmailAvailability &&
                            <Stack direction='row' spacing={1}>
                                <TailSpin stroke="#000000" style={{ height: '1rem' }} />
                                <Typography align='left' sx={{ typography: 'subtitle2' }}>Checking email usability</Typography>
                            </Stack>
                        }
                        {emailAvailabilityResponse && emailAvailabilityResponse.status === 200 && emailAvailabilityResponse.severity==='success' &&
                            <Alert severity='success'>
                                {emailAvailabilityResponse.message}
                            </Alert>
                        }

                        {emailAvailabilityResponse && emailAvailabilityResponse.status === 200 && emailAvailabilityResponse.severity==='error' &&
                            <Alert severity='error'>
                                {emailAvailabilityResponse.message}
                            </Alert>
                        }
                        <TextField
                            size='small'
                            margin="normal"
                            required

                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {
                            password.length !== 0 && <PasswordStrengthBar password={password} style={{ width: '100%' }} />
                        }

                        <TextField
                            size='small'
                            margin="normal"
                            required
                            name="password"
                            label="Confirm Password"
                            type="password"
                            id="confirm-password"
                            autoComplete="off"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {isPasswordMatched &&
                            <Alert severity='success'>
                                Password matched
                            </Alert>
                        }
                        {!isPasswordMatched && password.length !== 0 && confirmPassword.length !== 0 &&
                            <Alert severity='error'>
                                Passwords not matched!
                            </Alert>
                        }

                    </Box>
                </Box>
            </Grid>
        </Grid>
        <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
    </>
    );
}