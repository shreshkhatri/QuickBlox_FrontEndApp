import { useEffect, useState, useMemo } from 'react';
import {decode} from 'html-entities';
import { useCookies } from 'react-cookie';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Language, Tune, QuestionAnswer, Description, FormatListBulleted, Code, KeyboardDoubleArrowLeft, Logout } from '@mui/icons-material';
import { Link, Outlet } from "react-router-dom";
import LanguageSelector from './LanguageSelector';
import Grid from '@material-ui/core/Grid';
import { ACTION_TYPES } from '../../mainreducer'
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppTitle, SERVER_URL } from '../../config';
import BotWidget from '../ChatbotWidget/BotWidget';
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    height: '100%',
    overflow: 'auto',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function HomePage() {

  const theme = useTheme()
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'useremail'])
  const dispatch = useAppStateDispatch()
  const appState = useAppStateContext()
  document.title = "Home " + AppTitle
  const navigate = useNavigate()
  console.log('App State:', appState)

  const memoizedBotWidget=useMemo(()=>{
    return <BotWidget>{appState.modelTrainedAt}</BotWidget>
  },[appState.hasOwnProperty('modelTrainedAt') && appState.modelTrainedAt])

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    removeCookie('access_token')
    removeCookie('useremail')
    dispatch({ type: ACTION_TYPES.USER_LOGOUT })

    return <Navigate to="/" replace />;
  }
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open} theme={theme} >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Chatobot Management Portal
            </Typography>
            <div style={{ marginLeft: 'auto' }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open} sx={{ backgroundColor: theme.palette.primary.main }}>
          <DrawerHeader>
            <Typography variant="h6" style={{ paddingRight: '20%' }}>
              {decode(appState.projectName)}
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              <KeyboardDoubleArrowLeft />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem key="100" disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <Language />
                </ListItemIcon>
                <ListItemText primary="Language" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>

            </ListItem>
            <ListItem key="101" disablePadding sx={{ display: 'block' }} className="px-4 pb-4">
              <LanguageSelector />
            </ListItem>

            {[{ menu: 'Q&A Data', icon: <QuestionAnswer />, link: 'q&adata' },
            { menu: 'Scripts', icon: <Description />, link: 'scripts' },
            { menu: 'Unlinked Intents', icon: <FormatListBulleted />, link: 'intents' },
            { menu: 'Entities', icon: <Code />, link: 'entities' },
            { menu: 'Settings', icon: <Tune />, link: 'botsettings' }]
              .map((item, index) => (

                <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                  <Link to={item.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItemButton
                      sx={{
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.menu} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </Link>
                </ListItem>

              ))}
            <ListItem key="102" disablePadding sx={{ display: 'block' }} onClick={logout}>
              <ListItemButton
                sx={{
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}

                >
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Log Out" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>

            </ListItem>

          </List>
          <Divider />
        </Drawer>
        <DrawerHeader />
        <Box component="main" sx={{ flexGrow: 1, p: 5 }}>

          <Grid container >
            <Grid item xs={12} sm={12} md={12} lg={12} style={{ paddingTop: '2rem' }}>

              <Outlet />

            </Grid>

          </Grid>
        </Box>

      </Box>
      {memoizedBotWidget}
    </>
  );
}

