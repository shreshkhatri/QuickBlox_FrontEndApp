import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {ACTION_TYPES} from '../../mainreducer'
import {useAppStateDispatch,useAppStateContext} from '../../ApplicationContextProvider'
import { supportedLanguages } from '../../Objects/SupportedLanguages';

export default function LanguageSelector() {
  const dispatch=useAppStateDispatch()
  const appcontext= useAppStateContext()

  return (
    <Autocomplete
    id="controlled-demo"
    options={supportedLanguages}
    defaultValue={supportedLanguages.filter(language=>language.locale=='en')[0]}
    getOptionLabel={(option) => option.language}
    onChange={(e,value) => {
        if (value){
          dispatch({
            type: ACTION_TYPES.SET_SELECTED_LANGUAGE,
            payload:{selectedLanguage:value}
          });
        }
    }}
    renderInput={(params) => (
      <TextField {...params} label="Choose Language" variant="standard"/>
    )}
  />
  );
}
