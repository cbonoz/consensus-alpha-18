import { combineReducers } from 'redux'
import {
  REQUEST_STUDIES,
  RECEIVE_STUDIES,
  RECEIVE_TRADES,
  SELECT_STUDY_LIST
} from './actions'
 
function studies(
  state = {
    study_list_loading: true,
    selected_study_list: "all",
    study_lists: {},
    trades: []
  },
  action
) {
  switch (action.type) {
    case REQUEST_STUDIES:
      return Object.assign({}, state, {
        study_list_loading: true
      })
    case RECEIVE_TRADES:
      return Object.assign({}, state, {
        trades: action.trades,
        received_at: action.received_at
      })
    case RECEIVE_STUDIES:
			state["study_lists"][action.study_list_label] = {
				"list" : action.items,
				"total_count" : action.total_count,
				"page_offset" : action.page_offset
			}
      return Object.assign({}, state, {
        study_list_loading: false,
        received_at: action.received_at
      })
    case SELECT_STUDY_LIST:
      var xx = Object.assign({}, state, {
        selected_study_list: action.selected_study_list
      })
			return xx;
    default:
      return state
  }
}
 
export default studies
