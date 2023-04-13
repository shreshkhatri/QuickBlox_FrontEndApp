import { useState, useEffect,useMemo } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { SERVER_URL } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import { Stack } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate } from 'react-router-dom';
import CustomSnackbar from '../../components/CustomSnackbar';
import StaticResponse from './StaticResponse';
import DynamicResponse from './DynamicResponse';
import { validateKeyDownEvent, isEmpty, checkIfActionCodeHasActionName } from '../../Objects/CommonFunctions';
import Popover from '@mui/material/Popover';
import Highlighter from 'react-highlight-words'

export default function NewQandAData() {
    const appState = useAppStateContext()
    const datasetGeneration = appState.settings.openAISettings.datasetGeneration.allow
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [numOfSamplesToGenerate, setNumOfSamplesToGenerate] = useState(1)
    const [responseType, setResponseType] = useState("0");
    const [currentUtterance, setCurrentUtterance] = useState('')
    const [currentUtteranceForAug, setCurrentUtteranceForAug] = useState('')
    const [chosenToAddUtterance, setChosenToAddUtterances] = useState(false)
    const [chosenToBulkGenerateUtterances, setChosenToBulkGenerateUtterances] = useState(false)
    const [chosenToAddSampleAugForUtterance, setChosenToAddSampleAugForUtterance] = useState(false)
    const [topAccordionExpanded, setTopAccordionExpanded] = useState(false)
    const [anchoredElement, setAnchoredElement] = useState(null)
    const [listOfEntityNames, setListOfEntityNames] = useState([])
    const [usedEntitiesUtterance, setUsedEntitiesUtterance] = useState([])

    //lately added
    const [intent, setIntent] = useState('')
    const [description, setDescription] = useState('')
    const [utterances, updateUtterances] = useState([])
    const [utterancesForAug, updateUtterancesForAug] = useState([])
    const [utterancesAugmented, updateUtterancesAugmented] = useState([])
    const [answers, updateAnswers] = useState([])
    const [actionName, setActionName] = useState('action_name')
    const [actionCode, setActionCode] = useState(codeTemplateGenerator('action_name'))
    const [actionNameAlreadyExists, setActionNameAlreadyExists] = useState(false)
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })
    //console.log(usedEntitiesUtterance)
    const handleClose = () => {
        setAnchoredElement(null);
    };

    //this function will return template code string for writing dynamic response generation
    function codeTemplateGenerator(actionName) {
        return `
/*'session' variable for outputting 
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


    const memoisedStaticResponse = useMemo(()=>{
        return <StaticResponse
                        answers={answers}
                        updateAnswers={updateAnswers}
                        usedEntitiesUtterance={usedEntitiesUtterance}
                        setUsedEntitiesUtterance={setUsedEntitiesUtterance}
                    />

    },[answers,usedEntitiesUtterance]);
    //upon removal of every sample sentences of utterances, the updateUtterancesAugmented must be reset
    useEffect(() => {
        utterancesForAug.length === 0 && updateUtterancesAugmented([])
    }, [utterancesForAug])


    //function for updating the list of entities
    useEffect(() => {
        var tokens = []
        for (const utterance of utterances) {
            tokens = [...tokens, ...utterance.split(' ')]
        }
        var tempUsedEntitiesUtterance = usedEntitiesUtterance.filter(entity => {
            if (tokens.includes(entity)) {
                return entity
            }
        })
        setUsedEntitiesUtterance(tempUsedEntitiesUtterance)
    }, [utterances])

    //use effect for setting the action Name and checking the availability of the names
    useEffect(() => {
        checkAailabilityActionName(actionName)
        setActionCode(codeTemplateGenerator(actionName))

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
                console.log(error)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while checking ActionName availability.'
                })
            });
    }

    function mergeUtterances(){
        setChosenToAddUtterances(true)
        updateUtterances([...utterances,...utterancesAugmented])
        updateUtterancesAugmented([])
        updateUtterancesForAug([])
    }


    //function for reseting the form for adding new QandAdata
    function resetNewQnAdata() {
        setIntent('')
        setDescription('')
        updateUtterances([])
        updateAnswers([])
        setActionName('action_name')
        setActionCode('')

    }

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }


    //this function will add current utterance if the user is focused in current utterance box and press 
    //the enter button
    function handlekeyDownUtterance(e) {
        if (e.key === '@') {
            getLisOfEntityNames()
            setAnchoredElement(e.currentTarget)
        }

        if (e.key === 'Enter') {
            addCurrentUtterance()
        }
    }

    //this function will add current utterance if the user is focused in current utterance box and press 
    //the enter button
    function handlekeyDownUtteranceForAug(e) {
        if (e.key === '@') {
            getLisOfEntityNames()
            setAnchoredElement(e.currentTarget)
        }

        if (e.key === 'Enter') {
            addCurrentUtteranceForAug()
        }
    }


    //function to add typed in utterance to the array 'utterance'
    function addCurrentUtterance() {
        if (isEmpty(currentUtterance)) {
            return
        }
        updateUtterances([...utterances, currentUtterance])
        setCurrentUtterance('')
    }

    //function to add typed in utterance to the array 'utterance'
    function addCurrentUtteranceForAug() {
        if (isEmpty(currentUtteranceForAug)) {
            return
        }
        updateUtterancesForAug([...utterancesForAug, currentUtteranceForAug])
        setCurrentUtteranceForAug('')
    }

    //function for removing already added utterance to the list
    function removeUtterance(index) {
        updateUtterances(utterances.filter((item, idx) => idx !== index))
    }

    //function for removing augmented utterances from the list
    function removeUtteranceAugmented(index) {
        updateUtterancesAugmented(utterancesAugmented.filter((item, idx) => idx !== index))
    }

    //function for removing already added utterance to the list
    function removeUtteranceForAug(index) {
        updateUtterancesForAug(utterancesForAug.filter((item, idx) => idx !== index))
    }

    //function to upload and save new QandA data
    async function uploadNewQandAdata() {
        var resType;
        var payload = {
            intent,
            description,
            utterances
        }
        if (responseType === "0") {
            resType = "static"
            payload.answers = answers
        }
        else if (responseType === "1") {

            resType = "dynamic"
            payload.actionName = actionName
            payload.actionCode = actionCode

            if (actionNameAlreadyExists) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Please specify valid Action Name'
                })
                return
            }

            if (!checkIfActionCodeHasActionName(actionName, actionCode)) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Please check if Action Name is defined inside Action Code and it is mentioned on export statement.'
                })
                return
            }
        }
        setLoading(true)
        await fetch(SERVER_URL + '/insert-qana-data/' + resType, {
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
                console.log(error)
                setLoading(false)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while saving the new QandA data into the database'
                })
            });
    }

    //function to read the list of entities from the server
    async function getLisOfEntityNames() {

        await fetch(SERVER_URL + '/get-entity-name-list', {
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
            }
            ),
            credentials: 'include'
        }).then(async response => {
            var json = await response.json()
            json.status = response.status
            return json
        }).then((jsondata) => {
            //console.log(jsondata)
            if (jsondata.status === 200) {
                setListOfEntityNames(jsondata)
            }
            else {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
            }

        })
            .catch(error => {
                console.log(error)
                setLoading(false)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while trying to read the entity list.'
                })
            });


    }

    //function for sending sample utterances and retrieving back the generated uttterances from the model
    async function generateBulkUtterances() {
        setLoading(true)
        await fetch(SERVER_URL + '/get-openAI-bulk-utterance-generation', {
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
                utterancesForAug,
                numOfSamplesToGenerate
            }
            ),
            credentials: 'include'
        }).then(async response => {
            var data = await response.json()
            return { status: response.status, ...data }
        }).then((jsondata) => {
            
            if (jsondata.status === 200) {
                updateUtterancesAugmented(jsondata.augmentedUtterancesList)
            }
            else {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
            }
            setLoading(false)

        })
            .catch(error => {
                console.log(error)
                setLoading(false)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while trying to retrieve bluk uterances'
                })
            });


    }

    //function to append the selected entity to the text
    function selectEntity(entityIndex) {
        var entity = '@' + listOfEntityNames[entityIndex].entity
        if (!usedEntitiesUtterance.includes(entity)) {
            setUsedEntitiesUtterance([...usedEntitiesUtterance, entity])
        }
        setCurrentUtterance(currentUtterance + entity)
        handleClose()
    }
    return (<>
        <Accordion sx={{ width: '100%' }} expanded={topAccordionExpanded} onChange={() => setTopAccordionExpanded(!topAccordionExpanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="qandadata-content"
                id="qandadata-content"
            >
                <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>Add new QandA dataset </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box component="form"  >
                    <TextField
                        size='small'
                        margin="normal"
                        required
                        fullWidth
                        id="intent"
                        label="Intent Name ( min. 5 characters )"
                        name="intent"
                        autoComplete='off'
                        value={intent}
                        onKeyDown={e => validateKeyDownEvent(e)}
                        onChange={e => setIntent(e.target.value)}
                        autoFocus
                    />

                    <TextField
                        size='small'
                        margin="normal"
                        required
                        fullWidth
                        name="intent-discription"
                        label="Intent Description ( min. 5 characters )"
                        id="intent-discription"
                        autoComplete='off'
                        sx={{ width: '100%' }}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <br></br><br></br>
                    <Typography component='h6' variant='h6'>Utterances</Typography>
                    <List style={{ border: '1px solid #54B4D3', borderRadius: '.3rem', padding: 0 }}>
                        {(!chosenToAddUtterance && utterances.length === 0) &&
                            <ListItem className='listItem'>
                                <ListItemText sx={{ textAlign: 'center' }}>
                                    No Utterance added yet.<br></br>
                                    <Button onClick={() => setChosenToAddUtterances(true)}>Add Utterance Manually</Button></ListItemText>
                            </ListItem>
                        }

                        {chosenToAddUtterance &&
                            <ListItem className='listItem'>
                                <ListItemText sx={{ paddingRight: 4 }} >
                                    <TextField
                                        size='small'
                                        margin="normal"
                                        fullWidth
                                        name="current-utterance"
                                        label="Type your utterance here"
                                        autoComplete='off'
                                        id="current-utterance"
                                        value={currentUtterance}
                                        onChange={e => setCurrentUtterance(e.target.value)}
                                        onKeyDown={e => handlekeyDownUtterance(e)}
                                    />
                                    <Popover
                                        id='popover'
                                        open={Boolean(anchoredElement)}
                                        anchorEl={anchoredElement}
                                        onClose={handleClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                    >
                                        <Typography align='center' sx={{ typography: 'subtitle2', p: 1, fontWeight: 'bold' }}>Suggested Entities</Typography>
                                        <Box sx={{ maxHeight: 'calc(100vh*.3)', overflowY: 'scroll' }}>
                                            {
                                                listOfEntityNames.length === 0 &&
                                                <ListItem key={0}>
                                                    <ListItemText sx={{ textAlign: 'center' }}>
                                                        <Typography align='center' sx={{ typography: 'subtitle2', p: 1 }}>No entities found</Typography>
                                                    </ListItemText>
                                                </ListItem>
                                            }
                                            {
                                                listOfEntityNames.length > 0 &&
                                                <List style={{ padding: 0 }}>
                                                    {listOfEntityNames.map(({ entity }, index) => {
                                                        return <ListItem key={index}>
                                                            <ListItemText sx={{ textAlign: 'left' }} onClick={() => selectEntity(index)}>
                                                                <Typography align='left' sx={{ typography: 'subtitle2', p: 0 }}>{entity}</Typography>
                                                            </ListItemText>
                                                        </ListItem>
                                                    })
                                                    }
                                                </List>

                                            }
                                        </Box>
                                    </Popover>
                                </ListItemText>
                                <ListItemSecondaryAction>
                                    <Button onClick={() => addCurrentUtterance()}>Add</Button>
                                </ListItemSecondaryAction>
                            </ListItem>}
                        {utterances.reverse().map((utterance, index) => {
                            return <ListItem className='listItem' key={index}>
                                <ListItemText sx={{ maxWidth: '80%' }}>{index + 1}.
                                    <Highlighter searchWords={usedEntitiesUtterance} autoEscape={true} textToHighlight={utterance} />
                                </ListItemText>
                                <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer' }} onClick={() => removeUtterance(index)} /></ListItemSecondaryAction>
                            </ListItem>
                        })
                        }
                    </List>
                    {!datasetGeneration && <Typography align='center' sx={{ typography: 'subtitle', p: 1 }}>Utterances can be quickly created by using the AI language model. You can go to settings and allow data generation option to use the feature.</Typography>}
                    {datasetGeneration &&
                        <Box sx={{ p: 1 }}>
                            <Typography align='center' sx={{ typography: 'subtitle', p: 1 }}>Or</Typography>
                            <List style={{ border: '1px solid #54B4D3', borderRadius: '.3rem', padding: 0 }}>
                                {(!chosenToAddSampleAugForUtterance && utterancesForAug.length === 0) &&
                                    <ListItem className='listItem' key={99999999}>
                                        <ListItemText sx={{ textAlign: 'center' }}>
                                            No Sample Utterance added yet.<br></br>
                                            <Button onClick={() => setChosenToAddSampleAugForUtterance(true)}>Add sample utterances for bulk response generation</Button></ListItemText>
                                    </ListItem>
                                }

                                {chosenToAddSampleAugForUtterance &&
                                    <ListItem className='listItem'>
                                        <ListItemText sx={{ paddingRight: 4 }} >
                                            <TextField
                                                size='small'
                                                margin="normal"
                                                fullWidth
                                                name="current-sample-aug-utterance"
                                                label="Type your sample utterance here"
                                                autoComplete='off'
                                                id="current-utterance-for-aug"
                                                value={currentUtteranceForAug}
                                                onChange={e => setCurrentUtteranceForAug(e.target.value)}
                                                onKeyDown={e => handlekeyDownUtteranceForAug(e)}
                                            />
                                            <Popover
                                                id='popover'
                                                open={Boolean(anchoredElement)}
                                                anchorEl={anchoredElement}
                                                onClose={handleClose}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'center',
                                                }}
                                            >
                                                <Typography align='center' sx={{ typography: 'subtitle2', p: 1, fontWeight: 'bold' }}>Suggested Entities</Typography>
                                                <Box sx={{ maxHeight: 'calc(100vh*.3)', overflowY: 'scroll' }}>
                                                    {
                                                        listOfEntityNames.length === 0 &&
                                                        <ListItem key={0}>
                                                            <ListItemText sx={{ textAlign: 'center' }}>
                                                                <Typography align='center' sx={{ typography: 'subtitle2', p: 1 }}>No entities found</Typography>
                                                            </ListItemText>
                                                        </ListItem>
                                                    }
                                                    {
                                                        listOfEntityNames.length > 0 &&
                                                        <List style={{ padding: 0 }}>
                                                            {listOfEntityNames.map(({ entity }, index) => {
                                                                return <ListItem key={index}>
                                                                    <ListItemText sx={{ textAlign: 'left' }} onClick={() => selectEntity(index)}>
                                                                        <Typography align='left' sx={{ typography: 'subtitle2', p: 0 }}>{entity}</Typography>
                                                                    </ListItemText>
                                                                </ListItem>
                                                            })
                                                            }
                                                        </List>

                                                    }
                                                </Box>
                                            </Popover>
                                        </ListItemText>
                                        <ListItemSecondaryAction>
                                            <Button onClick={() => addCurrentUtteranceForAug()}>Add</Button>
                                        </ListItemSecondaryAction>
                                    </ListItem>}
                                {utterancesForAug.reverse().map((utterance, index) => {
                                    return <ListItem className='listItem' key={index}>
                                        <ListItemText sx={{ maxWidth: '80%' }}>{index + 1}.
                                            <Highlighter searchWords={usedEntitiesUtterance} autoEscape={true} textToHighlight={utterance} />
                                        </ListItemText>
                                        <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer' }} onClick={() => removeUtteranceForAug(index)} /></ListItemSecondaryAction>
                                    </ListItem>
                                })
                                }
                                {
                                    utterancesForAug.length > 0 &&
                                    <ListItem className='listItem' key={999999991}>
                                        <Button variant="text" onClick={() => setChosenToBulkGenerateUtterances(true)}>Generate bulk utterances</Button>
                                    </ListItem>

                                }
                                {utterancesForAug.length > 0 && chosenToBulkGenerateUtterances &&
                                    <ListItem className='listItem' key={999999990}>
                                        <TextField
                                            size='small'
                                            margin="normal"
                                            fullWidth
                                            type='number'
                                            name="um-of-samples"
                                            label="Specify number of samples to generate per sample"
                                            autoComplete='off'
                                            id="num-of-samples-to-generate"
                                            value={numOfSamplesToGenerate}
                                            onChange={e => setNumOfSamplesToGenerate(e.target.value)}
                                        />
                                        <LoadingButton
                                            size="small"
                                            onClick={() => generateBulkUtterances()}
                                            loading={loading}
                                            loadingIndicator="Generating..."
                                            variant="contained"
                                            sx={{ m: 1 }}
                                        >
                                            <span>Generate Bulk Utterances</span>
                                        </LoadingButton>
                                    </ListItem>

                                }

                            </List>

                            {utterancesForAug.length > 0 && utterancesAugmented.length > 0 &&
                                <List>
                                    {utterancesAugmented.map((utterance, index) => {
                                        return <ListItem className='listItem' key={index}>
                                            <ListItemText sx={{ maxWidth: '80%' }}>{index + 1}.
                                                {utterance}
                                            </ListItemText>
                                            <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer' }} onClick={() => removeUtteranceAugmented(index)} /></ListItemSecondaryAction>
                                        </ListItem>
                                    })
                                    }
                                    <ListItem className='listItem' key={999999020}>
                                        <ListItemSecondaryAction><Button onClick={mergeUtterances}>Merge with the existing utterances</Button></ListItemSecondaryAction>
                                    </ListItem>
                                </List>}

                        </Box>

                    }

                    <br></br>
                    <Typography component='h6' variant='h6'>Response Type</Typography>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                        <FormControl>
                            <RadioGroup
                                row
                                aria-labelledby="response-type-row-radio-buttons-group-label"
                                name="response-type-row-radio-buttons-group"
                                value={responseType}
                                onChange={(e) => setResponseType((e.target.value))}
                            >
                                <FormControlLabel value={0} control={<Radio />} label="Static Response" />
                                <FormControlLabel value={1} control={<Radio />} label="Dynamic Response" />

                            </RadioGroup>
                        </FormControl>
                    </Box>
                    <br></br>
                    {responseType === "0" && memoisedStaticResponse}
                    {responseType === "1" && <DynamicResponse
                        actionName={actionName}
                        setActionName={setActionName}
                        actionCode={actionCode}
                        setActionCode={setActionCode}
                        actionNameAlreadyExists={actionNameAlreadyExists}
                    />}
                    <br></br>
                    <Stack spacing={2} direction='row' justifyContent='center' >
                        <Button variant='outlined' onClick={() => { setTopAccordionExpanded(false); resetNewQnAdata(); }}>Cancel</Button>
                        <LoadingButton
                            size="small"
                            onClick={() => uploadNewQandAdata()}
                            loading={loading}
                            loadingIndicator="Saving..."
                            variant="contained"
                        >
                            <span>Save</span>
                        </LoadingButton>

                    </Stack>
                </Box>
            </AccordionDetails>
        </Accordion>
        <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
    </>
    )
}