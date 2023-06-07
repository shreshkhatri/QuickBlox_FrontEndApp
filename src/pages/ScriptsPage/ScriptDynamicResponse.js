import { useState, useEffect } from "react"
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { SERVER_URL } from '../../config';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DynamicResponse from "../QandAPage/DynamicResponse";
import { useNavigate } from 'react-router-dom';
import CustomSnackbar from '../../components/CustomSnackbar';

export default function ScriptDynamicResponse(props) {
    const appState = useAppStateContext()
    const [expanded, setExpanded] = useState(true)
    const [actionName, setActionName] = useState(props.actionName || 'action_name')
    const [actionCode, setActionCode] = useState(props.actionCode || codeTemplateGenerator('action_name'))
    const [actionNameAlreadyExists, setActionNameAlreadyExists] = useState(false)
    const [changesSaved, setChangesSaved] = useState(true)
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })
    const navigate = useNavigate()

    const original_action_name = props.actionName

    //use effect for setting the action Name and checking the availability of the names
    useEffect(() => {
        if (actionName === original_action_name){
            return;
        }
        
        checkAailabilityActionName(actionName)
    }, [actionName])

    useEffect(() => {
        setChangesSaved(false)
        props.stepDefinitionComplete(props.stepID,false)
    }, [actionCode,actionName])

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    //function for checking actionName availability
    async function checkAailabilityActionName(actionName) {
    
        await fetch(SERVER_URL + '/check-acitonName-availability', {
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
                actionName: actionName
            }
            ),
            credentials:'include'
        }).then(async response => {
            var json = await response.json()

            return {status : response.status, ...json}
        }).then((jsondata) => {
//            console.log(jsondata)
            if (jsondata.status===200){
                setActionNameAlreadyExists(jsondata.actionNameExists)
            }
            else{
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
            }
        })
            .catch(error => {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while checking for action name availability.'
                })
            });
    }


    //this function will return template code string for writing dynamic response generation
    function codeTemplateGenerator(actionName) {
        return `/*'session' variable for outputting 
the text to the user 
eg. session.say('hello from action')
'context' variable can be used for accessing 
context variables
params variable can be used to access parameters*/

const ${actionName} = (session, context, params) => {

    //uncomment this line and write your code here\n

};
        
module.exports = {${actionName}}`
    }

            
    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`step Number ${props.stepID}:  dynamic response `}
                id={`${props.stepID}-dynamic-response`}
            >
                <Typography sx={{ width: '10%', flexShrink: 0 }}>
                    Step : {props.stepIndex + 1}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{props.stepLabel}</Typography>

            </AccordionSummary>
            <AccordionDetails>
                <DynamicResponse
                    actionName={actionName}
                    setActionName={setActionName}
                    actionCode={actionCode}
                    setActionCode={setActionCode}
                    actionNameAlreadyExists={actionNameAlreadyExists}
                />

                <Stack paddingTop={1} direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='right' spacing={2}>
                    <Button size="small" variant="outlined" disabled={changesSaved ? true : false} onClick={() => {

                        //not saving empty conde name or code
                        if (actionName.length===0 || actionCode.length===0){
                            return
                        }
                        if(actionNameAlreadyExists){
                            return
                        }

                        //just a basic check if actionName is present in actionCode
                        if (!actionCode.includes(actionName)){
                            return 
                        }
                        
                        
                        props.onStepUpdate(props.stepID,
                            {
                                actionName,actionCode,stepDefinitionComplete:true
                            })
                        setChangesSaved(true)
                    }
                    }>Save Changes</Button>
                    <Button size="small" variant="outlined" onClick={() => props.onStepRemove(props.stepID)} sx={{ display:props.hideDeleteButton?'none':'show'}}>Delete Step</Button>
                </Stack>
                <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
            </AccordionDetails>
        </Accordion>)
}