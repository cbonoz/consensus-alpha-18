import { combineReducers } from 'redux'
import {
  CLASSIFICATION_CHECKBOX_CHANGE,
  REQUEST_SELECTED_STUDY,
  RECEIVE_SELECTED_STUDY,
  UPDATE_TEXT_AREA
} from './actions'
 
function selected_study(
  state = {
    current_study: {},
    requested: false
  },
  action
) {
  switch (action.type) {

    case CLASSIFICATION_CHECKBOX_CHANGE:
      const new_state = Object.assign({}, state)
			const {study} = new_state;
			const {rad_report} = study;
			const {class_scores} = rad_report;

			class_scores[action.index] = Object.assign(
				{},
				class_scores[action.index],
				{
					checked : !class_scores[action.index].checked
				})
			return new_state;

    case REQUEST_SELECTED_STUDY:
      return Object.assign({}, state, {
        requested: true,
				current_study  : {},
				next_study  : undefined,
				previous_study  : undefined,
      })
    case RECEIVE_SELECTED_STUDY:
      return Object.assign({}, state, action.study, {
        requested: false,
        received_at: action.received_at
      })
    case UPDATE_TEXT_AREA:
			var o = Object.assign({}, state)
			o["study"]["rad_report"]["text_fields"][action.index]["text"] = action.text
			console.log(o)
      return o
    default:
      return state
  }
}
 
export default selected_study
