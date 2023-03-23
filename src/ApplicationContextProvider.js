import React,{useReducer,useContext} from 'react'
import {reducer} from './mainreducer'
import { useCookies } from 'react-cookie'
const AppStateContext=React.createContext()
const AppStateDispatch=React.createContext()

export function ApplicationContextProvider({children}){
    console.log('Context Page')
    const [cookies, setCookie] = useCookies(['access_token', 'useremail'])
    const [applicationState, dispatch] = useReducer(reducer, {
        loginstatus: cookies.access_token && cookies.useremail && true,
        email:cookies.useremail,
        modelTrainedAt:0
      });

      return (
        <AppStateContext.Provider value={applicationState}>
            <AppStateDispatch.Provider value={dispatch}>
            {children}
            </AppStateDispatch.Provider>
        </AppStateContext.Provider>
      )
}




export function useAppStateDispatch(){
    return useContext(AppStateDispatch)
}

export function useAppStateContext(){
    return useContext(AppStateContext)
}