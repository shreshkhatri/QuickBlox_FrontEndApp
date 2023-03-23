import { useState } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { validateKeyDownEvent } from "../../Objects/CommonFunctions";
function RowData({definitionID,synonym,values,setSynonymTerm,setSynonymValues}) {

    return (
        <Box display='flex' flexDirection={{ xs: 'column', sm: 'row', md: 'row', lg: 'row', xl: 'row' }} justifyContent="center" alignItems="stretch" paddingBottom={1}>
            <TextField
                size='small'
                margin="normal"
                required
                name="synonym-term"
                label="Synonym term"
                id="synonym-term"
                autoComplete='off'
                sx={{ width: { xs: '100%', sm: '100%', md: '20%', lg: '20%', xl: '20%' }, m: 1 }}
                value={synonym}
                onKeyDown={e=> validateKeyDownEvent(e)}
                onChange={e => setSynonymTerm(definitionID,e.target.value)}
            />
            <TextField
                size='small'
                margin="normal"
                required
                name="synonym-term"
                label="Comma seperated values"
                id="synonym-term"
                autoComplete='off'
                sx={{ width: { xs: '100%', sm: '100%', md: '80%', lg: '80%', xl: '80%' }, m: 1 }}
                value={values}
                onChange={e => setSynonymValues(definitionID,e.target.value)}
            />
            <Divider style={{background:'grey'}} variant="middle"/>
        </Box>
    )
}

export default function SynonymDefinition({synonymDefinitions,setSynonymTerm,setSynonymValues,addOneMoreSynonymDefinition}) {
    
    return (<>
        <Stack direction='column' >
            {synonymDefinitions &&
                synonymDefinitions.map(({synonym,values},index)=>{
                    return <RowData 
                                key={index} 
                                definitionID={index} 
                                synonym={synonym} 
                                values={values} 
                                setSynonymTerm={setSynonymTerm} 
                                setSynonymValues={setSynonymValues} />
                })
            }
        

        </Stack>
        <Button variant="text" onClick={()=>addOneMoreSynonymDefinition()}>More synonym</Button>
    </>
    )
}