import { Routes, Route, useLocation } from 'react-router-dom'
import Error from './pages/ErrorPage/Error'
import HomePage from './pages/HomePage/Home'
import LoginPage from './pages/LoginPage/Login'
import { QandA } from './pages/QandAPage/QandA'
import { RouteProtection } from './RouteProtection'
import { Scripts } from './pages/ScriptsPage/Scripts'
import {Intents} from './pages/IntentsPage/Intent'
import { Entities } from './pages/EntitiesPage/Entities'
import { Botsettings } from './pages/BotsettingsPage/Botsettings'
import {CreateChatbotProject} from './pages/CreatePage/ChatbotProjectCreate'
import { DefaultThemeProvider } from './Theme'


export const App = () => {
  return (

    <Routes>
      <Route path='/' element={<RouteProtection><DefaultThemeProvider><HomePage /></DefaultThemeProvider></RouteProtection>}>
        <Route index element={<RouteProtection><DefaultThemeProvider><QandA /></DefaultThemeProvider></RouteProtection>} />
        <Route path='q&adata' element={<RouteProtection><DefaultThemeProvider><QandA /></DefaultThemeProvider></RouteProtection>} />
        <Route path='scripts' element={<RouteProtection><DefaultThemeProvider><Scripts /></DefaultThemeProvider></RouteProtection>} />
        <Route path='intents' element={<RouteProtection><DefaultThemeProvider><Intents /></DefaultThemeProvider></RouteProtection>} />
        <Route path='entities' element={<RouteProtection><DefaultThemeProvider><Entities /></DefaultThemeProvider></RouteProtection>} />
        <Route path='botsettings' element={<RouteProtection><DefaultThemeProvider><Botsettings /></DefaultThemeProvider></RouteProtection>} />
      </Route>
      <Route path='create-chatbot-project' element={<DefaultThemeProvider><CreateChatbotProject /></DefaultThemeProvider>} />
      <Route path='login' element={<DefaultThemeProvider><LoginPage></LoginPage></DefaultThemeProvider>} />
      <Route path='error' element={<DefaultThemeProvider><Error></Error></DefaultThemeProvider>} />

      <Route path='*' element={<h1>ERROR ! Page not found</h1>} />
    </Routes>
  )

}

