import { useState, useEffect } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import ScriptBotResponse from "./ScriptBotResponse";
import ScriptDynamicResponse from "./ScriptDynamicResponse";
import ScriptLinkNewScript from "./ScriptLinkAnotherScript";
import './ScriptCondition.css';
import ScriptTriggerIntent from "./ScriptTriggerIntent";
const initialQuery = {
  combinator: 'and',
  rules: [
  ],
};

export default function ScriptCondition(props) {
  const [query, setQuery] = useState(initialQuery || props.query);
  const [expanded, setExpanded] = useState(true)
  const [changesSaved, setChangesSaved] = useState(true)
  const [fields, setFields] = useState(props.listOfResponseNames || [])
  const [stepToRunIfTrue, updateStepToRunIfTrue] = useState(props.stepToRunIfTrue || {})
  const [selectedStepIndex, setSelectedStepIndex] = useState(undefined)



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
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={q => {
            setQuery(q);
            setChangesSaved(false);
            props.stepDefinitionComplete(props.stepID, false)
          }}
        />
        {query.rules.length !== 0 &&
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
            if (query.rules.length === 0 || Object.keys(stepToRunIfTrue).length === 0) {
              return
            }
            props.onStepUpdate(props.stepID,
              {
                query,
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
