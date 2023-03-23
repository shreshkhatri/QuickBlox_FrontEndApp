import Typography from '@mui/material/Typography';

import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import { useState } from 'react'
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { validateKeyDownEvent, isEmpty } from '../../Objects/CommonFunctions';

export const ExistingIntentData = (props) => {
    const appState = useAppStateContext()
    const [intent, setIntent] = useState(props.intent)
    const [description, setDescription] = useState(props.description)
    const [utterances, updateUtterances] = useState(props.utterances)
    const [additionalUtterance, setAdditionalUtterance] = useState('')
    const [stateChanged, setStateChanged] = useState(false)
    const [loading, setLoading] = useState(false)   
    const setSnackBarPayload=props.setSnackBarPayload
    const navigate = useNavigate()
    console.log(props)


    //function to add more utterance to the list of dataset
    function appendUtterance() {
        if (!isEmpty(additionalUtterance)) {
            updateUtterances([...utterances, additionalUtterance])
            setAdditionalUtterance('')
            setStateChanged(true)
        }
    }


    //function for updating list of utterances in existing QandA dataset
    function updateUtterance(utteranceIndex, updatedUtterance) {
        if (isEmpty(updatedUtterance)) {
            return
        }

        var tempUtterances = utterances.map((utterance, uidx) => {
            if (utteranceIndex === uidx) {
                if (utterance.toLowerCase() !== updatedUtterance.toLowerCase()) {
                    setStateChanged(true)
                    return updatedUtterance
                }
                else {
                    return utterance
                }
            }
            else {
                return utterance
            }
        })
        updateUtterances([...tempUtterances])
    }

    //function for removing utterances from existing qanda data list
    function removeUntterance(utteranceIndex) {
        var tempUtterances = utterances.filter((utterance, uidx) => {
            return uidx !== utteranceIndex
        })

        //the list must have atleast one utterance
        if (tempUtterances.length === 0) {
            return
        }
        setStateChanged(true)
        updateUtterances([...tempUtterances])

    }

//function to update the existing intent data definition
async function updateIntentData() {
    if (utterances.length===0){
        setSnackBarPayload({
            open: true,
            severity: "error",
            message: 'No utterance to update with'
        })
        return 
    }
    var payload={
        'intent':props.intent,
        'description':props.description,
        'utterances':utterances
    };
    setLoading(true)
    
    console.log(payload)
    await fetch(SERVER_URL + '/update-intent-data', {
        method: "PUT",
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
        credentials: 'include'
    }).then(response => {
        return response.json()
    }).then((jsondata) => {
        if (jsondata.hasOwnProperty('code') && (jsondata.code === 400 || jsondata.code === 500)) {
            setSnackBarPayload({
                open: true,
                severity: "error",
                message: jsondata.message
            })
        }
        else if (jsondata.hasOwnProperty('code') && jsondata.code === 200) {
            setSnackBarPayload({
                open: true,
                severity: "success",
                message: "Update Successful."
            })
            setStateChanged(false)

        }
        setLoading(false)
    })
        .catch(error => {
            setLoading(false)
            navigate('/error', { state: { error } })
        });

}


    return (

        <Accordion sx={{ width: '100%' }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={"existingIntent-content"}
            >
                <Typography sx={{ typography: 'subtitle2' }}>{description}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Intent : {intent}
                </Typography>
                <br></br>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Linked Script : {props.linkedScript || 'Not Linked yet.'}
                </Typography>
                <br></br>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Utterances
                </Typography>
                <List>
                    {utterances.map((utterance, utteranceIndex) => {
                        return <ListItem className='listItem' key={utteranceIndex} >
                            <TextField size='small' autoComplete='off' fullWidth value={utterance} onChange={e => updateUtterance(utteranceIndex, e.target.value)} />
                            <ListItemSecondaryAction><ClearIcon sx={{ fontSize: 'small' }} style={{ cursor: 'pointer',color:'gray' }} onClick={() => removeUntterance(utteranceIndex)} />
                            </ListItemSecondaryAction>
                        </ListItem>
                    })}
                    <ListItem className='listItem' key={utterances.length + 1}>
                        <ListItemText>
                            <TextField sx={{ marginRight: 2, paddingRight: 1 }} size='small' autoComplete='off' value={additionalUtterance} onChange={e => setAdditionalUtterance(e.target.value)} placeholder='Add utterance' fullWidth />
                        </ListItemText>
                        <Button variant="outlined" onClick={() => appendUtterance()}>Add</Button>
                    </ListItem>
                </List>
                <Button variant="contained" onClick={updateIntentData} disabled={stateChanged ? false : true} >Save Changes</Button>


            </AccordionDetails>
        </Accordion>

    );
}