import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@mui/material/TextField';
import MultipleLanguageSelector from './MultipleLanguageSelector';
import ClassificationThresholdSelector from './ThresholdSelector'
import { SERVER_URL, AppTitle } from '../../config'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider';
import { ACTION_TYPES } from '../../mainreducer';
import { CustomError } from '../../Objects/CustomError';
import UserInformation from './UserInformation';
import CustomSnackbar from '../../components/CustomSnackbar';
import { Link as RouterLink } from "react-router-dom";
import { Botsettings } from '../BotsettingsPage/Botsettings';

const steps = [
    {
        label: 'User Information',
        description: `User email and password id is required for this section.`,
        elements: <></>
    },
    {
        label: 'Chatbot Project Name',
        description: `The project name is used as an identification for the application. Once confirmed it will not be changed.`,
        elements: <></>
    },
    {
        label: 'Languages',
        description:
            'Please, select at-least one language from the search box below for the dataset.',
    },
    {
        label: 'ChatBot Settings',
        description: `These settings will be used as initial settings. Those settings can be changed later on using bot settings menu later on.`,
    }
];

export function CreateChatbotProject() {
    const dispatcher = useAppStateDispatch()
    const appState = useAppStateContext();
    const [useremail, setUseremail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [checkingEmailAvailability, setCheckingEmailAvailability] = useState(false)
    const [validEmail, setValidEmail] = useState(false)
    const [emailAvailabilityResponse, setEmailAvailabilityResponse] = useState(null)
    const [isPasswordMatched, setIsPasswordMatched] = useState(false)
    const [projectName, setProjectName] = useState('');
    const [languages, setLanguages] = useState([]);
    const [settings, setSettings] = useState({ nlu: { threshold: 0.6 }, botName: 'Test Bot', botServerPort: 3000 });

    const [activeStep, setActiveStep] = useState(0);
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })

    document.title = "Project Set Up" + AppTitle
    const handleNext = (index) => {
        if (index == 0 && !validEmail || !isPasswordMatched) {
            return
        }
        else if (index == 1 && projectName.length < 5) {
            return
        }
        else if (index == 2 && languages.length == 0) {
            return
        }
        else if (index == 3 && settings.botName.length < 5 || isNaN(settings.botServerPort) || settings.botServerPort < 3000 || settings.botServerPort > 5000) {
            return
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        //alert(JSON.stringify({'project-name':projectName,'languages':languages,'settings':settings}))
        await fetch(SERVER_URL + '/create-chatbot-project', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                useremail,
                password,
                confirmPassword,
                projectName,
                languages,
                settings:{...settings,isBotServerOnline:false},
                defaultLanguage: languages[0]
            }),
            credentials: 'include'
        })
            .then(async (response) => {
                var json = await response.json()
                return { status: response.status, ...json }
            })
            .then(response => {
                if (response.status === 200) {
                    console.log(response)
                    
                    dispatcher({ type: ACTION_TYPES.USER_LOGIN,payload: { useremail }})
                    dispatcher({ type: ACTION_TYPES.SET_SELECTED_LANGUAGE, payload: { selectedLanguage: response.projectData.languages[0] } })
                    dispatcher({ type: ACTION_TYPES.SET_PROJECT, payload: { projectName: response.projectData.projectName } })
                    dispatcher({ type: ACTION_TYPES.SET_SETTINGS, payload: { settings: response.projectData.settings } })
                }
                else setSnackBarPayload({
                    open: true,
                    severity: response.severity,
                    message: response.message
                })
            }).catch(error => {
                setSnackBarPayload({
                    open: true,
                    severity: 'error',
                    message: 'Connection error occured'
                })
            });
    };
    if (appState.hasOwnProperty('loginstatus') && appState.loginstatus === true && appState.hasOwnProperty('settings') && appState.hasOwnProperty('projectName')) {
        return <Navigate to="/" replace />;
    }
    return (
        <>
            <Box component="form" onSubmit={handleSubmit} sx={{
                padding: 4
            }}>
                <Grid container justify='center'>

                    <Grid item xs={12} sm={5} md={4} lg={4}>
                        <Box justifyContent={'right'}>
                            <RouterLink to='/login' style={{ textDecoration: 'none', color: 'blue' }} >
                                {"Already a user ? log In here"}
                            </RouterLink>
                        </Box>

                        <Typography variant="h5" padding={4}>Project Setup</Typography>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((step, index) => (
                                <Step key={step.label}>
                                    <StepLabel
                                    >
                                        {step.label}
                                    </StepLabel>
                                    <StepContent>
                                        <Typography>{step.description}</Typography>
                                        <Box sx={{ mb: 2 }} justifyContent='center'>
                                            {index == 0 && <UserInformation {...{
                                                useremail,
                                                setUseremail,
                                                password, setPassword, confirmPassword, setConfirmPassword,
                                                checkingEmailAvailability, setCheckingEmailAvailability,
                                                emailAvailabilityResponse, setEmailAvailabilityResponse,
                                                isPasswordMatched, setIsPasswordMatched,
                                                setValidEmail
                                            }}
                                            />}

                                            {index == 1 && <><TextField
                                                inputProps={{ maxLength: 20 }}
                                                size='small'
                                                margin='normal'
                                                fullWidth
                                                id='setProjectName'
                                                label='Project Name (min 5 characters)'
                                                name='projectName'
                                                autoComplete='off'
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                autoFocus
                                            />
                                                <br />
                                            </>}
                                            {index == 2 && <><br /><MultipleLanguageSelector setLanguages={setLanguages}></MultipleLanguageSelector></>}
                                            {index == 3 && <>
                                                <TextField
                                                    inputProps={{ maxLength: 20 }}
                                                    size='small'
                                                    margin='normal'
                                                    fullWidth
                                                    id='botName'
                                                    label='Chatbot Name (min 5 characters)'
                                                    name='botName'
                                                    autoComplete='off'
                                                    value={settings.botName}
                                                    onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                                                    autoFocus
                                                />
                                                <Typography sx={{ pt: 1 }}>Port Number</Typography>
                                                <TextField
                                                    inputProps={{ maxLength: 15 }}
                                                    size='small'
                                                    fullWidth
                                                    margin='normal'
                                                    id='portNumber'
                                                    label='3000 < (Port Number) < 5000'
                                                    name='portNumber'
                                                    autoComplete='off'
                                                    type='number'
                                                    value={settings.botServerPort}
                                                    onChange={(e) => setSettings({ ...settings, botServerPort: parseInt(e.target.value) })}
                                                    autoFocus
                                                />
                                                <br />
                                                <div style={{ width: '50%', paddingTop: '1rem' }}>
                                                    <ClassificationThresholdSelector settings={settings} setSettings={setSettings} ></ClassificationThresholdSelector>
                                                </div>
                                            </>}
                                            <Button
                                                variant="contained"
                                                onClick={() => handleNext(index)}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                {index === steps.length - 1 ? 'Continue' : 'Continue'}
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                        {activeStep === steps.length && (
                            <Paper square elevation={0} sx={{ p: 3 }}>
                                <Typography>Information Provided, Please click on &apos;Confim & Save&apos; button for creating the project or click on Reset button to restart</Typography>
                                <Button type='submit' sx={{ mt: 1, mr: 1 }}>
                                    Confirm & Save
                                </Button>
                                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                                    Review Details
                                </Button>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Box>
            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
        </>
    );
}  
