import { useState } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function RegexDefinition({regexDefinition,setRegexDefinition}) {
    

    return (
        <Box sx={{ width: '100%' }}>
            <TextField
                size='small'
                margin="normal"
                required
                name="regex-term"
                label="Regex definition"
                id="regex-term"
                autoComplete='off'
                fullWidth
                value={regexDefinition}
                onChange={(e) => setRegexDefinition(e.target.value)}
            />
        </Box>
    )
}
