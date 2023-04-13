import { validateKeyDownEvent, isEmpty } from '../../Objects/CommonFunctions';
import { useAppStateContext } from '../../ApplicationContextProvider'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SynonymDefinition from './SynonymDefinition';
import RegexDefinition from './RegexDefinition';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { SERVER_URL } from '../../config';

export default function NewEntiy({setSnackBarPayload}) {
    const appState = useAppStateContext()
    const navigate = useNavigate()
    const [entityName, setEntityName] = useState('')
    const [entityType, setEntityType] = useState('synonym')
    const [entityDescription, setEntityDescription] = useState('')
    const [synonymDefinitions, updateSynonymDefinitions] = useState([{
        synonym: '',
        values: ''
    }])
    const [regexDefinition, setRegexDefinition] = useState('')
    const [topAccordionExpanded, setTopAccordionExpanded] = useState(false)
    const [loading, setLoading] = useState(false)

    console.log(synonymDefinitions)

    //function to add more entity synonym definition
    function addOneMoreSynonymDefinition() {
        updateSynonymDefinitions([...synonymDefinitions, {
            synonym: '',
            values: ''
        }])
    }

    function setSynonymTerm(index, updatedSynonym) {
        console.log(index, updatedSynonym)
        console.log(synonymDefinitions)

        var tempSynonymDefinitions = synonymDefinitions.map(({ synonym, values }, idx) => {
            if (idx === index) {
                return { synonym: updatedSynonym, values: values }
            }
            else {
                return { synonym, values }
            }
        })

        updateSynonymDefinitions([...tempSynonymDefinitions])
    }

    function setSynonymValues(index, updatedValues) {
        var tempSynonymDefinitions = synonymDefinitions.map(({ synonym, values }, idx) => {
            if (idx === index) {
                return {
                    synonym: synonym,
                    values: updatedValues
                }
            }
            else {
                return { synonym, values }
            }
        })
        updateSynonymDefinitions([...tempSynonymDefinitions])
    }

    //function for closing the snackbar
    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }
    //function to upload the newly created entity information to the server

    async function uploadNewEntity() {
        var payload={};
        setLoading(true)
        if (isEmpty(entityName)){
            setSnackBarPayload({ open: true, severity: "error", message: 'Entity Name is required'})
            setLoading(false)
            return
        }
        payload.entity = entityName
        payload.description = entityDescription
        
        if (entityType==="synonym"){
            var tempSynonymDefinitions=synonymDefinitions.filter(({synonym,values},index)=>{
                if (!isEmpty(synonym) && !isEmpty(values)){
                    return {synonym,values}
                }
            })

            if (tempSynonymDefinitions.length===0){
                setSnackBarPayload({ open: true, severity: "error", message: 'Synonym definitions not provided properly'})
                setLoading(false)
                return
            }
            payload.type = "synonym"
            payload.value = tempSynonymDefinitions
        }
        else if (entityType==="regex"){
            if (isEmpty(regexDefinition)){
                setSnackBarPayload({ open: true, severity: "error", message: 'Regex is not provided'})
                setLoading(false)
                return
            }
            payload.type = "regex"
            payload.value = {'regex':regexDefinition}

        }
        console.log(payload)
        await fetch(SERVER_URL + '/insert-entity-data/'+entityType, {
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

    //function to reset the fields which are used for cre
    function resetNewEntityData() {
        setEntityName('')
        setEntityType('synonym')
        updateSynonymDefinitions([{
            synonym: '',
            values: ''
        }])
    }

    return (<>
        <Accordion expanded={topAccordionExpanded} onChange={() => setTopAccordionExpanded(!topAccordionExpanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="entity-content"
                id="entity-content"
            >
                <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>New Entity</Typography>
            </AccordionSummary>
            <AccordionDetails >
                <Box  >
                    <TextField
                        size='small'
                        margin="normal"
                        required
                        id="entityName"
                        label="Entity Name ( min. 5 characters )"
                        name="entityName"
                        fullWidth
                        autoComplete='off'
                        value={entityName}
                        onKeyDown={e => validateKeyDownEvent(e)}
                        onChange={e => setEntityName(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        size='small'
                        margin="normal"
                        
                        id="entityDescription"
                        label="Entity Description"
                        name="entityDescription"
                        fullWidth
                        autoComplete='off'
                        value={entityDescription}
                        onChange={e => setEntityDescription(e.target.value)}
                        autoFocus
                    />
                    <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>Entity Value Type</Typography>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                        <FormControl>
                            <RadioGroup
                                row
                                aria-labelledby="entity-type-selection-label"
                                name="entity-type-selection-label-radio-buttons-group"
                                value={entityType}
                                onChange={e => setEntityType(e.target.value)}
                            >
                                <FormControlLabel value="synonym" control={<Radio />} label="Synonym" />
                                <FormControlLabel value="regex" control={<Radio />} label="Regex" />

                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        {entityType === "synonym" && <SynonymDefinition synonymDefinitions={synonymDefinitions} setSynonymTerm={setSynonymTerm} setSynonymValues={setSynonymValues} addOneMoreSynonymDefinition={addOneMoreSynonymDefinition} />}
                        {entityType === "regex" && <RegexDefinition regexDefinition={regexDefinition} setRegexDefinition={setRegexDefinition} />}
                    </Box>
                    <Stack spacing={2} direction='row' justifyContent='center' >
                        <Button variant='outlined' onClick={() => { setTopAccordionExpanded(false); resetNewEntityData(); }}>Cancel</Button>
                        <LoadingButton
                            size="small"
                            onClick={() => uploadNewEntity()}
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
        </>
    )
}