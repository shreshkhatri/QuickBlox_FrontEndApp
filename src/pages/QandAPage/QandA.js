import { useState, useEffect, useRef, useMemo } from 'react'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { AppTitle, SERVER_URL, regexNLP } from '../../config';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AlertDialog from '../../components/AlertDialog';
import { CustomError } from '../../Objects/CustomError';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../LoadingPage/Loading';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import NewQandAData from './NewQandAData';
import ExistingQandAData from './ExistingQandAdataItem';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { isEmpty } from '../../Objects/CommonFunctions';
import CustomSnackbar from '../../components/CustomSnackbar';

export const QandA = () => {
    const appState = useAppStateContext();
    const [loadingQandAdata, setLoadingQandAdata] = useState(false)
    const navigate = useNavigate()
    const [searching, setSearching] = useState(false)
    const [pageLoading, setpageLoading] = useState(true)
    const [listOfQandAdata, setListOfQandAdata] = useState([])
    const [memoisedListOfQandAdata, setMemoisedListOfQandAdata] = useState([])
    const [clicked, setClick] = useState(true)
    const containerRef = useRef(null);
    const searchBoxRef = useRef('')
    const [open, setOpen] = useState(true);
    const [openDialog, setOpenDialog] = useState(false)
    const [intentToDelete, setIntentToDelete] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [searchMode, setSearchMode] = useState(false)
    const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })
    const [numOfQandAdata, setNumOfQandAdata] = useState()
    const batchSize = 10
    const [numOfPages, setNumOfPages] = useState()
    console.log('num of pages', numOfPages)


    document.title = "Q&A data " + AppTitle

    //useeffect for getting the number of count of qanda dataset
    useEffect(() => {
        if (appState.hasOwnProperty('selectedLanguage')){
            getQandADatasetCount()
        }
    }, [appState])
    
    //use effect for getting number of count for intent data from the database
    async function getQandADatasetCount() {
        console.log('requerying')
        await fetch(SERVER_URL + '/get-qandadata-count', {
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
            credentials:'include'
        }).then(async (response) => {
            var json = await response.json()
            return { status: response.status, ...json }
        }).then((jsondata) => {
            console.log(jsondata)
            if (jsondata.status === 200) {
                if (jsondata.hasOwnProperty('datasetCount')) {
                    setNumOfQandAdata(jsondata.datasetCount)
                }
                else setNumOfQandAdata(0)
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
                        message: 'Connection error occured while retrieving number of QandA data items.'
                    }
                }
                )
            });
    }

    function closeSnackbar() {
        setSnackBarPayload({ open: false, severity: '', message: '' })
    }

    //useEffect for setting the page count
    useEffect(() => {
        setNumOfPages(Math.ceil(numOfQandAdata / batchSize))
    }, [numOfQandAdata])

    //useEffect for displaying the existing  qandA dataset for the selected language when the page
    //loads for the first time or is refreshed
    useEffect(() => {

        if (!appState.hasOwnProperty('settings')){
            return;
        }
        setLoadingQandAdata(true)
        const fetchdata = async () => {
            await fetch(SERVER_URL + '/get-qana-data', {
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
                credentials:'include'
            }).then(async response => {

                var json = await response.json()
                json.status = response.status
                return { status: response.status, json }

            }).then((response) => {
                if (response.status === 200) {
                    var jsondata = response.json.map(item => {
                        return { ...item, additionalUtterance: '', additionalAnswer: '', statechanged: false }
                    })

                    setListOfQandAdata(jsondata)
                    setLoadingQandAdata(false)
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
                            message: 'Connection error occured while retrieving list of QandA dataset.'
                        }
                    }
                    )
                });
        }

        fetchdata()

    }, [currentPage, numOfPages,appState])

    function handlePageChange(value) {
        setCurrentPage(value)
    }


    async function handleSearch() {
        if (typeof searchBoxRef.current !== 'string') { return }
        if (isEmpty(searchBoxRef.current)) { return }
        setLoadingQandAdata(true)
        setListOfQandAdata([])
        await fetch(SERVER_URL + '/search-qana-data', {
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
            credentials:'include'
        }).then(async response => {

            var json = await response.json()
            json.status = response.status
            return { status: response.status, json }
        }).then((response) => {
            if (response.status === 200) {
                var jsondata = response.json.map(item => {
                    return { ...item, additionalUtterance: '', additionalAnswer: '', statechanged: false }
                })
                setListOfQandAdata(jsondata)
                setNumOfQandAdata(jsondata.length)
                setLoadingQandAdata(false)
                setSearchMode(true)
            }
            else if (jsondata.status !== 200) {
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: jsondata.message
                })
                setLoadingQandAdata(false)
            }
        })
            .catch(error => {
                console.log(error)
                setSnackBarPayload({
                    open: true,
                    severity: "error",
                    message: 'Connection error occured while searching for the data, Please check your internet connection.'
                })
                setLoadingQandAdata(false)
            });
    }

    function setSearchString(searchText) {
        searchBoxRef.current = searchText
    }


    const memoisedNewQAndADataComp = useMemo(() => {
        return <NewQandAData></NewQandAData>
    }, [])

    useEffect(() => {

    }, [listOfQandAdata])

    //function to delete the intent
    function showDeletePrompt(intent) {
        setIntentToDelete(intent)
        setOpenDialog(true)
    }

    //function to delete an intent
    async function deleteIntentFromDatabase() {

        await fetch(SERVER_URL + '/delete-intent', {
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
                intent: intentToDelete
            }),
            credentials:'include'
        }).then(async response => {
            var json = await response.json()

            return { status: response.status, ...json }
        }).then(jsondata => {
            if (jsondata.status === 200) {

                setOpenDialog(false)
                deleteIntentFromList()
                setIntentToDelete('')
            }
            else {
                setOpenDialog(false)
                setIntentToDelete('')
                setSnackBarPayload({
                    open: true,
                    severity: jsondata.severity,
                    message: jsondata.message
                })
            }
        })
            .catch(error => {
                setOpenDialog(false)
                setIntentToDelete('')
                setSnackBarPayload({
                    open: true,
                    severity: 'error',
                    message: 'Connection error occured while deleting the intent from the database.'
                })
            });
    }


    //function to remove intent data from the list in memory
    function deleteIntentFromList() {
        var templistOfQandAdata = listOfQandAdata.filter(qandadata => qandadata.intent !== intentToDelete)
        setListOfQandAdata(templistOfQandAdata)
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
            {memoisedNewQAndADataComp}
            <br></br>
            <Typography align='left' sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>QandA dataset</Typography>
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
                        id="search-dataset"
                        label="Search dataset"
                        name="search-dataset"
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
                        <span>Search Q&A</span>
                    </LoadingButton>

                </Box>
                {!searchMode && listOfQandAdata.length === 0 &&
                    <Typography align='center' sx={{ typography: 'subtitle1', padding: 2 }}>No any dataset found.<br></br> Please create your dataset using above section</Typography>
                }
                {listOfQandAdata.length !== 0 &&
                    <Box sx={{ p: 1, m: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pagination count={numOfPages} variant="outlined" shape="rounded" page={currentPage} onChange={(e, value) => handlePageChange(value)} />
                        <Typography align='left' sx={{ typography: 'subtitle2' }}>{numOfQandAdata} entries found, showing max {batchSize} entries per page</Typography>
                    </Box>
                }

                {loadingQandAdata && <LoadingPage />}
                {!loadingQandAdata && listOfQandAdata.length !== 0 &&

                    <List>
                        {listOfQandAdata.map((qandadata, index) => {
                            return <ListItem key={index}>
                                <ExistingQandAData {...qandadata} showDeletePrompt={showDeletePrompt}></ExistingQandAData>
                            </ListItem>
                        })
                        }
                    </List>
                }

                {searchMode && listOfQandAdata.length === 0 &&

                    <Typography align='center' sx={{ typography: 'subtitle2', p: 2, m: 2 }}>No results found</Typography>
                }

            </Box>
            <AlertDialog
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                title={`Delete Intent - ${intentToDelete}`}
                displayMessage='Deleting intent will remove the intent and its response.'
                onConfirm={deleteIntentFromDatabase}
            ></AlertDialog>
            <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
        </Box>

    );
}