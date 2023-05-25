import { useState } from 'react'
import { SERVER_URL } from '../../config';
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import TextField from '@mui/material/TextField';
import { isEmpty } from '../../Objects/CommonFunctions';
import Popover from '@mui/material/Popover';
import Highlighter from 'react-highlight-words'
import LoadingButton from '@mui/lab/LoadingButton';
import CustomSnackbar from '../../components/CustomSnackbar';

export default function StaticResponse({ answers, updateAnswers, usedEntitiesUtterance, setUsedEntitiesUtterance }) {
    const appState = useAppStateContext()
    const rephraseBotResponse = appState.settings.openAISettings.rephraseBotResponse.allow
    const [chosenToAddAnswer, setChosenToAddAnswer] = useState(false)
    const [currentAnswer, setCurrentAnswer] = useState('')
    const [anchoredElement, setAnchoredElement] = useState(null)
    const [listOfEntityNames, setListOfEntityNames] = useState([])
    const [loading, setLoading] = useState(false)
    const [numOfSamplesToGenerate, setNumOfSamplesToGenerate] = useState(1)
    const [currentAnswerForAug, setCurrentAnswerForAug] = useState('')
    const [chosenToBulkGenerateAnswers, setChosenToBulkGenerateAnswers] = useState(false)
    const [chosenToAddSampleAugForAnswer, setChosenToAddSampleAugForAnswer] = useState(false)
    const [answersForAug, updateAnswersForAug] = useState([])
    const [answersAugmented, updateAnswersAugmented] = useState([])
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })

    //console.log(usedEntitiesUtterance)
    const handleClose = () => {
        setAnchoredElement(null);
    };

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    //merging the augemented answers with the existing answers together
    function mergeAnswers() {
        setChosenToAddAnswer(true)
        updateAnswers([...answers, ...answersAugmented])
        updateAnswersAugmented([])
        updateAnswersForAug([])
    }

    //function for removing augmented utterances from the list
    function removeAnswersAugmented(index) {
        updateAnswersAugmented(answersAugmented.filter((item, idx) => idx !== index))
    }

    //this function will add current answer if the user is focused in current answer box and press 
    //the enter button
    function handlekeyDownAnswer(key) {
        if (key === 'Enter') {
            addCurrentAnswer();
        }
    }

    //function to add typed answer to the array answers if chosen static response
    function addCurrentAnswer() {
        if (isEmpty(currentAnswer)) {
            return
        }
        updateAnswers([...answers, currentAnswer])
        setCurrentAnswer('')

    }

    //function for removing already added utterance to the list
    function removeAnswerForAug(index) {
        updateAnswersForAug(answersForAug.filter((item, idx) => idx !== index))
    }

    //this function will dispatch delete answer event 
    function removeAnswer(index) {
        updateAnswers(answers.filter((item, idx) => idx !== index))
    }

    //this function will add current utterance if the user is focused in current utterance box and press 
    //the enter button
    function handlekeyDownAnswerForAug(e) {
        if (e.key === '@') {
            getLisOfEntityNames()
            setAnchoredElement(e.currentTarget)
        }

        if (e.key === 'Enter') {
            addCurrentAnswerForAug()
        }
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

    //function to add typed in utterance to the array 'utterance'
    function addCurrentAnswerForAug() {
        if (isEmpty(currentAnswerForAug)) {
            return
        }
        updateAnswersForAug([...answersForAug, currentAnswerForAug])
        setCurrentAnswerForAug('')
    }



    //function for sending sample utterances and retrieving back the generated uttterances from the model
    async function generateBulkAnswers() {
        setLoading(true)
        await fetch(SERVER_URL + '/get-openAI-bulk-answers-generation', {
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
                answersForAug,
                numOfSamplesToGenerate
            }
            ),
            credentials: 'include'
        }).then(async response => {
            var data = await response.json()
            return { status: response.status, ...data }
        }).then((jsondata) => {
            console.log(jsondata)
            if (jsondata.status === 200) {
                updateAnswersAugmented(jsondata.augmentedAnswersList)
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
        var entity = ' {{' + listOfEntityNames[entityIndex].entity + '}}'
        if (!usedEntitiesUtterance.includes(entity)) {
            setUsedEntitiesUtterance([...usedEntitiesUtterance, entity])
        }
        setCurrentAnswer(currentAnswer + entity)
        handleClose()
    }


    return (
        <Box >
            <Typography component='h6' variant='h6'>Answers</Typography>
            <List style={{ border: '1px solid #54B4D3', borderRadius: '.3rem', padding: 0 }}>
                {(!chosenToAddAnswer && answers.length === 0) &&
                    <ListItem className='listItem'>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            No answers added yet.<br></br>
                            <Button onClick={() => setChosenToAddAnswer(true)}>Add Answers Manually</Button></ListItemText>
                    </ListItem>
                }

                {chosenToAddAnswer &&
                    <ListItem className='listItem'>
                        <ListItemText sx={{ paddingRight: 4 }} >
                            <TextField
                                size='small'
                                margin="normal"
                                fullWidth
                                name="current-answer"
                                autoComplete='off'
                                label="Type your answer here"
                                id="current-answer"
                                value={currentAnswer}

                                onChange={e => setCurrentAnswer(e.target.value)}
                                onKeyDown={e => handlekeyDownAnswer(e.key)}
                            />
                        </ListItemText>
                        <ListItemSecondaryAction>
                            <Button onClick={() => addCurrentAnswer()}>Add</Button>
                        </ListItemSecondaryAction>
                    </ListItem>}
                {answers.reverse().map((item, index) => {
                    return <ListItem className='listItem' key={index}>
                        <ListItemText>{index + 1}. {item}
                        </ListItemText>
                        <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer' }} onClick={() => removeAnswer(index)} /></ListItemSecondaryAction>
                    </ListItem>
                })
                }
            </List>
            {!rephraseBotResponse &&
                <Typography align='center' sx={{ typography: 'subtitle', p: 1 }}>Respones or answers can be quickly created by using the AI language model. You can go to the settings and allow rephrase the bot response.</Typography>
            }
            {
                rephraseBotResponse &&
                <>
                    <Typography align='center' sx={{ typography: 'subtitle', p: 1 }}>Or Bulk response generation</Typography>
                    <List style={{ border: '1px solid #54B4D3', borderRadius: '.3rem', padding: 0 }}>
                        {(!chosenToAddSampleAugForAnswer && answersForAug.length === 0) &&
                            <ListItem className='listItem' key={99999999}>
                                <ListItemText sx={{ textAlign: 'center' }}>
                                    No Sample answers/response added yet.<br></br>
                                    <Button onClick={() => setChosenToAddSampleAugForAnswer(true)}>Add sample responses for bulk response generation</Button></ListItemText>
                            </ListItem>
                        }

                        {chosenToAddSampleAugForAnswer &&
                            <ListItem className='listItem'>
                                <ListItemText sx={{ paddingRight: 4 }} >
                                    <TextField
                                        size='small'
                                        margin="normal"
                                        fullWidth
                                        name="current-response-aug-utterance"
                                        label="Type your sample answer here"
                                        autoComplete='off'
                                        id="current-response-for-aug"
                                        value={currentAnswerForAug}
                                        onChange={e => setCurrentAnswerForAug(e.target.value)}
                                        onKeyDown={e => handlekeyDownAnswerForAug(e)}
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
                                    <Button onClick={() => addCurrentAnswerForAug()}>Add</Button>
                                </ListItemSecondaryAction>
                            </ListItem>}
                        {answersForAug.reverse().map((answerForAug, index) => {
                            return <ListItem className='listItem' key={index}>
                                <ListItemText sx={{ maxWidth: '80%' }}>{index + 1}.
                                    <Highlighter searchWords={usedEntitiesUtterance} autoEscape={true} textToHighlight={answerForAug} />
                                </ListItemText>
                                <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer' }} onClick={() => removeAnswerForAug(index)} /></ListItemSecondaryAction>
                            </ListItem>
                        })
                        }
                        {
                            answersForAug.length > 0 &&
                            <ListItem className='listItem' key={999999991}>
                                <Button variant="text" onClick={() => setChosenToBulkGenerateAnswers(true)}>Generate bulk answers</Button>
                            </ListItem>

                        }
                        {answersForAug.length > 0 && chosenToBulkGenerateAnswers &&
                            <ListItem className='listItem' key={999999990}>
                                <TextField
                                    size='small'
                                    margin="normal"
                                    fullWidth
                                    type='number'
                                    name="num-of-samples"
                                    label="Specify number of answers to generate per sample"
                                    autoComplete='off'
                                    id="num-of-samples-to-generate"
                                    value={numOfSamplesToGenerate}
                                    onChange={e => setNumOfSamplesToGenerate(e.target.value)}
                                />
                                <LoadingButton
                                    size="small"
                                    onClick={() => generateBulkAnswers()}
                                    loading={loading}
                                    loadingIndicator="Generating..."
                                    variant="contained"
                                    sx={{ m: 1 }}
                                >
                                    <span>Generate Bulk Responses</span>
                                </LoadingButton>
                            </ListItem>

                        }

                    </List>

                    {answersForAug.length > 0 && answersAugmented.length > 0 &&
                        <List>
                            {answersAugmented.map((answer, index) => {
                                return <ListItem className='listItem' key={index}>
                                    <ListItemText sx={{ maxWidth: '80%' }}>{index + 1}.
                                        {answer}
                                    </ListItemText>
                                    <ListItemSecondaryAction><ClearIcon style={{ cursor: 'pointer' }} onClick={() => removeAnswersAugmented(index)} /></ListItemSecondaryAction>
                                </ListItem>
                            })
                            }
                            <ListItem className='listItem' key={999999020}>
                                <ListItemSecondaryAction><Button onClick={mergeAnswers}>Merge with the existing answers</Button></ListItemSecondaryAction>
                            </ListItem>
                        </List>}

                </>
            }

            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
        </Box>
    )
}
