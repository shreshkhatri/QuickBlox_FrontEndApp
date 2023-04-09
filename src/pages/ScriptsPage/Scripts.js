import { useState, useEffect, useRef, useMemo } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CustomError } from '../../Objects/CustomError';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../LoadingPage/Loading';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import NewScript from './NewScript';
import ExistingScript from './ExistingScript';
import AlertDialog from '../../components/AlertDialog';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Pagination from '@mui/material/Pagination';
import { isEmpty } from '../../Objects/CommonFunctions';
import CustomSnackbar from '../../components/CustomSnackbar';

export const Scripts = () => {
    const [loading, setLoading] = useState(false)
    const [loadingScriptData, setLoadingScriptData] = useState(false)
    const [searching, setSearching] = useState(false)
    const navigate = useNavigate()
    const [pageLoading, setpageLoading] = useState(false)
    const appState = useAppStateContext();
    const [listOfScripts, setListOfScripts] = useState([])
    const [clicked, setClick] = useState(true)
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })

    const containerRef = useRef(null);
    const searchBoxRef = useRef('');
    const [open, setOpen] = useState(true);
    const [searchMode, setSearchMode] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [numOfPages, setNumOfPages] = useState(1)
    const [scriptToDelete, setScriptToDelete] = useState('')
    const [numOfScripts, setNumOfScripts] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const batchSize = 10
    console.log(listOfScripts)

    document.title = "Scripts " + AppTitle

    //use effect for getting number of count for intent data from the database
    async function getScriptsCount() {
        await fetch(SERVER_URL + '/get-scripts-count', {
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
            }),
            credentials: 'include'
        }).then(async response => {
            var json = await response.json()
            return { status: response.status, ...json }
        }).then((jsondata) => {
            console.log(jsondata)
            if (jsondata.status === 200) {
                setNumOfScripts(jsondata.scriptsCount)
            }
            else {
                navigate('/error', { state: { ...jsondata } })
            }
        })
            .catch(error => {
                console.log(error)
                navigate('/error', {
                    state: {
                        status: '',
                        severity: 'error',
                        message: 'Connection error occured while retrieving count for Scripts.'
                    }
                }
                )
            });
    }
    //useeffect for getting the count of Script dataset
    useEffect(async () => {
        await getScriptsCount()
    }, [])


    //useEffect for setting the page count
    useEffect(() => {
        if (numOfScripts === 0) return
        setNumOfPages(Math.ceil(numOfScripts / batchSize))
    }, [numOfScripts])


    //useEffect for displaying the existing  qandA dataset for the selected language when the page
    //loads for the first time or is refreshed
    useEffect(() => {
        setLoadingScriptData(true)
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-script-data', {
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
                    currentPage: currentPage,
                    batchSize: batchSize
                }),
                credentials: 'include'
            }).then(async response => {
                var json = await response.json()
                return { status: response.status, json }
            }).then((jsondata) => {
                if (jsondata.status === 200) {
                    jsondata = jsondata.json.map(item => {
                        return { ...item, statechanged: false }
                    })
                    setListOfScripts(jsondata)
                    setLoadingScriptData(false)
                    setpageLoading(false)
                }
                else if (jsondata.status === 500) {
                    navigate('/error', { state: { ...jsondata } })
                }

            })
                .catch(error => {
                    console.log(error)
                    navigate('/error', {
                        state: {
                            status: '',
                            severity: 'error',
                            message: 'Connection error occured while retrieving list of scripts.'
                        }
                    }
                    )
                });
        }
        if (appState.hasOwnProperty('projectName') && appState.hasOwnProperty('selectedLanguage')) {
            fetchdata()
        }
    }, [currentPage, numOfPages])

    function setSearchString(searchText) {
        searchBoxRef.current = searchText
    }

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }


    function handlePageChange(value) {
        setCurrentPage(value)
    }

    async function handleSearch() {
        if (isEmpty(searchBoxRef.current)) { return }
        setLoadingScriptData(true)
        await fetch(SERVER_URL + '/search-script-data', {
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
                searchText: searchBoxRef.current
            }),
            credentials: 'include'
        }).then(async response => {
            var json = await response.json()
            return { status: response.status, json }
        })
            .then((jsondata) => {
                if (jsondata.status === 200) {
                    setListOfScripts(jsondata.json)
                    setNumOfScripts(jsondata.json.length)
                    setLoadingScriptData(false)
                    setSearchMode(true)
                }
                else if (jsondata.status !== 200) {
                    setSnackBarPayload({
                        open: true,
                        severity: "error",
                        message: jsondata.message
                    })
                    setLoadingScriptData(false)
                }

            })
            .catch(error => {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while searching for script data, Please check your internet connection.'
                })
                setLoadingScriptData(false)
            });
    }

    //function to delete an intent
    async function deleteScriptFromDatabase() {

        await fetch(SERVER_URL + '/delete-script', {
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
                scriptName: scriptToDelete
            }),
            credentials: 'include'
        }).then(async response => {
            var json = await response.json()
            return { status: response.status, ...json }
        }).then((response) => {
            if (response.status === 200) {
                setOpenDialog(false)
                deleteScriptFromList()
                setScriptToDelete('')
            }
            else {
                setOpenDialog(false)
                setScriptToDelete('')
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: response.message
                })
            }

        })
            .catch(error => {

                setOpenDialog(false)
                setScriptToDelete('')
                setSnackBarPayload({
                    open: true,
                    severity: 'error',
                    message: 'Connection error occured while deleting the script from the database.'
                })
            });
    }

    //function to remove intent data from the list in memory
    function deleteScriptFromList() {
        var tempListOfScripts = listOfScripts.filter(script => script.scriptName !== scriptToDelete)
        setListOfScripts(tempListOfScripts)
    }

    //function to delete the intent
    function showDeletePrompt(scriptName) {
        setScriptToDelete(scriptName)
        setOpenDialog(true)
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
            ref={containerRef}
        >
            <NewScript></NewScript>
            <br></br>

            <Box>

                <Box m={0} p={0} display="flex" sx={{
                    flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
                    alignItems: { xs: 'stretch', sm: 'stretch', md: 'center', lg: 'center' },

                }}>
                    <TextField
                        ref={searchBoxRef}
                        size='small'
                        margin="normal"
                        fullWidth
                        id="search-script"
                        label="Search Script"
                        name="search-script"
                        autoComplete='off'
                        onChange={e => setSearchString(e.target.value)}
                        autoFocus
                    />
                    <LoadingButton
                        sx={{
                            m: { md: 1, lg: 1 },
                        }}
                        size="small"
                        loading={searching}
                        loadingIndicator="Searching..."
                        variant="contained"
                        onClick={handleSearch}
                    >
                        <span>Search Script</span>
                    </LoadingButton>

                </Box>
                {!searchMode && listOfScripts.length === 0 &&
                    <Typography align='center' sx={{ typography: 'subtitle1', padding: 2 }}>No any scripts found.<br></br> Please create your script using above section</Typography>
                }
                {listOfScripts.length !== 0 &&
                    <Box sx={{ p: 1, m: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pagination count={numOfPages} variant="outlined" shape="rounded" page={currentPage} onChange={(e, value) => handlePageChange(value)} />
                        <Typography align='left' sx={{ typography: 'subtitle2' }}>{numOfScripts} entries found, showing max {batchSize} entries per page</Typography>
                    </Box>
                }

                {loadingScriptData && <LoadingPage />}
                {!loadingScriptData && listOfScripts.length !== 0 &&

                    <List>
                        {listOfScripts.map((scriptData, index) => {
                            return <ListItem key={index}>
                                <ExistingScript key={index} {...scriptData} showDeletePrompt={showDeletePrompt} />
                            </ListItem>
                        })
                        }
                    </List>
                }

                {searchMode && listOfScripts.length === 0 &&

                    <Typography align='center' sx={{ typography: 'subtitle2', p: 2, m: 2 }}>No results found</Typography>
                }

            </Box>
            <AlertDialog
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                title={`Delete Script - ${scriptToDelete}`}
                displayMessage='Deleting Script will remove the script entirely. The triggering intent will be unlinked.'
                onConfirm={deleteScriptFromDatabase}
            ></AlertDialog>
            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
        </Box>

    );
}