import { useState, useEffect } from 'react'
import { useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Box from '@mui/material/Box';
import { CustomError } from '../../Objects/CustomError';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../LoadingPage/Loading';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import CustomSnackbar from '../../components/CustomSnackbar';
import NewEntiy from './NewEntity';
import { ExistingEntity } from './ExistingEntity';
import Typography from '@mui/material/Typography';

export const Entities = () => {
    const [listOfEntities, setListOfEntities] = useState([])
    const navigate = useNavigate()
    const [pageLoading, setpageLoading] = useState(true)
    const appState = useAppStateContext();
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' });

    document.title = "Entities " + AppTitle
    console.log(listOfEntities)
    useEffect(() => {
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-entity-list', {
                method: "POST",
                redirect: 'follow',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'charset': 'UTF-8'
                },
                body: JSON.stringify({
                    projectName: appState.projectName,
                    locale: appState.selectedLanguage.locale,
                    email: appState.email,
                }),
                
            }).then(response => {

                if (response.status === 200) {
                    return response.json()
                }
                else {
                    throw new CustomError(response.status, response.statusText)
                }
            }).then((jsondata) => {
                if (jsondata.length !== 0) {
                    
                    
                    setListOfEntities(jsondata)

                }
            })
                .catch(error => {

                    console.log(error)
                    navigate('/error', { state: { error } })

                });
        }
        fetchdata()
        setpageLoading(false)

    }, [])

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }



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
        >
            <Box>
                <NewEntiy setSnackBarPayload={setSnackBarPayload}></NewEntiy>
                {listOfEntities.length === 0 &&
                    <Typography align='center' padding={3} variant={'subtitle1'}>No any Entities found.<br></br> You can create new entities by clicking the option above.</Typography>
                }
                <List>
                    {listOfEntities.length!==0 && listOfEntities.map((entity, entityIndex) => {
                        return <ListItem key={entityIndex}>
                            <ExistingEntity {...entity} setSnackBarPayload={setSnackBarPayload}></ExistingEntity>
                        </ListItem>
                    })
                    }
                </List>
            </Box>
            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
        </Box>

    );
}