import { useState, useEffect, useRef } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import CustomSnackbar from '../../components/CustomSnackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import ClassificationThresholdSelector from '../CreatePage/ThresholdSelector';
import { ACTION_TYPES } from '../../mainreducer'
import { decode } from 'html-entities'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'; import { spacing } from '@mui/system';
import ToggleButton from '@mui/material/ToggleButton';
import Alert from '@mui/material/Alert';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

export const Botsettings = () => {
    const dispatcher = useAppStateDispatch()
    const appState = useAppStateContext();
    const navigate = useNavigate()
    const [modelTrainable, setModelTrainable] = useState(false)
    const [projectSettingsEditable, setProjectSettingsEditable] = useState(false)
    const [projectName, setProjectName] = useState(decode(appState.projectName));
    const [training, setTraining] = useState(false);
    const [botServerPort, setBotServerPort] = useState(appState.settings.botServerPort)
    const [botName, setBotName] = useState(decode(appState.settings.botName))
    const [stateChanged, setStateChanged] = useState(false)
    const [isSavingProjectData, setIsSavingProjectData] = useState(false)
    const [settings, setSettings] = useState(appState.settings);
    const [trainingLog, setTrainingLog] = useState([]);
    const [textualizedLog, setTextualizedLog] = useState('')
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' });
    document.title = "Bot Settings " + AppTitle
    const [isBotServerOnline, setIsBotServerOnline] = useState(false);
    

    useEffect(() => {
        var content='';
        if(trainingLog.length===0){
            setTextualizedLog('No logs exist')
            return 
        }
        for (let i = 0; i < trainingLog.length; i++) {
            content += trainingLog[i]['log']
        }
        setTextualizedLog(content)


    }, [trainingLog])

    //useEffect for detecting that the project or chatbot details have been changed.
    useEffect(() => {
        if (!stateChanged) {
            setStateChanged(true)
        }
    }, [projectName, botServerPort, settings, botName])


    //use effect for retrieving the status of the project
    useEffect(async () => {
        await fetch(SERVER_URL + '/get-project-status', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName
            }),
            credentials: 'include'
        }).then(async (response) => {
            var json = await response.json()
            return { status: response.status, ...json }
        })
            .then(response => {
                console.log(response)

                if (response.status === 200) {
                    setModelTrainable(response.modelTrainable)
                    setProjectSettingsEditable(response.projectSettingsEditable)
                    setIsBotServerOnline(response.settings.isBotServerOnline)
                    setTrainingLog(response.trainingLog)
                }
                else {
                    setSnackBarPayload({
                        open: true,
                        severity: response.severity,
                        message: response.message
                    })
                }

            })
            .catch(error => {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while retrieving the project status. Please check your connection.'
                })
            });
    }, [])

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
    const handleProjectDetailFormSubmit = async (event) => {
        event.preventDefault();
        setIsSavingProjectData(true)

        await fetch(SERVER_URL + '/save-project-data', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName,
                settings: { ...settings, botName, botServerPort: parseInt(botServerPort) }
            }),
            credentials: 'include'
        }).then(async (response) => {
            var json = await response.json()
            return { status: response.status, ...json }
        })
            .then(response => {
                console.log(response)

                if (response.status === 200) {

                    dispatcher({ type: ACTION_TYPES.SET_PROJECT, payload: { projectName: projectName } })
                    dispatcher({ type: ACTION_TYPES.SET_SETTINGS, payload: { settings: settings } })
                    setSnackBarPayload({
                        open: true,
                        severity: "success",
                        message: response.message
                    })
                    setStateChanged(false)
                }
                else {
                    setSnackBarPayload({
                        open: true,
                        severity: "error",
                        message: response.message
                    })
                }
                setIsSavingProjectData(false)
            })
            .catch(error => {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while saving the project data into the database. Please check your connection.'
                })
                setIsSavingProjectData(false)
            });
    };

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }
    //function for training the model
    async function trianModel() {
        setTraining(true)
        await fetch(SERVER_URL + '/trainmodel', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName: appState.projectName,
                locale: appState.selectedLanguage.locale
            }
            ),
            credentials: 'include'
        }).then(async response => {
            const json = await response.json()
            return { status: response.status, ...json }
        }).then((jsondata) => {
            console.log(jsondata)
            if (jsondata.status === 200) {
                setSnackBarPayload({
                    open: true,
                    severity: jsondata.severity,
                    message: jsondata.message
                })
                dispatcher({ type: ACTION_TYPES.SET_SETTINGS, payload: { settings: { ...settings, currentBotServerPort: jsondata.currentBotServerPort } } })
                dispatcher({ type: ACTION_TYPES.MODEL_TRAINED_AT, payload: { modelTrainedAt: Date.now() } })
                setIsBotServerOnline(true)
            }
            else {
                setSnackBarPayload({
                    open: true,
                    severity: jsondata.severity,
                    message: jsondata.message
                })
                setIsBotServerOnline(false)


            }
            setTraining(false)
        })
            .catch(error => {
                setTraining(false)
                setSnackBarPayload({
                    open: true,
                    severity: 'error',
                    message: 'Connection failed while trying to train the model. Please check your connection'
                })
                setIsBotServerOnline(false)

            });


    }

    //function for updating the model status 
    async function updateBotStatus(status) {
        console.log(status)
        const requestedChange = status === 'On' ? true : false

        await fetch(SERVER_URL + '/update-botserver-status', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName: appState.projectName,
                isBotServerOnline: requestedChange
            }
            ),
            credentials: 'include'
        }).then(async response => {
            const json = await response.json()
            return { status: response.status, ...json }
        }).then((jsondata) => {
            console.log(jsondata)
            if (jsondata.status === 200) {
                setSnackBarPayload({
                    open: true,
                    severity: jsondata.severity,
                    message: jsondata.message
                })
                setIsBotServerOnline(jsondata.isBotServerOnline)
            }
            else {
                setSnackBarPayload({
                    open: true,
                    severity: jsondata.severity,
                    message: jsondata.message
                })


            }

        })
            .catch(error => {

                setSnackBarPayload({
                    open: true,
                    severity: 'error',
                    message: 'Connection failed while trying to update the model status'
                })

            });


    }

    return (<>
        <Box
            display="flex"
            flexDirection="column" spacing={1}
            sx={{ padding: 2 }} component="form" onSubmit={handleProjectDetailFormSubmit}
        >
            <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold', paddingY: 1 }}>Project Settings </Typography>
            {!projectSettingsEditable &&
                <Alert severity='info' sx={{ m: 1 }}>
                    The configuration files are being created. Please check this section later on for changing project settings.
                </Alert>
            }
            <TextField
                inputProps={{ maxLength: 15 }}
                size='small'
                margin='normal'
                id='setProjectName'
                label='Project Name (min 5 characters)'
                name='projectName'
                autoComplete='off'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
            />
            <TextField
                inputProps={{ maxLength: 15 }}
                size='small'
                margin='normal'
                id='setChatbotName'
                label='Chatbot Name (min 5 characters)'
                name='chatbotname'
                autoComplete='off'
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                autoFocus
            />
            <Box sx={{ p: 1, border: '1px solid #17A2B8', mt: 1 }}>
                <Typography align='left' sx={{ typography: 'subtitle2', fontWeight: 'bold', padding: 1, pb: 2 }}>NLU Settings</Typography>
                <div style={{ width: '20%' }}>
                    <ClassificationThresholdSelector sx={{ typography: 'subtitle2', padding: 2 }} settings={settings} setSettings={setSettings}></ClassificationThresholdSelector>
                </div>
            </Box>
            

            <Box sx={{ p: 1, border: '1px solid #17A2B8', mt: 1 }}>
                <Typography align='left' sx={{ typography: 'subtitle2', fontWeight: 'bold', padding: 1 }}>Networking</Typography>
                <Typography align='left' sx={{ typography: 'subtitle2' }}>Chatbot Server Port</Typography>
                <TextField
                    inputProps={{ maxLength: 15 }}
                    size='small'
                    margin='normal'
                    id='portNumber'
                    label='3000 < (Port Number) < 5000'
                    name='portNumber'
                    autoComplete='off'
                    type='number'
                    value={botServerPort}
                    onChange={(e) => setBotServerPort(e.target.value)}
                    autoFocus
                />
                 { botServerPort && botServerPort>3000 && botServerPort<5000 && <Typography align='left' sx={{ typography: 'subtitle2',p:1 }}>The bot will be accessible at the link <br></br><br></br> : http://localhost:{botServerPort}/directline/conversations</Typography>}
            </Box>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '1rem'
            }}><LoadingButton
                size="small"
                type="submit"
                loading={isSavingProjectData}
                loadingIndicator="Saving ..."
                variant="contained"
                disabled={projectSettingsEditable && stateChanged ? false : true}
            >
                    <span>Save Changes</span>
                </LoadingButton>

            </div>
            <br></br>
        </Box>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '1rem' }}>
            <Typography align='left' sx={{ typography: 'subtitle2' }}>Model Status</Typography>
            <ToggleButtonGroup
                value={isBotServerOnline ? "On" : "Off"}
                onChange={(event, change) => updateBotStatus(change)}
                aria-label="model status"
                exclusive
            >
                <ToggleButton aria-label="on" size='small' value="On" >
                    <Typography sx={{ typography: 'subtitle2' }} color={isBotServerOnline ? 'green' : 'black'}>On</Typography>
                </ToggleButton>
                <ToggleButton aria-label="off" size='small' value="Off">
                    <Typography sx={{ typography: 'subtitle2' }}>Off</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
        </div>

        <Box sx={{ p: 1, border: '1px solid #17A2B8', mt: 1 }} >

            <Typography align='left' sx={{ typography: 'subtitle2', fontWeight: 'bold', padding: 1 }}>Model Training</Typography>
            {!modelTrainable &&
                <Alert severity='info' sx={{ m: 1 }}>
                    The configuration files are being created. Please check this section later on for model training.
                </Alert>
            }

            <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}><LoadingButton
                size="small"
                loading={training}
                loadingIndicator="Training..."
                variant="contained"
                onClick={() => trianModel()}
                disabled={modelTrainable ? false : true}
            >
                    <span>Train Model</span>
                </LoadingButton>

            </div>
            <Typography align='center' sx={{ typography: 'subtitle2', fontWeight: 'bold', padding: 1 }}>Model Training Logs</Typography>
            {trainingLog.length === 0 &&
                <Typography align='center' sx={{ typography: 'subtitle2', padding: 2 }}>No Training logs found for this project.</Typography>
            }
            {
                trainingLog.length !== 0 &&
                <div style={{ border: '1px solid grey', margin: '.5rem' }}>

                    <Editor
                        value={textualizedLog}
                        highlight={textualizedLog => highlight(textualizedLog, languages.plaintext)}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 12,
                            maxHeight:'10rem',
                            overflowY:'scroll'
                        }}
                        disabled
                    />
                </div>
            }




        </Box>

        <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
    </>

    );
}