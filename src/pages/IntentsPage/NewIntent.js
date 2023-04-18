import { useState, useEffect } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { SERVER_URL } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import TextField from '@mui/material/TextField';
import { Stack } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate } from 'react-router-dom';
import CustomSnackbar from '../../components/CustomSnackbar';
import { validateKeyDownEvent, isEmpty } from '../../Objects/CommonFunctions';
import Popover from '@mui/material/Popover';
import Highlighter from 'react-highlight-words'

export default function NewIntent() {
    const appState = useAppStateContext()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [currentUtterance, setCurrentUtterance] = useState('')
    const [chosenToAddUtterance, setChosenToAddUtterances] = useState(false)
    const [topAccordionExpanded, setTopAccordionExpanded] = useState(false)
    const [anchoredElement, setAnchoredElement] = useState(null)
    const [listOfEntityNames, setListOfEntityNames] = useState([])
    const [usedEntitiesUtterance, setUsedEntitiesUtterance] = useState([])

    //lately added
    const [intent, setIntent] = useState('')
    const [description, setDescription] = useState('')
    const [utterances, updateUtterances] = useState([])
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })

    const handleClose = () => {
        setAnchoredElement(null);
    };



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

    //function for reseting the form for adding new Intent Data
    function resetNewQnAdata() {
        setIntent('')
        setDescription('')
        updateUtterances([])

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


    //function to add typed in utterance to the array 'utterance'
    function addCurrentUtterance() {
        if (isEmpty(currentUtterance)) {
            return
        }
        updateUtterances([...utterances, currentUtterance])
        setCurrentUtterance('')
    }

    //function for removing already added utterance to the list
    function removeUtterance(index) {
        updateUtterances(utterances.filter((item, idx) => idx !== index))

    }

    //function to upload and save new Intent data
    async function uploadNewIntentData() {
        var payload = {
            intent,
            description,
            utterances
        }

        setLoading(true)
        await fetch(SERVER_URL + '/save-intent-data', {
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
                payload: payload
            }
            ),
            credentials:'include'
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
                    message: "The data has been saved successfully."
                })

            }
            setLoading(false)
        })
            .catch(error => {
                setLoading(false)
                navigate('/error', { state: { error } })
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
            credentials:'include'
        }).then(response => {
            return response.json()
        }).then((jsondata) => {
            console.log(jsondata)
            setListOfEntityNames(jsondata)
        })
            .catch(error => {
                setLoading(false)
                navigate('/error', { state: { error } })
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
                aria-controls="newIntent-content"
                id="newIntent-content"
            >
                <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>Create New Intent</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box component="form"  >
                    <Typography align='center' sx={{ typography: 'subtitle2' }}>This section can be used to create and define intents that can be used as a trigger for scripts. <br></br>
                        After define intent, it can be used in script section for writing conversation script.
                    </Typography>
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
                    <List style={{ border: '1px solid #347C98', borderRadius: '.3rem', padding: 0 }}>
                        {(!chosenToAddUtterance && utterances.length === 0) &&
                            <ListItem className='listItem'>
                                <ListItemText sx={{ textAlign: 'center' }}>
                                    No Utterance added yet.<br></br>
                                    <Button onClick={() => setChosenToAddUtterances(true)}>Add Utterance</Button></ListItemText>
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
                                <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer',color:'gray' }} onClick={() => removeUtterance(index)} /></ListItemSecondaryAction>
                            </ListItem>
                        })
                        }
                    </List>
                    <br></br>
                    <Stack spacing={2} direction='row' justifyContent='center' >
                        <Button variant='outlined' onClick={() => { setTopAccordionExpanded(false); resetNewQnAdata(); }}>Cancel</Button>
                        <LoadingButton
                            size="small"
                            onClick={() => uploadNewIntentData()}
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