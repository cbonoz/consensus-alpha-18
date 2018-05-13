import {Config} from 'consts';
const _ = require('lodash');
const faker = require('faker');
const querystring = require('querystring');
export const CLASSIFICATION_CHECKBOX_CHANGE = 'CLASSIFICATION_CHECKBOX_CHANGE'
export const REQUEST_SELECTED_STUDY = 'REQUEST_SELECTED_STUDY'
export const RECEIVE_SELECTED_STUDY = 'RECEIVE_SELECTED_STUDY'
export const REQUEST_UPDATE_SELECTED_STUDY = 'REQUEST_UPDATE_SELECTED_STUDY'
export const SELECT_STUDY_LIST = 'SELECT_STUDY_LIST'
export const UPDATE_TEXT_AREA = 'UPDATE_TEXT_AREA'

import {fetchStudies} from '../../Studies/actions'

export function classificationCheckboxToggle(index) {
  return {type: CLASSIFICATION_CHECKBOX_CHANGE, index: index}
}

export function selectStudyList(selected_study_list) {
  return {type: SELECT_STUDY_LIST, selected_study_list: selected_study_list}
}

function requestSelectedStudy() {
  return {type: REQUEST_SELECTED_STUDY}
}

function requestUpdateSelectedStudy() {
  return {type: REQUEST_UPDATE_SELECTED_STUDY}
}

function receiveSelectedStudy(selected_study) {
  return {type: RECEIVE_SELECTED_STUDY, study: selected_study, received_at: Date.now()}
}

export function fetchSelectedStudy(study_id, offset) {
  return(dispatch, getState) => {
    dispatch(requestSelectedStudy());
    dispatch(fetchStudies());
    const state = getState();
    const {studies} = state;
    const {study_lists, selected_study_list} = studies;

    var user = {
      "user_id": faker.random.uuid()
    }
    var q = {
      status: selected_study_list
    }
    var url = Config.api_base_url + 'case/detail/' + user.user_id + "/" + study_id;
    url += "?" + querystring.stringify(q);

    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json()).then((res_json) => {

      _.mapValues(res_json, function(obj) {
        var {
          rad_report,
          class_scores
        } = obj;
        if (!rad_report) {
					obj["rad_report"] = {}
          obj["rad_report"]["class_scores"] = _.map(class_scores, function(class_score) {
            if (!class_score.checked) {
              class_score.checked = false;
            }
            return class_score;
          });

          const other_diseases = [
            "Pneumomediastinum (mediastinal emphysema)",
            "Clips, Medical devices (pacemaker, defibrillator or catheter.)",
            "Hilar enlargement",
            "Previous surgery, Postoperative changes, Rib resection",
            "Mediastinal and Hila",
            "Calcium deposits",
            "Rib or spine Fractures",
            "Aortic aneurysm, blood vessel problems or congenital heart disease",
            "Boney abnormalities",
            "Scarring",
            "Infection",
            "Elevated hilum",
            "Bronchial wall thickening",
            "Valve calcification",
            "Overinflated lungs",
            "Curvature of the spine",
            "Elevated diaphragm",
            "No findings"
          ]

          obj["rad_report"]["class_scores"].push.apply(obj["rad_report"]["class_scores"], _.map(other_diseases, function(o) {
            return {"class": o, "score": 0.0, "checked": false}
          }))

        }
				if (!obj["rad_report"]["text_fields"]) {
					obj["rad_report"]["text_fields"] = [
						// {"name" : "comparison", "text" : ""},
						// {"name" : "findings", "text" : ""},
						// {"name" : "technique", "text" : ""},
						// {"name" : "impression", "text" : ""},
						{"name" : "Other Comments", "text" : ""}
					]
				}
      })
      dispatch(receiveSelectedStudy(res_json));
    }).catch(function(error) {
      console.error(error)
    })
  }
}

export function updateSelectedStudy(study) {
  return(dispatch, getState) => {
    dispatch(requestUpdateSelectedStudy())
    var user = {
      "user_id": faker.random.uuid()
    }

    var url = Config.api_base_url + 'case/detail/rad_report/' + user.user_id;
    return fetch(url, {
      body: JSON.stringify(study),
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json()).then((res_json) => {
      dispatch(receiveSelectedStudy(res_json));
      dispatch(fetchStudies({}));
    }).catch(function(error) {
      console.error(error)
    })
  }
}

export function updateTextArea(idx, txt) {
  return {type: UPDATE_TEXT_AREA, index: idx, text: txt}
}
