import { useState, useEffect } from 'react';
import { Widget, addResponseMessage, renderCustomComponent, addUserMessage, toggleInputDisabled, addLinkSnippet, dropMessages } from 'react-chat-widget';
import { CustomButtonGroup, CustomTextField, EmailComponent } from './WidgetCustomComponents'
import { decode } from 'html-entities'
import CustomSnackbar from '../../components/CustomSnackbar';
import { useAppStateDispatch, useAppStateContext } from '../../ApplicationContextProvider'
import 'react-chat-widget/lib/styles.css';

export default function BotWidget({ props, children }) {
  const dispatch = useAppStateDispatch()
  const appState = useAppStateContext()
  const [conversationID, setConversationID] = useState('')
  const [botName, setBotName] = useState(decode(appState.hasOwnProperty('settings') && appState.settings.hasOwnProperty('botName') && appState.settings.botName ))
  const [snackBarPayload, setSnackBarPayload] = useState({ open: false, severity: '', message: '' })
  const [currentBotServerPort, setCurrentBotServerPort] = useState(appState.settings.hasOwnProperty('currentBotServerPort') && appState['settings']['currentBotServerPort'] || null)
  const [URL_GET_CONVERSATION_ID, setURL_GET_CONVERSATION_ID] = useState(`http://localhost:${currentBotServerPort}/directline/conversations`)
  const [COMMUNICATION_ENDPOINT, setCOMMUNICATION_ENDPOINT] = useState(`http://localhost:${currentBotServerPort}/directline/conversations/${conversationID}/activities`)
  


  useEffect(async () => {
    console.log('Obtaining a conversation ID')
    await getConversationID()
  }, [])

  async function getConversationID() {
    await fetch(URL_GET_CONVERSATION_ID, {
      method: "POST",
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'charset': 'UTF-8'
      },
      credentials: 'include'
    }).then(async response => {
      var json = await response.json()
      json.status = response.status
      return json
    }).then((jsondata) => {
      if (jsondata.status === 200) {
        setCOMMUNICATION_ENDPOINT(`http://localhost:${currentBotServerPort}/directline/conversations/${jsondata.conversationId}/activities`)
      }
      else {
        setSnackBarPayload({
          open: true,
          severity: "error",
          message: 'Server error occured while generating the conversation ID.'
        })
      }
    })
      .catch(error => {
        setSnackBarPayload({
          open: true,
          severity: "error",
          message: 'Connection failed while obtaining conversation ID for the ChatBot widget.'
        })
      });

  }

  function closeSnackbar() {
    setSnackBarPayload({ open: false, severity: 'info', message: '' })
  }

  //function to send mesage to the server
  async function sendMessage(message) {

    await fetch(COMMUNICATION_ENDPOINT, {
      method: "POST",
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'charset': 'UTF-8'
      },
      body: JSON.stringify({
        locale: 'en',
        text: message
      }),
      credentials:'include'
    }).then(async response => {
      var json = await response.json()
      json.status = response.status
      return json
    }).then((jsondata) => {
      console.log(jsondata)
      if (jsondata.status === 200) {
        if (jsondata.hasOwnProperty('activities') && jsondata.activities.length !== 0) {
          var conversation = jsondata.activities
          var index = 0;
          for (index; index < conversation.length; index++) {
            processActivity(conversation[index])
          }
        }
      }
      else {
        setSnackBarPayload({
          open: true,
          severity: "error",
          message: 'Sending message to server failed. Please try again later'
        })
      }

    })
      .catch(error => {
        setSnackBarPayload({
          open: true,
          severity: "error",
          message: 'Connection failed while sending message to the server. Please check your connection.'
        })
      });

  }


  //procecss each message activity
  function processActivity(activity) {

    if (activity.hasOwnProperty('type') && activity.type === 'message') {
      //ensuring that the activityhas text property
      if (activity.hasOwnProperty('text')) {
        addResponseMessage(activity.text)
      }
      //ensuring that the activity has payload property
      if (activity.hasOwnProperty('payload')) {
        processPayload(activity.payload)
      }
    }
  }

  //function to process payload present in payload field in activity
  function processPayload(payload) {
    if (payload && payload.length !== 0) {
      var elementTypeIndex = 0

      //processing each element array in payload array
      while (elementTypeIndex < payload.length) {
        console.log(payload[elementTypeIndex].type)
        switch (payload[elementTypeIndex].type) {
          //case for rendering button
          case 'button':
            toggleInputDisabled();
            payload[elementTypeIndex].handleMessageFromCustomComponent = handleMessageFromCustomComponent
            payload[elementTypeIndex].addUserMessage = addUserMessage
            renderCustomComponent(CustomButtonGroup, payload[elementTypeIndex])
            break;
          //case for rendering text field
          case 'email':
            toggleInputDisabled();
            payload[elementTypeIndex].handleMessageFromCustomComponent = handleMessageFromCustomComponent
            payload[elementTypeIndex].addUserMessage = addUserMessage
            renderCustomComponent(EmailComponent, payload[elementTypeIndex])
            break;
          case 'text':
            renderCustomComponent(CustomTextField, payload[elementTypeIndex])
            break;

          //case for rendering text field
          case 'link':
            if (payload[elementTypeIndex].hasOwnProperty('elements')) {
              payload[elementTypeIndex].elements.forEach(linkObject => {
                //using predefined function for rendering link object
                addLinkSnippet(linkObject)
              })
            }
            break;

          default:
            break;
        }
        elementTypeIndex++
      }


    }
  }

  function handleMessageFromCustomComponent(preDefinedMessageValue) {
    sendMessage(preDefinedMessageValue)
    toggleInputDisabled()
  }

  //function that will be triggered when the user sends the typed message on the widget
  function handleNewUserMessage(newMessage) {
    sendMessage(newMessage)

  }

  return (<>
    <Widget
      title={botName}
      handleNewUserMessage={handleNewUserMessage}
    />
    <CustomSnackbar snackBarPayload={snackBarPayload} closeSnackbar={closeSnackbar}></CustomSnackbar>
  </>

  )
}

