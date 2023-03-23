"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function setAdditionalUtterance(dataIndex, additionalUtterance) {
  var tempListOfQandAdata;
  tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === dataIndex) {
      return _objectSpread({}, data, {
        additionalUtterance: additionalUtterance
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
}

function setAdditionalAnswer(dataIndex, additionalAnswer) {
  var tempListOfQandAdata;
  tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === dataIndex) {
      return _objectSpread({}, data, {
        additionalAnswer: additionalAnswer
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
} //function to add more utterance to the list of dataset


function appendUtterance(dataIndex) {
  if (listOfQandAdata[dataIndex].additionalUtterance.length === 0) {
    return;
  }

  var tempListOfQandAdata;
  tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === dataIndex) {
      return _objectSpread({}, data, {
        utterances: [].concat(_toConsumableArray(data.utterances), [listOfQandAdata[dataIndex].additionalUtterance]),
        statechanged: true,
        additionalUtterance: ''
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
} //function to add more answer to the list of the dataset


function appendAnswer(dataIndex) {
  if (listOfQandAdata[dataIndex].additionalAnswer.length === 0) {
    return;
  }

  var tempListOfQandAdata;
  tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === dataIndex) {
      return _objectSpread({}, data, {
        answers: [].concat(_toConsumableArray(data.answers), [listOfQandAdata[dataIndex].additionalAnswer]),
        statechanged: true,
        additionalAnswer: ''
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
} //function for updating the list of answers in existing QandA dataset


function updateAnswerInListOfQandAdata(datasetIndex, answerIndex, updatedAnswer) {
  var changeInAnswer = false;
  var newListOfAnswers = listOfQandAdata[datasetIndex].answers.map(function (answer, aidx) {
    if (answerIndex === aidx) {
      if (answer.toLowerCase() !== updatedAnswer.toLowerCase()) {
        changeInAnswer = true;
        return updatedAnswer.length === 0 ? ' ' : updatedAnswer;
      } else {
        return answer;
      }
    } else {
      return answer;
    }
  });
  var tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === datasetIndex && changeInAnswer === true) {
      return _objectSpread({}, data, {
        answers: newListOfAnswers,
        statechanged: true
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
} //function for updating list of utterances in existing QandA dataset


function updateUtteranceInListOfQandAdata(datasetIndex, utteranceIndex, updatedUtterance) {
  var changeInUtterance = false;
  var newListOfUtterances = listOfQandAdata[datasetIndex].utterances.map(function (utterance, uidx) {
    if (utteranceIndex === uidx) {
      if (utterance.toLowerCase() !== updatedUtterance.toLowerCase()) {
        changeInUtterance = true;
        return updatedUtterance.length === 0 ? ' ' : updatedUtterance;
      } else {
        return utterance;
      }
    } else {
      return utterance;
    }
  });
  var tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === datasetIndex && changeInUtterance === true) {
      return _objectSpread({}, data, {
        utterances: newListOfUtterances,
        statechanged: true
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
} //function for removing utterances from existing qanda data list


function removeUntteranceInListOfQandAdata(datasetIndex, utteranceIndex) {
  var newListOfUtterances = listOfQandAdata[datasetIndex].utterances.filter(function (utterance, uidx) {
    return uidx !== utteranceIndex;
  }); //the list must have atleast one utterance

  if (newListOfUtterances.length === 0) {
    return;
  }

  var tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === datasetIndex) {
      return _objectSpread({}, data, {
        utterances: newListOfUtterances,
        statechanged: true
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
} //function for removing answers from existing qanda data list


function removeAnswerInListOfQandAdata(datasetIndex, answerIndex) {
  var newListOfAnswers = listOfQandAdata[datasetIndex].answers.filter(function (answer, aidx) {
    return aidx !== answerIndex;
  }); //the list must have atleast one utterance

  if (newListOfAnswers.length === 0) {
    return;
  }

  var tempListOfQandAdata = listOfQandAdata.map(function (data, mainIndex) {
    if (mainIndex === datasetIndex) {
      return _objectSpread({}, data, {
        answers: newListOfAnswers,
        statechanged: true
      });
    } else {
      return _objectSpread({}, data);
    }
  });
  setListOfQandAdata(_toConsumableArray(tempListOfQandAdata));
}