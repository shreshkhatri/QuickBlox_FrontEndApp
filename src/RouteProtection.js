import {useAppStateContext} from './ApplicationContextProvider'
import LoginPage from './pages/LoginPage/Login'
import {Navigate} from 'react-router-dom'


export const RouteProtection=({props,children})=>{

    const appState = useAppStateContext()
    
    return appState.hasOwnProperty('loginstatus') && appState.loginstatus===true? children: <Navigate to="/login" replace />
   
}