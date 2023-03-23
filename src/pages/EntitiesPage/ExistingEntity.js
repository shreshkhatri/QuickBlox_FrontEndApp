import Typography from '@mui/material/Typography';
import { useState } from 'react'
import { useAppStateContext } from '../../ApplicationContextProvider'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RegexDefinition from './RegexDefinition';
import SynonymDefinition from './SynonymDefinition';
import Button from '@mui/material/Button';
import { SERVER_URL } from '../../config';
import { isEmpty } from '../../Objects/CommonFunctions';
import { useNavigate } from 'react-router-dom';

export const ExistingEntity = (props) => {
    const appState = useAppStateContext()
    const [synonymDefinitions, updateSynonymDefinitions] = useState((props.type==="synonym" && props.value)|| undefined)
    const [regexDefinition, setRegexDefinition] = useState((props.type==="regex" && props.value.regex)|| undefined)
    const [loading, setLoading] = useState(false)    
    const [stateChanged, setStateChanged] = useState(false)
    const setSnackBarPayload=props.setSnackBarPayload
    const navigate = useNavigate()

    console.log(typeof synonymDefinitions)
console.log(synonymDefinitions)
    //function to update the existing regex definition
    function updateRegexDefinition(updatedRegex){
        setRegexDefinition(updatedRegex)
        setStateChanged(true)
    }

    //function to add more synonym definitions to the existing definition
    function addOneMoreSynonymDefinition() {
        updateSynonymDefinitions([...synonymDefinitions, {
            synonym: '',
            values: ''
        }])
        setStateChanged(true)
    }

    //function to update synonym term
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
        setStateChanged(true)
    }

    //function to update synonym values
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
        setStateChanged(true)
    }

    //function to update the existing entity definition in database
    async function updateEntityDefinition() {
        var payload={
            'entity':props.entity,
            'type':props.type,
            'description':props.description
        };
        setLoading(true)

        
        if (props.type==="synonym"){
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
            payload.value = tempSynonymDefinitions
        }
        else if (props.type==="regex"){
            if (isEmpty(regexDefinition)){
                setSnackBarPayload({ open: true, severity: "error", message: 'Regex is not provided'})
                setLoading(false)
                return
            }
            payload.value = {'regex':regexDefinition}

        }
        console.log(payload)
        await fetch(SERVER_URL + '/update-entity-data/'+props.type, {
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
                aria-controls={"qandadata-content"}
                id={"qandadata"}
            >
                <Typography sx={{ typography: 'subtitle2' }}>{props.description}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Entity Name : {props.entity}
                </Typography>
                <br></br>
                <Typography sx={{ typography: 'subtitle2', fontWeight: 'bold' }}>
                    Type : {props.type}
                </Typography>
                {props.type==="synonym" && <SynonymDefinition 
                        synonymDefinitions={synonymDefinitions} 
                        addOneMoreSynonymDefinition={addOneMoreSynonymDefinition}
                        setSynonymTerm={setSynonymTerm}
                        setSynonymValues={setSynonymValues}
                        />}
                {props.type==="regex" && <RegexDefinition regexDefinition={regexDefinition} setRegexDefinition={updateRegexDefinition} />}               
                <br></br>
                <Button variant="contained" disabled={stateChanged ? false : true} onClick={updateEntityDefinition}>Save Changes</Button>
            </AccordionDetails>
        </Accordion>

    );
}