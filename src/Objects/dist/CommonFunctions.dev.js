"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateKeyDownEvent = validateKeyDownEvent;
exports.isEmpty = isEmpty;

var _config = require("../config");

function validateKeyDownEvent(event) {
  if (!event.key.match(_config.regexNLP)) {
    event.preventDefault();
  }
} //function for checking not empty


function isEmpty(string) {
  return string.length === 0 ? true : false;
}