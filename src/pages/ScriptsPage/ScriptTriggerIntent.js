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

export default function ScriptTriggerIntent(props) {
    const appState = useAppStateContext();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(true)
    const [changesSaved, setChangesSaved] = useState(true)
    const [inputIntentName, setInputIntentName] = useState('')
    const [intentToTrigger, setIntentToTrigger] = useState(props.intentToTrigger || null)
    const [listOfIntentNames, setListOfIntentNames] = useState([])
    console.log(intentToTrigger)


    //useEffect for downloading the names of the existing intents either with static response or dynamic response

    useEffect(() => {
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-intent-to-link-names', {
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
                credentials:'include'
            }).then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                else {
                    throw new CustomError(response.status, response.statusText)
                }
            }).then((jsondata) => {

                setListOfIntentNames(jsondata.map(intentData => intentData.intentName))
            })
                .catch(error => {
                    navigate('/error', { state: { error } })
                });
        }
        if (appState.hasOwnProperty('projectName') && appState.hasOwnProperty('selectedLanguage')) {
            fetchdata()
        }
    }, [])

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
                    value={intentToTrigger}
                    onChange={(e, newValue) => {
                        setIntentToTrigger(newValue);
                        setChangesSaved(false)
                        props.stepDefinitionComplete(props.stepID,false)
                    }}
                    inputValue={inputIntentName}
                    onInputChange={(e, newInputValue) => {
                        setInputIntentName(newInputValue);
                    }}
                    id="triggering-intent-selector"
                    options={listOfIntentNames}
                    noOptionsText="No Existing Intents found"
                    renderInput={(params) => <TextField {...params} label="...Script to be linked" />
                    }
                />

                <br></br>
                <Stack paddingTop={1} direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='right' spacing={2}>
                    <Button size="small" variant="outlined" disabled={changesSaved ? true : false} onClick={() => {

                        //initially the object is null
                        if (!intentToTrigger){
                            return
                        }

                        props.onStepUpdate(props.stepID,
                            {
                                intentToTrigger,
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
