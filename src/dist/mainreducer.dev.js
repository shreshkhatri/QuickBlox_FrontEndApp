"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducer = reducer;
exports.ACTION_TYPES = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ACTION_TYPES = {
  SET_SELECTED_LANGUAGE: 'set_selected_language',
  SET_SETTINGS: 'set nlu model settings for the project',
  USER_LOGIN: 'set state loginstatus to true',
  USER_LOGOUT: 'user_logout',
  PAGE_LOADING: 'page_loading',
  PAGE_LOADED: 'page_loaded',
  SET_PROJECT: 'set_project',
  UNSET_PROJECT: 'unset_project',
  SET_TESTVAR: 'sets test var',
  INITIALIZE_NEW_QANDADATA: 'initializes schema for new QANDA data object',
  SET_NEW_QANDA_DATA_INTENT_NAME: 'sets intent Name for qanda data',
  SET_NEW_QANDA_DATA_DESCRIPTION: 'sets description for intent ',
  ADD_NEW_QANDA_DATA_UTTERANCE: 'sets utterances for intent',
  ADD_NEW_QAND_DATA_ANSWER: 'sets responses for intent data',
  DELETE_NEW_QANDA_DATA_UTTERANCE: 'sets utterances for intent',
  DELETE_NEW_QAND_DATA_ANSWER: 'sets responses for intent data',
  SET_NEW_QANDA_DATA_ACTION_NAME: 'sets action name for new qanda data',
  SET_NEW_QANDA_DATA_ACTION_CODE: 'sets action code for the action name'
};
exports.ACTION_TYPES = ACTION_TYPES;

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_SELECTED_LANGUAGE:
      return _objectSpread({}, state, {
        selectedLanguage: action.payload.selectedLanguage
      });

    case ACTION_TYPES.SET_SETTINGS:
      return _objectSpread({}, state, {
        settings: action.payload.settings
      });

    case ACTION_TYPES.USER_LOGIN:
      return _objectSpread({}, state, {
        loginstatus: true
      });

    case ACTION_TYPES.USER_LOGOUT:
      return {};

    case ACTION_TYPES.PAGE_LOADING:
      return _objectSpread({}, state, {
        page_loading: true
      });

    case ACTION_TYPES.PAGE_LOADED:
      return _objectSpread({}, state, {
        page_loading: false
      });

    case ACTION_TYPES.SET_PROJECT:
      return _objectSpread({}, state, {
        projectName: action.payload.projectName
      });

    case ACTION_TYPES.UNSET_PROJECT:
      return _objectSpread({}, state, {
        projectName: ''
      });

    case ACTION_TYPES.SET_TESTVAR:
      return _objectSpread({}, state, {
        testvar: (state.testvar || 0) + action.payload.testvar
      });

    default:
      throw new Error();
  }
}