import { useRef, memo } from 'react'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DynamicResponse from './DynamicResponse';
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CustomSnackbar from '../../components/CustomSnackbar';
import { validateKeyDownEvent, isEmpty, checkIfActionCodeHasActionName } from '../../Objects/CommonFunctions';

const ExistingQandAData = (props) => {
    const appState = useAppStateContext()
    const [intent, setIntent] = useState(props.intent)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [description, setDescription] = useState(props.description)
    const [utterances, updateUtterances] = useState(props.utterances)
    const [actionName, setActionName] = useState(props.actionName)
    const [actionNameAlreadyExists, setActionNameAlreadyExists] = useState(false)
    const actionNameCopy = props.actionName
    const [actionCode, updateActionCode] = useState(props.actionCode)
    const [answers, updateAnswers] = useState(props.answers)
    const [additionalUtterance, setAdditionalUtterance] = useState('')
    const [additionalAnswer, setAdditionalAnswer] = useState('')
    const [stateChanged, setStateChanged] = useState(false)
    const showDeletePrompt = props.showDeletePrompt
    const [topAccordionExpanded, setTopAccordionExpanded] = useState(false)
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })
    const refRendered = useRef(false)
    var resType;
    if (props.hasOwnProperty('actionName')) {
        resType = 'dynamic'
    }
    else {
        resType = 'static'
    }

    useEffect(() => {
        setStateChanged(true)
    }, [actionCode, actionName])

    useEffect(() => {
        setStateChanged(false)
    }, [])

    //efect for ensuring whether the action named entered is same as old one or new one
    useEffect(() => {
        if (refRendered.current) {
            checkAailabilityActionName(actionName)
        }
        else {
            refRendered.current = true
        }
    }, [actionName])

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
            credentials: 'include'
        }).then(async response => {
            var json = await response.json()
            json.status = response.status
            return json
        }).then((jsondata) => {
            if (jsondata.status === 200) {
                setActionNameAlreadyExists(jsondata.actionNameExists)
            }
            else if (jsondata.status === 500) {
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
                    message: 'Connection error occured while checking ActionName availability.'
                })
            });
    }


    //function to upload and save new QandA data
    async function uploadNewQandAdata() {
        var payload = {
            intent,
            description,
            utterances
        }
        if (resType === "static") {

            payload.answers = answers
        }
        else if (resType === "dynamic") {
            if (!checkIfActionCodeHasActionName(actionName, actionCode)) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Please check if Action Name is defined inside Action Code and it is mentioned on export statement.'
                })
                return
            }
            payload.actionName = actionName
            payload.actionCode = actionCode

        }
        setLoading(true)
        await fetch(SERVER_URL + '/update-qana-data/' + resType, {
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
            credentials: 'include'
        }).then(async response => {
            var json = await response.json()
            json.status = response.status
            return json
        }).then((jsondata) => {

            if (jsondata.status === 200) {
                setSnackBarPayload({
                    open: true,
                    severity: "success",
                    message: "The data has been saved successfully."
                })
                setStateChanged(false)
            } else if (jsondata.status === 400) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
            }
            else if (jsondata.status === 500) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
            }
            setLoading(false)
        })
            .catch(error => {
                setLoading(false)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while saving the new QandA data into the database'
                })
            });


    }


    //function to add more utterance to the list of dataset
    function appendUtterance() {
        if (!isEmpty(additionalUtterance)) {
            updateUtterances([...utterances, additionalUtterance])
            setAdditionalUtterance('')
            setStateChanged(true)
        }
    }

    //function to add more answer to the list of the dataset
    function appendAnswer() {

        if (!isEmpty(additionalAnswer)) {
            updateAnswers([...answers, additionalAnswer])
            setAdditionalAnswer('')
            setStateChanged(true)
        }

    }


    //function for updating the list of answers in existing QandA dataset
    function updateAnswer(answerIndex, updatedAnswer) {
        if (isEmpty(updatedAnswer)) {
            return
        }

        var tempAnswers = answers.map((answer, aidx) => {
            if (answerIndex === aidx) {
                if (answer.toLowerCase() !== updatedAnswer.toLowerCase()) {
                    setStateChanged(true)
                    return updatedAnswer
                }
                else {
                    return answer
                }
            }
            else {
                return answer
            }
        })
        updateAnswers([...tempAnswers])
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

    //function for removing answers from existing qanda data list
    function removeAnswer(answerIndex) {
        var tempAnswers = answers.filter((answer, aidx) => {
            return aidx !== answerIndex
        })

        //the list must have atleast one utterance
        if (tempAnswers.length === 0) {
            return
        }
        setStateChanged(true)
        updateAnswers([...tempAnswers])
    }

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    return (

        <Accordion sx={{ width: '100%' }} expanded={topAccordionExpanded} onChange={() => setTopAccordionExpanded(!topAccordionExpanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={"qandadata-content"}
                id={"qandadata"}
            >
                <Typography sx={{ typography: 'subtitle2' }}>{description}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Intent : {intent}
                </Typography>
                <br></br>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Utterances
                </Typography>
                <List>
                    {utterances.map((utterance, utteranceIndex) => {
                        return <ListItem className='listItem' key={utteranceIndex} >
                            <TextField size='small' autoComplete='off' fullWidth value={utterance} onChange={e => updateUtterance(utteranceIndex, e.target.value)} />
                            <ListItemSecondaryAction><ClearIcon sx={{ fontSize: 'small' }} style={{ cursor: 'pointer' }} onClick={() => removeUntterance(utteranceIndex)} />
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
                {props.hasOwnProperty('answers') && <>
                    <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                        Answers
                    </Typography>

                    <List>
                        {answers.map((answer, answerIndex) => {
                            return <ListItem className='listItem' key={answerIndex} >
                                <TextField size='small' autoComplete='off' fullWidth value={answer} onChange={(e) => updateAnswer(answerIndex, e.target.value)} />
                                <ListItemSecondaryAction ><ClearIcon sx={{ fontSize: 'small' }} style={{ cursor: 'pointer' }} onClick={() => removeAnswer(answerIndex)} />
                                </ListItemSecondaryAction>
                            </ListItem>
                        })}
                        <ListItem className='listItem' key={answers.length + 1}>
                            <ListItemText >
                                <TextField sx={{ marginRight: 2, paddingRight: 1 }} size='small' autoComplete='off' value={additionalAnswer} onChange={e => setAdditionalAnswer(e.target.value)} placeholder='Add answer' fullWidth />
                            </ListItemText>
                            <Button variant="outlined" onClick={(e) => appendAnswer()}>Add</Button>
                        </ListItem>
                    </List>
                    <Stack spacing={2} direction='row' justifyContent='center' >
                        <Button variant='outlined' onClick={() => showDeletePrompt(props.intent)}>Delete Intent</Button>
                        <LoadingButton
                            type='submit'
                            size="small"
                            loading={loading}
                            loadingIndicator="Saving..."
                            variant="contained"
                            disabled={stateChanged ? false : true}
                            onClick={uploadNewQandAdata}
                        >
                            <span>Save Changes</span>
                        </LoadingButton>

                    </Stack>
                </>
                }
                {props.hasOwnProperty('actionCode') && props.hasOwnProperty('actionName') &&
                    <Box >
                        <DynamicResponse
                            actionName={actionName}
                            setActionName={setActionName}
                            actionCode={actionCode}
                            setActionCode={updateActionCode}
                            actionNameAlreadyExists={actionNameAlreadyExists}
                            actionNameAlreadyExistsWarningMessage='Existing Action name found, Action Code will be overidden.'
                        />
                        <br></br>
                        <Stack spacing={2} direction='row' justifyContent='center' >
                            <Button variant='outlined' onClick={() => showDeletePrompt(props.intent)}>Delete Intent</Button>
                            <LoadingButton
                                type='submit'
                                size="small"
                                loading={loading}
                                loadingIndicator="Saving..."
                                variant="contained"
                                disabled={stateChanged ? false : true}
                                onClick={uploadNewQandAdata}
                            >
                                <span>Save Changes</span>
                            </LoadingButton>

                        </Stack>
                    </Box>
                }
                <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
            </AccordionDetails>
        </Accordion>


    );
}

export default ExistingQandAData