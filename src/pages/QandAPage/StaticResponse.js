import { useState } from 'react'
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

export default function StaticResponse({answers,updateAnswers,usedEntitiesUtterance}) {
    const [chosenToAddAnswer, setChosenToAddAnswer] = useState(false)
    const [currentAnswer, setCurrentAnswer] = useState('')


  
    //this function will add current answer if the user is focused in current answer box and press 
    //the enter button
    function handlekeyDownAnswer(key) {
        if (key === 'Enter') {
            addCurrentAnswer();
        }
    }

    //function to add typed answer to the array answers if chosen static response
    function addCurrentAnswer() {
        if(isEmpty(currentAnswer)){
            return 
        }
        updateAnswers([...answers,currentAnswer])
        setCurrentAnswer('')

    }

    //this function will dispatch delete answer event 
    function removeAnswer(index) {
        updateAnswers(answers.filter((item, idx) => idx !== index))
    }

    return (
        <Box >
            <Typography component='h6' variant='h6'>Answers</Typography>
            <List style={{ border: '1px solid #54B4D3', borderRadius: '.3rem', padding: 0 }}>
                {(!chosenToAddAnswer && answers.length === 0) &&
                    <ListItem className='listItem'>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            No answers added yet.<br></br>
                            <Button onClick={() => setChosenToAddAnswer(true)}>Add Answer</Button></ListItemText>
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
        </Box>
    )
}
