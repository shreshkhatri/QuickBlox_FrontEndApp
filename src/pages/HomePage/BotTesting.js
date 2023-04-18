import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import {useState} from 'react';
import {SERVER_URL} from '../../config'

export const BotTesting = () => {
    const [message,setMessage]=useState('')
    const [sendingMessageStatus,setSendingMessageStatus]=useState(false)
    const [response,setResponse]=useState({})
    
    const handleKeyUp=(e)=>{
        if (e.keyCode==13){
            if(message.length>0){
                sendTestMessage(message)
                
            }
        }
    }

    async function sendTestMessage(message){
        setSendingMessageStatus(true)
        await fetch(SERVER_URL + '/testbot', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            body: JSON.stringify({ incoming_message: message }),
            credentials:'include'
        }).then(response => {
            if (response.status == 200) {
                return response.json()
            }
        }).then(response=>{
            if (response){
                var keys=Object.keys(response);
                var combined_result=keys.reduce((combined,current_key)=>{
                    return combined + current_key+' : '+JSON.stringify(response[current_key]) +'\n\n'
                },"")

                setResponse(combined_result)
            }
        })
        .catch(error => {
            if (error) {
                alert('some error occured')
            }

        });
        setSendingMessageStatus(false)
    }
    return (
        <>
            <Typography variant="h6" >
                Test your Bot
            </Typography>


            <TextField
                margin="normal" fullWidth
                id="test-message"
                label="Type your message and press enter"
                name="test-message"
                onKeyUp={handleKeyUp}
                onChange={(e)=>setMessage(e.target.value)}
                autoComplete='off'
            />
             {sendingMessageStatus && <LinearProgress/>}
            
            <br/>
            <Typography variant="h6" align='left'>
                Responses
            </Typography>
            <TextField
                margin="normal" fullWidth
                id="bot-response"
                name="bot-response"
                multiline
                minRows={15}
                autoComplete='off'
                value={response}
                disabled
            />

        </>
    )
}