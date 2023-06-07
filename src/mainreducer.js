export const ACTION_TYPES = {
  SET_SELECTED_LANGUAGE: 'set_selected_language',
  SET_SETTINGS: 'set nlu model settings for the project',
  USER_LOGIN: 'set state loginstatus to true',
  USER_LOGOUT: 'user_logout',
  PAGE_LOADING: 'page_loading',
  PAGE_LOADED: 'page_loaded',
  SET_PROJECT: 'set_project',
  UNSET_PROJECT: 'unset_project',
  SET_TESTVAR: 'sets test var',
  SET_BOT_NAME: 'sets chatbot Name',
  SET_BOT_IS_TRAINED: 'sets model bot response',
  INITIALIZE_NEW_QANDADATA: 'initializes schema for new QANDA data object',
  SET_NEW_QANDA_DATA_INTENT_NAME:'sets intent Name for qanda data',
  SET_NEW_QANDA_DATA_DESCRIPTION:'sets description for intent ',
  ADD_NEW_QANDA_DATA_UTTERANCE:'sets utterances for intent',
  ADD_NEW_QAND_DATA_ANSWER:'sets responses for intent data',
  DELETE_NEW_QANDA_DATA_UTTERANCE:'sets utterances for intent',
  DELETE_NEW_QAND_DATA_ANSWER:'sets responses for intent data',
  SET_NEW_QANDA_DATA_ACTION_NAME:'sets action name for new qanda data',
  SET_NEW_QANDA_DATA_ACTION_CODE:'sets action code for the action name',
  MODEL_TRAINED_AT:'indicates model has been retrained',
  SET_MODEL_TRAINABLE:'sets boolean value indicating whether the chatbot model can be trained or not',
  SET_PROJECT_DATA_EDITABLE:'sets boolean value retrieved from the server indicating whether the project settings can be edited or not for the mdoel'
}


export function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_SELECTED_LANGUAGE:
      return { ...state, selectedLanguage: action.payload.selectedLanguage };
    case ACTION_TYPES.SET_SETTINGS:
      return { ...state, settings: action.payload.settings };
    case ACTION_TYPES.USER_LOGIN:
      return { ...state, loginstatus: true, useremail: action.payload.useremail };
    case ACTION_TYPES.USER_LOGOUT:
      return {};
    case ACTION_TYPES.PAGE_LOADING:
      return { ...state, page_loading: true }
    case ACTION_TYPES.PAGE_LOADED:
      return { ...state, page_loading: false }
    case ACTION_TYPES.SET_PROJECT:
      return { ...state, projectName: action.payload.projectName }
    case ACTION_TYPES.MODEL_TRAINED_AT:
      return { ...state, modelTrainedAt: action.payload.modelTrainedAt }
    case ACTION_TYPES.UNSET_PROJECT:
      return { ...state, projectName: '' }
    case ACTION_TYPES.SET_BOT_NAME:
      return { ...state, botName: action.payload.botName }
    case ACTION_TYPES.SET_BOT_IS_TRAINED:
      return { ...state, isBotTrained: action.payload.isBotTrained }
    case ACTION_TYPES.SET_MODEL_TRAINABLE:
      return { ...state, modelTrainable: action.payload.modelTrainable }
    case ACTION_TYPES.SET_PROJECT_DATA_EDITABLE:
      return { ...state, projectSettingsEditable: action.payload.projectSettingsEditable }
    case ACTION_TYPES.SET_TESTVAR:
      return { ...state, testvar: (state.testvar || 0) + action.payload.testvar }
    default:
      console.log(new Error())
      throw new Error();
  }
}

