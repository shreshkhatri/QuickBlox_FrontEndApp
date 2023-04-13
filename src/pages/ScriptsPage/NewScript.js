import { useState, useEffect, useRef,memo } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { validateKeyDownEvent, isEmpty } from '../../Objects/CommonFunctions';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ListItemButton, ListItemText, ListItemAvatar, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import './NewScript.css'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScriptBotResponse from './ScriptBotResponse';
import ScriptDynamicResponse from './ScriptDynamicResponse';
import ScriptAskResponse from './ScriptAskResponse';
import ScriptLinkAnotherScript from './ScriptLinkAnotherScript';
import ScriptCondition from './ScriptCondition';
import LoadingButton from '@mui/lab/LoadingButton';
import CustomSnackbar from '../../components/CustomSnackbar';
import { CustomError } from '../../Objects/CustomError';
import ScriptTriggerIntent from './ScriptTriggerIntent';

function NewScript() {

    const [topAccordionExpanded, setTopAccordionExpanded] = useState(false)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [scriptName, setScriptName] = useState('')
    const [scriptDescription, setScriptDescription] = useState('')
    const [triggeringIntent, setTriggeringIntent] = useState('')
    const [inputIntentName, setInputIntentName] = useState('');
    const [listOfIntentNames, setListOfIntentNames] = useState([])
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })

    /*************************** Conversation Flow*************************************/
    const [scriptFlow, updateScriptFlow] = useState([])
    const [listOfResponseNames, updateListOfResponseNames] = useState([])
    /*****************************************8****************************************/

    const [pageLoading, setpageLoading] = useState(true)
    const appState = useAppStateContext();
    const [clicked, setClick] = useState(true)
    const containerRef = useRef(null);
    const [open, setOpen] = useState(true);

    /************************* Bot Response Definition ******************************/

    const stepList = [
        { stepLabel: 'Bot Text Response', stepTypeIndex: 0 },
        { stepLabel: 'Dynamic Response', stepTypeIndex: 1 },
        { stepLabel: 'Read Response', stepTypeIndex: 2 },
        { stepLabel: 'Condition Evaluation', stepTypeIndex: 3 },
        { stepLabel: 'Link Existing script', stepTypeIndex: 4 },
        { stepLabel: 'Trigger an Intent', stepTypeIndex: 5 }
    ]

    console.log(scriptFlow)
    console.log(listOfResponseNames)


    //function to verify all details related to script are defined
    function isScriptDefinitionComplete() {

        var scriptValid = true;

        scriptFlow.forEach(item => {
            if (!item.stepDefinitionComplete) {
                scriptValid = false
            }
        })

        if (!scriptValid) {            
            return false
        }

        return true
    }

    function stepDefinitionComplete(stepID, status) {
        var tempScriptFlow = scriptFlow.map((step) => {
            if (step.stepID === stepID) {
                return { ...step, stepDefinitionComplete: status }
            }
            else {
                return step
            }
        })
        updateScriptFlow(tempScriptFlow)

    }

    //useEffect for displaying the existing  qandA dataset for the selected language when the page
    //loads for the first time or is refreshed
    useEffect(() => {
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-intent-only-names', {
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
                }),
                
            }).then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                else {
                    throw new CustomError(response.status, response.statusText)
                }
            }).then((jsondata) => {

                setListOfIntentNames(jsondata.map(item => item.intent))
            })
                .catch(error => {
                    navigate('/error', { state: { error } })
                });
        }
        if (appState.hasOwnProperty('projectName') && appState.hasOwnProperty('selectedLanguage')) {
            fetchdata()
        }
    }, [])


    //function for closing the snackbar
    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    //function to upload and save new Intent data
    async function saveNewScript(event) {
        event.preventDefault();

        if (!isScriptDefinitionComplete()) {
            return
        }

        var payload = {
            scriptName,
            listOfResponseNames,
            scriptDescription,
            triggeringIntent,
            scriptFlow
        }

        setLoading(true)
        await fetch(SERVER_URL + '/save-script-data', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName: appState.projectName,
                locale: appState.selectedLanguage.locale,
                email: appState.email,
                payload: payload
            } 
            ),
            
        }).then(async response => {
            var json = await response.json()
            return {status:response.status,...json}
        }).then((jsondata) => {
            if (jsondata.status !== 200) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
            }
            else if (jsondata.status === 200) {
                setSnackBarPayload({
                    open: true,
                    severity: "success",
                    message: "The script data has been saved successfully."
                })

            }
            setLoading(false)
        })
            .catch(error => {
                setLoading(false)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: "Connection error occured while saving the new script data. Please check your connection."
                })
            });

    }

    //function to update condition dadta
    function upDateScriptConditionData(stepID, stepdata) {
        var tempScriptFlow = scriptFlow.map((step) => {
            if (step.stepID === stepID) {
                return { ...step, stepToRunIfTrue: stepdata }
            }
            else {
                return step
            }
        })
        updateScriptFlow(tempScriptFlow)
    }

    //function to add response name
    function addOrUpdateResponseData(stepID, data) {
        var alteration = false
        var tempListOfResponseNames = listOfResponseNames.map(item => {
            if (item.stepID === stepID) {
                alteration = true
                return {
                    stepID: stepID,
                    ...data
                }
            }
            else {
                return item
            }
        })

        if (alteration) {
            updateListOfResponseNames(tempListOfResponseNames)
        }
        else if (!alteration) {
            updateListOfResponseNames([...listOfResponseNames, { stepID: stepID, ...data }])
        }

    }


    //function to remove response name
    function removeResponseData(stepID) {
        var tempListOfResponseNames = listOfResponseNames.filter(item => item.stepID !== stepID)
        updateListOfResponseNames(tempListOfResponseNames)
    }


    //function for removing the step
    function onStepRemove(stepID) {
        updateScriptFlow(scriptFlow.filter((step) => step.stepID !== stepID))
    }

    //function for updating step
    function onStepUpdate(stepID, update) {
        var tempScriptFlow = scriptFlow.map((step) => {
            if (step.stepID === stepID) {
                return { ...step, ...update }
            }
            else {
                return step
            }
        })
        updateScriptFlow(tempScriptFlow)
    }

    //function for rendering the step GUI inside the LIST component
    function mapStep(step) {

        switch (step.stepTypeIndex) {
            case 0:
                return <ScriptBotResponse
                    key={step.stepID}
                    {...step}
                    onStepRemove={onStepRemove}
                    onStepUpdate={onStepUpdate}
                    stepDefinitionComplete={stepDefinitionComplete}
                />
            case 1:
                return <ScriptDynamicResponse
                    key={step.stepID}
                    {...step}
                    onStepRemove={onStepRemove}
                    onStepUpdate={onStepUpdate}
                    stepDefinitionComplete={stepDefinitionComplete}
                />
            case 2:
                return <ScriptAskResponse
                    key={step.stepID}
                    {...step}
                    onStepRemove={onStepRemove}
                    onStepUpdate={onStepUpdate}
                    addOrUpdateResponseData={addOrUpdateResponseData}
                    removeResponseData={removeResponseData}
                    stepDefinitionComplete={stepDefinitionComplete}
                />
            case 3:
                return <ScriptCondition
                    key={step.stepID}
                    {...step}
                    upDateScriptConditionData={upDateScriptConditionData}
                    listOfResponseNames={listOfResponseNames}
                    onStepRemove={onStepRemove}
                    onStepUpdate={onStepUpdate}
                    stepDefinitionComplete={stepDefinitionComplete}
                />

            case 4:
                return <ScriptLinkAnotherScript
                    key={step.stepID}
                    {...step}
                    onStepRemove={onStepRemove}
                    onStepUpdate={onStepUpdate}
                    stepDefinitionComplete={stepDefinitionComplete}
                />

                case 5:
                    return <ScriptTriggerIntent
                        key={step.stepID}
                        {...step}
                        onStepRemove={onStepRemove}
                        onStepUpdate={onStepUpdate}
                        stepDefinitionComplete={stepDefinitionComplete}
                    />


            default:
                break;
        }
    }

    return (
        
        <Accordion sx={{ width: '100%' }} expanded={topAccordionExpanded} onChange={() => setTopAccordionExpanded(!topAccordionExpanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="newscript-content"
                id="newscript-content"
            >
                <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>New Script</Typography>
            </AccordionSummary>
            <AccordionDetails>
        <Box
            display="flex"
            justifyContent="center"
            alignItems="stretch"
            flexDirection="column"
            padding={2}
            ref={containerRef}
        >

            <Box component="form" onSubmit={saveNewScript}>
                <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>Create New Script</Typography>
                <TextField
                    size='small'
                    margin="normal"
                    required
                    fullWidth
                    id="script-name"
                    label="Script Name ( min. 5 characters)"
                    name="script-name"
                    autoComplete='off'
                    value={scriptName}
                    onKeyDown={e => validateKeyDownEvent(e)}
                    onChange={e => setScriptName(e.target.value)}
                    autoFocus
                />

                <TextField
                    size='small'
                    margin="normal"
                    required
                    fullWidth
                    name="script-discription"
                    label="Script Description ( min. 5 characters )"
                    id="script-discription"
                    autoComplete='off'
                    sx={{ width: '100%' }}
                    value={scriptDescription}
                    onChange={e => setScriptDescription(e.target.value)}
                />
                <Autocomplete
                    autoComplete='off'
                    fullWidth
                    size='small'
                    value={triggeringIntent}
                    onChange={(event, newValue) => {
                        setTriggeringIntent(newValue);
                    }}
                    inputValue={inputIntentName}
                    onInputChange={(event, newInputValue) => {
                        setInputIntentName(newInputValue);
                    }}
                    id="triggering-intent-selector"
                    options={listOfIntentNames}
                    noOptionsText="No Intents found"
                    renderInput={(params) => <TextField {...params} label="Triggering Intent Name" />
                    }
                />
                <br></br>

                <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>Script Flow (Script Steps)</Typography>

                <Box>
                    {
                        scriptFlow.length !== 0 &&
                        scriptFlow.map((step, index) => { return mapStep({ ...step, stepIndex: index }) })
                    }

                    {scriptFlow.length === 0 && <Typography padding={2} align='center' sx={{ typography: 'subtitle1' }}>Please select the options to create the conversation flow. </Typography>}


                </Box>

                <br></br>
                <Typography align='center' sx={{ typography: 'subtitle1' }}>Options for Next Step : </Typography>
                <Stack direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='center' spacing={2}>
                    {
                        stepList.map(({ stepLabel, stepTypeIndex }, index) => {
                            return <Button className='ScriptListItem' variant='outlined' key={index} onClick={() => updateScriptFlow([...scriptFlow, { stepID: scriptFlow.length, stepDefinitionComplete: false, ...stepList[stepTypeIndex] }])}>{stepLabel}</Button>
                        })
                    }
                </Stack>
                <br></br>
                <Stack spacing={2} direction='row' justifyContent='center' >
                    <Button variant='outlined' onClick={() => updateScriptFlow([])}>Cancel</Button>
                    <LoadingButton
                        type='submit'
                        size="small"
                        loading={loading}
                        loadingIndicator="Saving..."
                        variant="contained"
                    >
                        <span>Save</span>
                    </LoadingButton>

                </Stack>
            </Box>
            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>

        </Box>
        </AccordionDetails>
        </Accordion>

    );
}

 export default memo(NewScript);