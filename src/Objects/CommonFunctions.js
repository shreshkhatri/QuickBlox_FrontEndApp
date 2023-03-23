import { regexNLP } from '../config'

//function to validate email address
export function validateEmail(email){
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

//function to validate keystroke
export function validateKeyDownEvent(event) {
    if (!event.key.match(regexNLP)) {
        event.preventDefault()
    }
}


//function for checking not empty
export function isEmpty(string) {
    if (typeof string !=="string") return
    return string.length === 0 ? true : false
}

//an approach to verfify if actionName has beeen used atleast twice inside the action code
export function checkIfActionCodeHasActionName(actionName, actionCode) {
  if (typeof actionCode === 'string' && typeof actionName === 'string' && actionName && actionCode) {
      const regex_actionName_const_definition = new RegExp(`const\\s+${actionName} `, 'g')
      const regex_actionName_var_definition = new RegExp(`var\\s+${actionName} `, 'g')
      const regex_actionName_let_definition = new RegExp(`let\\s+${actionName} `, 'g')
      const regex_actionName_export_definition = new RegExp(`module.exports\\s*=\\s*{\\s*${actionName}\\s*}`, 'g')
      
      const regex_actionName_const_definition_occuance_count = (actionCode.match(regex_actionName_const_definition) || []).length
      const regex_actionName_var_definition_occuance_count = (actionCode.match(regex_actionName_var_definition) || []).length
      const regex_actionName_let_definition_occuance_count = (actionCode.match(regex_actionName_let_definition) || []).length
      const regex_actionName_export_definition_occuance_count = (actionCode.match(regex_actionName_export_definition) || []).length

      if (
          (regex_actionName_const_definition_occuance_count === 1 ||
              regex_actionName_var_definition_occuance_count === 1 ||
              regex_actionName_let_definition_occuance_count === 1) &&
          regex_actionName_export_definition_occuance_count === 1
      ) {
          return true
      }
      return false
  }
}


