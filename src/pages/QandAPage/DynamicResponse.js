import { useState, useEffect, useRef } from 'react'

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { validateKeyDownEvent } from '../../Objects/CommonFunctions';
import Alert from '@mui/material/Alert';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

export default function DynamicResponse({ actionName, setActionName, actionCode, setActionCode, actionNameAlreadyExists, actionNameAlreadyExistsWarningMessage}) {


    return (
        <Box>
            <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>*Action Name must be same at both section, otherwise, code will not be executed.</Typography>

            <TextField
                size='small'
                margin="normal"
                required
                fullWidth
                autoComplete='off'
                name="action-name"
                label="Action Name  ( min. 5 characters )"
                id="action-name"
                value={actionName}
                onKeyDown={e => validateKeyDownEvent(e)}
                onChange={e => setActionName(e.target.value)}

            />
            {actionNameAlreadyExists &&
                <Alert severity='warning'>
                    {actionNameAlreadyExistsWarningMessage || 'Action definition already exisits for this action name. Please specify different action name.'}
                </Alert>
            }
            <Typography component='h6' sx={{ flexShrink: 0 }}>Action Code</Typography>
            <div style={{ border: '1px solid grey' }}>

                <Editor
                    value={actionCode}
                    onValueChange={actionCode => setActionCode(actionCode)}
                    highlight={actionCode => highlight(actionCode, languages.js)}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                    }}
                />
            </div>

        </Box>
    )
}

