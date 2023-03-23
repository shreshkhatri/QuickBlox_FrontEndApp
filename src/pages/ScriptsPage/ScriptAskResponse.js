import { useState, useEffect } from "react"
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { validateKeyDownEvent, isEmpty } from '../../Objects/CommonFunctions';

export default function ScriptAskResponse(props) {
    const [expanded, setExpanded] = useState(true)
    const [responseName, setResponseName] = useState(props.label || '')
    const [changesSaved, setChangesSaved] = useState(true)
    const removeResponseData = props.removeResponseData
    const addOrUpdateResponseData = props.addOrUpdateResponseData
    const [responseType, setResponseType] = useState(props.inputType || 'string');
    

    const handleResponseTypeChange = (event) => {
        setResponseType(event.target.value);
        setChangesSaved(false)
        props.stepDefinitionComplete(props.stepID,false)
    };


    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`step Number ${props.stepID}:  response variable `}
                id={`${props.stepID}-response-variable`}
            >
                <Typography sx={{ width: '10%', flexShrink: 0 }}>
                    Step : {props.stepIndex + 1}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{props.stepLabel}</Typography>

            </AccordionSummary>
            <AccordionDetails>
            <Typography sx={{ flexShrink: 0 }}>
                    This step can be used to read user input. The user input will be read into the response name defined below.
                </Typography>
                <TextField
                    sx={{ color: 'text.secondary' }}
                    value={responseName}
                    fullWidth
                    size="small"
                    autoComplete="off"
                    label='Response name'
                    onKeyDown={e => validateKeyDownEvent(e)}
                    onChange={(e) => { 
                        setResponseName(e.target.value); 
                        setChangesSaved(false)
                        props.stepDefinitionComplete(props.stepID,false)
                     }}
                />
                
                <br></br>
                <FormControl fullWidth sx={{marginTop:1}}>
                    <InputLabel id="label-response-type">Response Type</InputLabel>
                    <Select
                        labelId="label-response-type"
                        id="label-response-tye-select"
                        value={responseType}
                        label="Response Type"
                        size="small"
                        onChange={handleResponseTypeChange}
                    >
                        <MenuItem value={'string'} selected>String</MenuItem>
                        <MenuItem value={'number'}>Number</MenuItem>
                    </Select>
                </FormControl>



                <Stack paddingTop={1} direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='right' spacing={2}>
                    <Button size="small" variant="outlined" disabled={changesSaved ? true : false} onClick={() => {
                        if (responseName.length===0){
                            return
                        }
                        addOrUpdateResponseData(props.stepID, {
                            name: responseName,
                            label:responseName,
                            inputType: responseType
                        })
                        props.onStepUpdate(props.stepID,
                            {
                                name: responseName,
                                label:responseName,
                                inputType: responseType,
                                stepDefinitionComplete:true
                            })
                        setChangesSaved(true)
                    }
                    }>Save Changes</Button>
                    <Button size="small" variant="outlined" onClick={() => {
                        removeResponseData(props.stepID)
                        props.onStepRemove(props.stepID)
                    }}>Delete Step</Button>
                </Stack>
            </AccordionDetails>
        </Accordion>)
}