import { useState, useEffect } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import ScriptBotResponse from "./ScriptBotResponse";
import ScriptDynamicResponse from "./ScriptDynamicResponse";
import ScriptLinkNewScript from "./ScriptLinkAnotherScript";
import './ScriptCondition.css';
import ScriptTriggerIntent from "./ScriptTriggerIntent";
import { FormControl, FormLabel, FormControlLabel, FormGroup, Radio, RadioGroup, IconButton } from '@mui/material';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { TextField, Autocomplete } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


export default function ScriptCondition(props) {

  const [expanded, setExpanded] = useState(true)
  const [changesSaved, setChangesSaved] = useState(true)
  const [stepToRunIfTrue, updateStepToRunIfTrue] = useState(props.stepToRunIfTrue || {})
  const [selectedStepIndex, setSelectedStepIndex] = useState(undefined)

  // newly added variables //
  const [conditions, updateConditions] = useState(props.conditions || []);
  const [connector, setConnector] = useState(props.connector || 'AND');
  const [options, setOptions] = useState(props.listOfResponseNames.map(response =>response.name)  || []);
  console.log('Conditions:', conditions);
  console.log('Connector:', connector);

  const stepList = [
    { stepLabel: 'Bot Text Response', stepTypeIndex: 0 },
    { stepLabel: 'Dynamic Response', stepTypeIndex: 1 },
    { stepLabel: 'Link Existing script', stepTypeIndex: 4 },
    { stepLabel: 'Trigger an Intent', stepTypeIndex: 5 }
  ]

  //function for updating step
  function onStepUpdate(stepID, update) {
    updateStepToRunIfTrue({ ...stepToRunIfTrue, ...update })
  }

  const handleConnectorChange = (event) => {
    setConnector(event.target.value);
  };


  const addCondition = () => {
    updateConditions([...conditions, { contextVariable: '', inputContextVariable: '', operator: '', inputOperator: '', testValue: '' }]);
  };

  const deleteCondition = (index) => {
    const updatedConditions = [...conditions];
    updatedConditions.splice(index, 1);
    updateConditions(updatedConditions);
    setChangesSaved(false)
  };

 
    


  const handleFilterOptions = (inputValue) => {
    // Perform filtering logic here based on the inputValue
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setOptions(filteredOptions);
  };

  function updateContextVariable(index, newVariable) {
    updateConditions(previousConditions => {
      const newConditions = [...previousConditions];
      newConditions[index] = { ...newConditions[index], contextVariable: newVariable };
      setChangesSaved(false)
      return newConditions
    })
    
  }

  function updateInputContextVariable(index, newInputContextVariable) {
    updateConditions(previousConditions => {
      const newConditions = [...previousConditions];
      newConditions[index] = { ...newConditions[index], inputContextVariable: newInputContextVariable };
      
      return newConditions
    })
    
  }

  function updateOperator(index, newOperator) {
    updateConditions(previousConditions => {
      const newConditions = [...previousConditions];
      newConditions[index] = { ...newConditions[index], operator: newOperator };
      setChangesSaved(false)
      return newConditions
    })
    
  }

  function updateTestValue(index, newTestValue) {
    updateConditions(previousConditions => {
      const newConditions = [...previousConditions];
      newConditions[index] = { ...newConditions[index], testValue: newTestValue };
      setChangesSaved(false)
      return newConditions
    })
  }



  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`step Number ${props.stepID}:  script condition `}
        id={`${props.stepID}-script-condition`}
      >
        <Typography sx={{ width: '10%', flexShrink: 0 }}>
          Step : {props.stepIndex + 1}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{props.stepLabel}</Typography>

      </AccordionSummary>
      <AccordionDetails>
        <Box display='flex' flexDirection='column' alignItems='left'>

          <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold', }}>Conditions</Typography>

          <FormControl component="fieldset">
            <FormLabel id="label-for-operator">Condition Connector</FormLabel>
            <RadioGroup row
              aria-aria-labelledby="label-for-operator"
              name="connector"
              value={connector}
              onChange={handleConnectorChange}

            >
              <FormControlLabel value="AND" control={<Radio />} label="AND" />
              <FormControlLabel value="OR" control={<Radio />} label="OR" />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormGroup>
              {conditions.map(({ contextVariable, inputContextVariable, operator, testValue }, index) => (
                <Box key={index} display="flex" alignItems="center" sx={{ p: 1 }}>

                  <Autocomplete
                    fullWidth
                    sx={{ paddingRight: 1 }}
                    value={contextVariable}
                    size='small'
                    onChange={(event, newValue) => updateContextVariable(index, newValue)}
                    inputValue={inputContextVariable}
                    onInputChange={(event, newInputValue) => {
                      const isExistingOption = options.includes(newInputValue);
                      if (!isExistingOption) {
                        updateContextVariable(index, newInputValue);
                      }
                      updateInputContextVariable(index, newInputValue);
                    }}

                    options={options}
                    filterOptions={(options) => options} // Disable default filtering behavior
                    onOpen={() => handleFilterOptions('')} // Reset filter when dropdown opens
                    renderInput={(params) => (
                      <TextField {...params} label="Select Context variable" variant="outlined" />
                    )}
                  />
                  <FormControl sx={{ paddingRight: 1, width: '100%', maxWidth: 300 }}>
                    <InputLabel>Operator</InputLabel>
                    <Select value={operator} onChange={(e) => updateOperator(index, e.target.value)} placeholder='Opeartor ' size='small'>

                      <MenuItem value="==">Equal to (==)</MenuItem>
                      <MenuItem value="!=">Not equal to (!=)</MenuItem>
                      <MenuItem value=">">Greater than (&gt;)</MenuItem>
                      <MenuItem value="<">Less than (&lt;)</MenuItem>
                      <MenuItem value=">=">Greater than or equal to (&gt;=)</MenuItem>
                      <MenuItem value="<=">Less than or equal to (&lt;=)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    sx={{ paddingRight: 1 }}
                    id="outlined-basic"
                    label="Test Value"
                    variant="outlined"
                    size='small'
                    placeholder='Value'
                    value={testValue}
                    Autocomplete='off'
                    fullWidth
                    onChange={(e) => updateTestValue(index, e.target.value)}
                  />
                  <IconButton

                    onClick={() => deleteCondition(index)}
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

            </FormGroup>
          </FormControl>
          <Button onClick={addCondition}>Add Condition</Button>




        </Box>
        {conditions.length !== 0 &&
          <Box>
            <hr></hr>
            <Typography align='left' sx={{ typography: 'subtitle1', color: 'text.secondary' }}>Step to run if the condition is true</Typography>

            {stepToRunIfTrue && stepToRunIfTrue.stepTypeIndex === 0 && <ScriptBotResponse
              {...stepToRunIfTrue}
              onStepUpdate={onStepUpdate}
              stepDefinitionComplete={props.stepDefinitionComplete}
              hideDeleteButton={true}
            />}
            {stepToRunIfTrue && stepToRunIfTrue.stepTypeIndex === 1 && <ScriptDynamicResponse
              {...stepToRunIfTrue}
              onStepUpdate={onStepUpdate}
              stepDefinitionComplete={props.stepDefinitionComplete}
              hideDeleteButton={true} />}
            {stepToRunIfTrue && stepToRunIfTrue.stepTypeIndex === 4 && <ScriptLinkNewScript {...stepToRunIfTrue}
              onStepUpdate={onStepUpdate}
              stepDefinitionComplete={props.stepDefinitionComplete}
              scriptName={props.scriptName}
              hideDeleteButton={true} />}

            {stepToRunIfTrue && stepToRunIfTrue.stepTypeIndex === 5 && <ScriptTriggerIntent {...stepToRunIfTrue}
              onStepUpdate={onStepUpdate}
              stepDefinitionComplete={props.stepDefinitionComplete}
              hideDeleteButton={true} />}
            <br></br>
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='center' spacing={2}>
              {
                stepList.map(({ stepLabel, stepTypeIndex }, index) => {

                  return <Button variant='outlined' key={index} onClick={() => {
                    updateStepToRunIfTrue({ ...stepList[index], stepIndex: 0, stepID: props.stepID })
                    setSelectedStepIndex(index)
                  }
                  }
                    style={{
                      backgroundColor: selectedStepIndex === index ? '#3978FC' : '#ffffff',
                      color: selectedStepIndex === index ? '#ffffff' : '#3978FC',
                    }}

                  >{stepLabel}</Button>
                })
              }
            </Stack>
          </Box>
        }
        <Stack paddingTop={1} direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} justifyContent='right' spacing={2}>
          <Button size="small" variant="outlined" disabled={changesSaved ? true : false} onClick={() => {
            //we should not save state either if there is not a single rule or no any condition is defined to be executed
            if (conditions.length === 0) {
              return
            }
            props.onStepUpdate(props.stepID,
              {
                conditions,
                connector,
                stepToRunIfTrue,
                stepDefinitionComplete: true
              })
            setChangesSaved(true)
          }
          }>Save Changes</Button>
          <Button size="small" variant="outlined" onClick={() => props.onStepRemove(props.stepID)}>Delete Step</Button>
        </Stack>
      </AccordionDetails>
    </Accordion>)
}
