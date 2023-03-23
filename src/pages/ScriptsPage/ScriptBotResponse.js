import { useState, useEffect } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function ScriptBotResponse(props) {
    const [expanded, setExpanded] = useState(true)
    const [botResponse, setBotResponse] = useState(props.botResponse || '')
    const [stepDescription, setStepDescription] = useState('')
    const [changesSaved, setChangesSaved] = useState(true)


    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`step Number ${props.stepID}:  bot response `}
                id={`${props.stepID}-bot-response`}
            >
                <Typography sx={{ width: '10%', flexShrink: 0 }}>
                    Step : {props.stepIndex + 1}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{props.stepLabel}</Typography>

            </AccordionSummary>
            <AccordionDetails>
                <Typography sx={{ flexShrink: 0 }}>
                    The text defined inside the box will be used by the chatbot while responding to the user utterance.<br></br>
                </Typography>
                <TextField
                    sx={{ color: 'text.secondary' }}
                    value={botResponse}
                    fullWidth
                    size="small"
                    autoComplete="off"
                    label='Bot says ...'
                    onChange={(e) => {
                        setBotResponse(e.target.value);
                        setChangesSaved(false);
                        props.stepDefinitionComplete(props.stepID, false)
                    }}
                />

                <Stack paddingTop={1} direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='right' spacing={2}>
                    <Button size="small" variant="outlined" disabled={changesSaved ? true : false} onClick={() => {
                        //bot response empty means nothing to save
                        if (botResponse.length === 0) {
                            return
                        }

                        props.onStepUpdate(props.stepID,
                            {
                                botResponse,
                                stepDefinitionComplete: true
                            })
                        setChangesSaved(true)

                    }
                    }>Save Changes</Button>

                    <Button size="small" variant="outlined" onClick={() => props.onStepRemove(props.stepID)} sx={{ display: props.hideDeleteButton ? 'none' : 'show' }}>Delete Step</Button>
                </Stack>
            </AccordionDetails>
        </Accordion>)
}