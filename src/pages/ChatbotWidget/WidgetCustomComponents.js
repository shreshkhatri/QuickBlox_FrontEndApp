import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import 'react-chat-widget/lib/styles.css';
import SendIcon from '@mui/icons-material/Send';


export function CustomButtonGroup(props) {
    const [buttonGroupDisabled, setButtonGroupDisabled] = useState(false)
    const handleMessageFromCustomComponent = props.handleMessageFromCustomComponent
    const addUserMessage = props.addUserMessage

    function onClickCustomButton(e) {
        setButtonGroupDisabled(true)
    }

    return (
        <Box sx={{ padding: 2, backgroundColor: '#F4F7F9' }} borderRadius={2}>
            <Typography className='rcw-message-text' variant='p'>{props.displayMessage}</Typography>
            <br></br>
            <ButtonGroup disabled={buttonGroupDisabled} orientation='vertical'>
                {props.elements.map((attributes, index) => {
                    return <Button
                        key={index}
                        variant='contained'
                        sx={{ margin: 1 }}
                        onClick={(e) => {
                            onClickCustomButton(e)
                            addUserMessage(attributes.label)
                            handleMessageFromCustomComponent(attributes.value)
                        }} size='small' {...attributes} >{attributes.label}</Button>
                })}
            </ButtonGroup>
        </Box>
    )
}


export function CustomTextField(props) {
    const [inputMessage, setInputMessage] = useState('')
    return <Box sx={{ padding: 2, backgroundColor: '#F4F7F9' }} borderRadius={2}>
        <Typography className='rcw-message-text' variant='p'>{props.displayMessage}</Typography>
        <br></br>
        {props.elements.map((attributes, index) => {
            return (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', margin: 1 }} key={index} >
                    <TextField id="input-with-sx" {...attributes}
                        size='small'
                        autoComplete='off' />
                    <SendIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                </Box>)

        })}

    </Box>

}

export function EmailComponent(props) {
    console.log('custom email was called')
    const [email, setEmail] = useState('')
    const handleMessageFromCustomComponent = props.handleMessageFromCustomComponent
    const addUserMessage = props.addUserMessage
    function validateEmailAndSend() {
        if (email.length === 0) {
            return
        }
        else {
            addUserMessage(email)
            handleMessageFromCustomComponent(email)
        }
    }
    return <Box sx={{ padding: 2, backgroundColor: '#F4F7F9' }} borderRadius={2}>
        <Typography className='rcw-message-text' variant='p'>{props.displayMessage}</Typography>
        <br></br>
        {props.elements.map((attributes, index) => {
            return (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', margin: 1 }} key={index} >
                    <TextField id="input-with-sx" {...attributes} type='email'
                        size='small'
                        value={email} onChange={e => setEmail(e.target.value)}
                        autoComplete='off' />
                    <SendIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} onClick={() => validateEmailAndSend()} />
                </Box>)

        })}

    </Box>

}
