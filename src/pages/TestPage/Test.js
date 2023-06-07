import React, { useState } from 'react';
import { Typography, FormControl, FormLabel, FormControlLabel, FormGroup, Checkbox, Radio, RadioGroup, Button, IconButton, Box } from '@mui/material';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { TextField, Autocomplete } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ConditionEvaluator = () => {
    const [conditions, updateConditions] = useState([]);
    const [connector, setConnector] = useState('AND');

    const [options, setOptions] = useState([]);


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
    };

    const evaluateConditions = () => {
        // Evaluate the conditions and perform necessary actions
        console.log('Conditions:', conditions);
        console.log('Connector:', connector);
    };


    const handleFilterOptions = (inputValue) => {
        // Perform filtering logic here based on the inputValue
        const filteredOptions = ['Apple', 'Banana', 'Cherry', 'Grapes'].filter(option =>
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
        setOptions(filteredOptions);
    };

    function updateContextVariable(index, newVariable) {
        updateConditions(previousConditions => {
            const newConditions = [...previousConditions];
            newConditions[index] = { ...newConditions[index], contextVariable: newVariable };
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
            return newConditions
        })
    }

    function updateTestValue(index, newTestValue) {
        updateConditions(previousConditions => {
            const newConditions = [...previousConditions];
            newConditions[index] = { ...newConditions[index], testValue: newTestValue };
            return newConditions
        })
    }

    return (
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
                                <Select  value={operator} onChange={(e) => updateOperator(index, e.target.value)} placeholder='Opeartor ' size='small'>

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
                                label="Outlined"
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


            <Button variant="contained" color="primary" onClick={evaluateConditions}>
                Evaluate Conditions
            </Button>


        </Box>
    );
};

export default ConditionEvaluator;



