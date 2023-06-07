import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import { useState, useEffect } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { CustomError } from '../../Objects/CustomError';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

export default function ScriptLinkAnotherScript(props) {
    const appState = useAppStateContext();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(true)
    const [changesSaved, setChangesSaved] = useState(true)
    const [inputScriptName, setInputScriptName] = useState('')
    const [linkedScript, setLinkedScript] = useState(props.linkedScript || '')
    const [listOfScriptNames, setListOfScriptNames] = useState([])
    
    useEffect(() => {
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-script-names', {
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
                credentials: 'include'
            }).then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                else {
                    throw new CustomError(response.status, response.statusText)
                }
            }).then((jsondata) => {
                setListOfScriptNames([props.scriptName, ...jsondata.map(scriptData => scriptData.scriptName)])
            })
                .catch(error => {
                    navigate('/error', { state: { error } })
                });
        }
        if (appState.hasOwnProperty('projectName') && appState.hasOwnProperty('selectedLanguage')) {
            fetchdata()
        }
    }, [props.scriptName])

    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`step Number ${props.stepID}:link-existing-script`}
                id={`${props.stepID}-link-existing-script`}
            >
                <Typography sx={{ width: '10%', flexShrink: 0 }}>
                    Step : {props.stepIndex + 1}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{props.stepLabel}</Typography>

            </AccordionSummary>
            <AccordionDetails>
                <Typography align='left' sx={{ typography: 'subtitle1' }}>Link To :</Typography>


                <Autocomplete
                    autoComplete='off'
                    fullWidth
                    size='small'
                    value={linkedScript}
                    onChange={(e, newValue) => {
                        setLinkedScript(newValue);
                        setChangesSaved(false);
                        props.stepDefinitionComplete(props.stepID, false);
                    }}
                    inputValue={inputScriptName}
                    onInputChange={(e, newInputValue) => {
                        setInputScriptName(newInputValue);
                        setLinkedScript(newInputValue); // Update linkedScript with the current input value
                    }}
                    id="triggering-intent-selector"
                    options={listOfScriptNames}
                    noOptionsText="No Existing Scripts found"
                    renderInput={(params) => (
                        <TextField {...params} label="...Script to be linked" />
                    )}
                />


                <br></br>
                <Stack paddingTop={1} direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='right' spacing={2}>
                    <Button size="small" variant="outlined" disabled={changesSaved ? true : false} onClick={() => {

                        //initially the object is null
                        if (!linkedScript) {
                            return
                        }

                        //we should not save state either if there is not a single rule or no any condition is defined to be executed
                        props.onStepUpdate(props.stepID,
                            {
                                linkedScript,
                                stepDefinitionComplete: true
                            })
                        setChangesSaved(true)
                    }
                    }>Save Changes</Button>
                    <Button size="small" variant="outlined" onClick={() => props.onStepRemove(props.stepID)}>Delete Step</Button>
                </Stack>
            </AccordionDetails>
        </Accordion >)
}
