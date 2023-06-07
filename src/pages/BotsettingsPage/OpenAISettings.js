import { useState, useEffect, useRef } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import Autocomplete from '@mui/material/Autocomplete';
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import CustomSnackbar from '../../components/CustomSnackbar';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

export const OpenAISettings = () => {
    const dispatcher = useAppStateDispatch()
    const appState = useAppStateContext();
    const navigate = useNavigate()


    const [openAIApiKey, setOpenAIApiKey] = useState('') 
    const [listOfOpenAIModels, setListOfOpenAIModels] = useState([])

    const [isSavingChangs, setIsSavingChangs] = useState(false)

    const [allowOpenAIResponseGeneration, setAllowOpenAIResponseGeneration] = useState(false)
    const [selectedOpenAIModelForResponseGeneration, setSelectedOpenAIModelForResponseGeneration] = useState('') 
    const [inputModelNameResponseGeneration, setInputModelNameResponseGeneration] = useState('');
    //const [selectedOpenAIModelForResponseGeneration, setSelectedOpenAIModelForResponseGeneration] = useState('')

    const [allowOpenAIRephraseResponse, setAllowOpenAIRephraseResponse] = useState(false)
    const [selectedOpenAIModelForRephrasingBotResponse, setSelectedOpenAIModelForRephrasingBotResponse] = useState('') 
    const [inputModelNameRephraseResponse, setInputModelNameRephraseResponse] = useState('');

    //const [selectedOpenAIModelForRephrasingBotResponse, setSelectedOpenAIModelForRephrasingBotResponse] = useState('')
    const [allowOpenAIDataAugmentation, setAllowOpenAIDataAugmentation] = useState(false) 
    const [selectedOpenAIModelForQAndADataGeneration, setSelectedOpenAIModelForQAndADataGeneration] = useState('') 
    const [inputModelNameDataAugmentation, setInputModelNameDataAugmentation] = useState('');

    //const [selectedOpenAIModelForQAndADataGeneration, setSelectedOpenAIModelForQAndADataGeneration] = useState('')
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' });
    const [stateChanged, setStateChanged] = useState(false)

    useEffect(()=>{
        if (!(appState.hasOwnProperty('settings') && appState.settings.hasOwnProperty('openAISettings'))){
            return;
        }
        const openaisettings = appState.settings.openAISettings;
        setOpenAIApiKey(openaisettings.openAIApiKey)
        setAllowOpenAIResponseGeneration(openaisettings.fallbackResponse.allow)
        setSelectedOpenAIModelForResponseGeneration(openaisettings.fallbackResponse.modelName)
        setAllowOpenAIRephraseResponse(openaisettings.rephraseBotResponse.allow)
        setSelectedOpenAIModelForRephrasingBotResponse(openaisettings.rephraseBotResponse.modelName)
        setAllowOpenAIDataAugmentation(openaisettings.datasetGeneration.allow)
        setSelectedOpenAIModelForQAndADataGeneration(openaisettings.datasetGeneration.modelName)
        
    },[appState])

    useEffect(() => {
        setStateChanged(true)
    }, [
        allowOpenAIDataAugmentation,
        allowOpenAIRephraseResponse,
        allowOpenAIResponseGeneration,
        openAIApiKey,
        selectedOpenAIModelForResponseGeneration,
        selectedOpenAIModelForRephrasingBotResponse,
        selectedOpenAIModelForQAndADataGeneration
    ])

    useEffect(async () => {

        if (!appState.hasOwnProperty('projectName')){
            return;
        }
        await fetch(SERVER_URL + '/get-openAI-models-list', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName: appState.projectName
            }),
            credentials: 'include'
        }).then(async (response) => {
            var json = await response.json()
            if (response.status === 200) {
                return { status: response.status, modelList: json }
            }
            else {
                return { status: response.status, ...json }
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setListOfOpenAIModels(response.modelList)
                }
                else {
                    setSnackBarPayload({
                        open: true,
                        severity: response.severity,
                        message: response.message
                    })
                }

            })
            .catch(error => {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while retrieving the OpenAI models'
                })
            });
    }, [appState])


    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    //function save changes into databases
    async function saveChanges(event) {
        event.preventDefault();
        setIsSavingChangs(true)

        await fetch(SERVER_URL + '/update-openAI-settings', {
            method: "POST",
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({
                projectName: appState.projectName,
                openAIApiKey,
                allowOpenAIRephraseResponse,
                selectedOpenAIModelForRephrasingBotResponse,
                allowOpenAIResponseGeneration,
                selectedOpenAIModelForResponseGeneration,
                allowOpenAIDataAugmentation,
                selectedOpenAIModelForQAndADataGeneration
            }),
            credentials: 'include'
        }).then(async (response) => {
            var json = await response.json()
            return { status: response.status, ...json }
        })
            .then(response => {

                if (response.status === 200) {
                    setIsSavingChangs(false)
                    setSnackBarPayload({
                        open: true,
                        severity: "success",
                        message: response.message
                    })

                }
                else {
                    setIsSavingChangs(false)
                    setSnackBarPayload({
                        open: true,
                        severity: "error",
                        message: response.message
                    })
                }
            })
            .catch(error => {
                setIsSavingChangs(false)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection occured while saving OpenAI settings.'
                })
            });
    }


    return (
        <Box
            display="flex"
            flexDirection="column" spacing={1}
            sx={{ padding: 2 }} component="form" onSubmit={saveChanges}
        >
            <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold', paddingY: 1 }}>Open AI settings</Typography>
            <Typography align='left' sx={{ typography: 'subtitle2', fontWeight: 'bold', paddingY: 1 }}>API Key</Typography>

            <TextField
                size='small'
                margin='normal'
                id='openAIApiKey'
                label='Enter OpenAI Api Key here'
                name='openAIApiKey'
                autoComplete='off'
                autoFocus
                value={openAIApiKey}
                onChange={(e) => setOpenAIApiKey(e.target.value)}

            />
            <Typography align='left' sx={{ typography: 'subtitle2', p: 1 }}>An API key is essential for interacting with OpenAI models.The API key for Open AI models can be obtained via the link :<br></br>https://platform.openai.com/account/api-keys</Typography>
            <Typography align='left' sx={{ typography: 'subtitle2', fontWeight: 'bold', paddingY: 1 }}>Select OpenAI model</Typography>
            <FormControl sx={{ paddingTop: '1rem' }}>
                <FormLabel id="radio-button-allow-or-disallow-to-rephrase-bot-response">Allow OpenAI to rephrase the bot response</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="radio-button-allow-or-disallow-to-rephrase-bot-response"
                    name="radio-group-button-allow-or-disallow-to-rephrase-bot-response"
                    value={allowOpenAIRephraseResponse ? "true" : "false"}
                    onChange={(event, value) => setAllowOpenAIRephraseResponse(value === "true" ? true : false)}
                >
                    <FormControlLabel value="true" control={<Radio />} label="Allow" />
                    <FormControlLabel value="false" control={<Radio />} label="Disallow" />
                </RadioGroup>
            </FormControl>
            {allowOpenAIRephraseResponse &&
                <Autocomplete
                    autoComplete='off'
                    fullWidth
                    size='small'
                    value={selectedOpenAIModelForRephrasingBotResponse}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    onChange={(event, newValue) => {
                        setSelectedOpenAIModelForRephrasingBotResponse(newValue);
                    }}
                    inputValue={inputModelNameRephraseResponse}
                    onInputChange={(event, newInputValue) => {
                        setInputModelNameRephraseResponse(newInputValue);
                    }}
                    id="model-selector-rephrase"
                    options={listOfOpenAIModels}
                    noOptionsText="No Models found"
                    renderInput={(params) => <TextField {...params} label="Select OpenAI model for rephrasing bot response" />
                    }
                    sx={{ display: allowOpenAIRephraseResponse ? 'inline' : 'none' }}
                />

            }

            <FormControl sx={{ paddingTop: '1rem' }}>
                <FormLabel id="radio-button-allow-or-disallow-to-respond-questions">Allow OpenAI to answer the questions in case the chatbot is unable to answer</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="radio-button-allow-or-disallow-to-respond-questions"
                    name="row-radio-buttons-group-openAI-use-for-response-generation"
                    value={allowOpenAIResponseGeneration ? "true" : "false"}
                    onChange={(event, value) => setAllowOpenAIResponseGeneration(value === "true" ? true : false)}
                >
                    <FormControlLabel value="true" control={<Radio />} label="Allow" />
                    <FormControlLabel value="false" control={<Radio />} label="Disallow" />
                </RadioGroup>
            </FormControl>
            <Autocomplete
                autoComplete='off'
                fullWidth
                size='small'
                value={selectedOpenAIModelForResponseGeneration}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                onChange={(event, newValue) => {
                    setSelectedOpenAIModelForResponseGeneration(newValue);
                }}
                inputValue={inputModelNameResponseGeneration}
                onInputChange={(event, newInputValue) => {
                    setInputModelNameResponseGeneration(newInputValue);
                }}
                id="model-selector-response-generation"
                options={listOfOpenAIModels}
                noOptionsText="No Models found"
                renderInput={(params) => <TextField {...params} label="Select OpenAI model for response generation" />
                }
                sx={{ display: allowOpenAIResponseGeneration ? 'inline' : 'none' }}
            />
            <FormControl sx={{ paddingTop: '1rem' }}>
                <FormLabel id="radio-button-allow-or-disallow-q&ageneration">Allow OpenAI to help with Q&A dataset generation.</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="radio-button-allow-or-disallow-q&ageneration"
                    name="radio-radio-button-allow-or-disallow-q&ageneration"
                    value={allowOpenAIDataAugmentation ? "true" : "false"}
                    onChange={(event, value) => setAllowOpenAIDataAugmentation(value === "true" ? true : false)}
                >
                    <FormControlLabel value="true" control={<Radio />} label="Allow" />
                    <FormControlLabel value="false" control={<Radio />} label="Disallow" />
                </RadioGroup>
            </FormControl>
            <Autocomplete
                autoComplete='off'
                fullWidth
                size='small'
                value={selectedOpenAIModelForQAndADataGeneration}
                onChange={(event, newValue) => {
                    setSelectedOpenAIModelForQAndADataGeneration(newValue);
                }}
                inputValue={inputModelNameDataAugmentation}
                onInputChange={(event, newInputValue) => {
                    setInputModelNameDataAugmentation(newInputValue);
                }}
                id="model-selector-response-generation"
                options={listOfOpenAIModels}
                noOptionsText="No Models found"
                renderInput={(params) => <TextField {...params} label="Select OpenAI model for dataset generation" />
                }
                sx={{ display: allowOpenAIDataAugmentation ? 'inline' : 'none' }}
            />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '1rem'
            }}><LoadingButton
                size="small"
                type="submit"
                loading={isSavingChangs}
                loadingIndicator="Saving ..."
                variant="contained"
                disabled={stateChanged ? false : true}
            >
                    <span>Save OpenAI settings Changes</span>
                </LoadingButton>

            </div>



            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
        </Box>

    );
}