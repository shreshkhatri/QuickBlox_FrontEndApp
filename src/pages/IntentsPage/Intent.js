import { useState, useEffect, useRef } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CustomError } from '../../Objects/CustomError';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../LoadingPage/Loading';
import CustomSnackbar from '../../components/CustomSnackbar';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import NewIntent from './NewIntent'
import { ExistingIntentData } from './ExistingIntentData';



export const Intents = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [pageLoading, setpageLoading] = useState(true)
    const appState = useAppStateContext();
    const [listOfIntents, setListOfIntents] = useState([])
    const [clicked, setClick] = useState(true)
    const containerRef = useRef(null);
    const [open, setOpen] = useState(true);
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' });

    document.title = "Intents " + AppTitle

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }


    //useEffect for displaying the existing  qandA dataset for the selected language when the page
    //loads for the first time or is refreshed
    useEffect(() => {
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-intent-data', {
                method: "POST",
                redirect: 'follow',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'charset': 'UTF-8'
                },
                body: JSON.stringify({
                    projectName: appState.projectName,
                    locale: appState.selectedLanguage.locale
                }),
                
            }).then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                else {
                    throw new CustomError(response.status, response.statusText)
                }
            }).then((jsondata) => {
                jsondata = jsondata.map(item => {
                    return { ...item, additionalUtterance: '', statechanged: false }
                })
                console.log(jsondata)
                setListOfIntents([...jsondata])
                setpageLoading(false)
            })
                .catch(error => {
                    navigate('/error', { state: { error } })
                });
        }
        if (appState.hasOwnProperty('projectName') && appState.hasOwnProperty('selectedLanguage')) {
            fetchdata()
        }
    }, [appState])

    //displaying the loader if the page is being loaded
    if (pageLoading) {
        return <LoadingPage></LoadingPage>
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="stretch"
            flexDirection="column"
            padding={2}
            ref={containerRef}
        >
            <NewIntent></NewIntent>
            <br></br>

            <Box  >
                {listOfIntents.length === 0 &&
                    <Typography align='center' padding={3} variant={'subtitle1'}>No any intents found for this section.<br></br> You can create intents by clicking the option above.</Typography>
                }
                {listOfIntents.length !== 0 &&
                    <><Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>Existing Intents - {listOfIntents.length}</Typography>
                        <List>
                            {listOfIntents.map((intentData, index) => {
                                return <ListItem key={index}>
                                    <ExistingIntentData {...intentData} setSnackBarPayload={setSnackBarPayload}></ExistingIntentData>
                                </ListItem>
                            })
                            }
                        </List></>
                }
            </Box>
            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>

        </Box>

    );
}